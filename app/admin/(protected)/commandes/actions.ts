'use server'

import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReadyForPickupEmail, sendOrderCompleteEmail, sendOrderCanceledEmail } from '@/lib/email'

type OrderStatus = 'received_preorder' | 'received_instock' | 'validated' | 'partial_validated' | 'complete' | 'canceled'
type OrderFlag = 'shortage' | 'contact_needed' | 'postponed' | 'others' | 'no_show'
type PaymentMethod = 'stripe' | 'virement' | 'pay_on_pickup' | 'cash_on_pickup' | 'card_on_pickup'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    httpClient: Stripe.createFetchHttpClient(),
  })
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus, cancelReason?: string, emailNote?: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('customer_prenom, customer_nom, customer_email, customer_phone, items, subtotal, discount_amount, total_amount, payment_method, stripe_session_id, tracking_token, created_at, pickup_slots(label, slot_at, location)')
    .eq('id', orderId)
    .single()

  // Preorder Stripe payments are pre-authorized only (capture_method: manual) —
  // validating the order is what actually charges the customer, canceling releases
  // the authorization (promised to customers as immediate in the CGV). Both happen
  // before the status write so a Stripe failure blocks the status change instead of
  // silently leaving the order in an inconsistent state (money never collected, or
  // an authorization left dangling on a canceled order).
  if (
    (status === 'validated' || status === 'partial_validated' || status === 'canceled') &&
    order?.payment_method === 'stripe' && order.stripe_session_id
  ) {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id)
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id
    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      if (paymentIntent.status === 'requires_capture') {
        if (status === 'canceled') {
          await stripe.paymentIntents.cancel(paymentIntentId)
        } else {
          await stripe.paymentIntents.capture(paymentIntentId, { amount_to_capture: order.total_amount })
        }
      }
    }
  }

  // Conditional filter doubles as an idempotency lock: only restores stock the first
  // time an order is canceled (a webhook expiry and an admin cancel can't double-restore).
  const { data: canceled } = status === 'canceled'
    ? await supabase
        .from('orders')
        .update({ status, cancel_reason: cancelReason ?? null })
        .eq('id', orderId)
        .neq('status', 'canceled')
        .select('id')
        .single()
    : { data: null }

  // order_number is assigned by a DB trigger exactly when status flips to 'complete'
  // (see migration/08_order_number_on_complete.sql) — must read it back from the
  // update, not from the row fetched above, which predates the trigger firing.
  let completedOrderNumber: string | null = null
  if (status !== 'canceled') {
    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select('order_number')
      .single()
    if (updateError) throw new Error(updateError.message)
    completedOrderNumber = updated?.order_number ?? null
  } else if (canceled) {
    const { error } = await supabase.rpc('restore_stock_for_order', { p_order_id: orderId })
    if (error) console.error('[order] restore_stock_for_order failed:', error)
  }

  // Flip the "New" badge off — no-op if the customer never created an account
  // (guest checkout doesn't have a row in `customers`).
  if (status === 'complete' && order) {
    await supabase.from('customers').update({ has_complete_order: true }).eq('email', order.customer_email)
  }

  revalidatePath('/admin/commandes')
  revalidatePath('/admin/clients')

  if (status !== 'validated' && status !== 'partial_validated' && status !== 'complete' && status !== 'canceled') return
  if (!order) return

  // @ts-expect-error — Supabase nested select returns object not array
  const slot = order.pickup_slots as { label: string; slot_at: string; location: string | null } | null
  const emailData = {
    customer_prenom: order.customer_prenom,
    customer_nom: order.customer_nom,
    customer_email: order.customer_email,
    items: order.items,
    subtotal: order.subtotal,
    tracking_token: order.tracking_token,
    pickup_slot_label: slot?.label ?? null,
    pickup_slot_location: slot?.location ?? null,
  }

  const trimmedEmailNote = emailNote?.trim() || null

  try {
    if (status === 'validated' || status === 'partial_validated') {
      await sendReadyForPickupEmail({ ...emailData, admin_note: trimmedEmailNote })
    } else if (status === 'complete' && completedOrderNumber) {
      await sendOrderCompleteEmail({
        ...emailData,
        order_number: completedOrderNumber,
        customer_phone: order.customer_phone,
        discount_amount: order.discount_amount,
        total_amount: order.total_amount,
        payment_method: order.payment_method as PaymentMethod | null,
        created_at: order.created_at,
        pickup_slot_at: slot?.slot_at ?? null,
        admin_note: trimmedEmailNote,
      })
    } else if (status === 'canceled' && cancelReason) {
      await sendOrderCanceledEmail({ ...emailData, cancel_reason: cancelReason })
    }
  } catch (err) {
    console.error('[email] order status email failed:', err)
  }
}

export async function updateFlagAction(orderId: string, flag: OrderFlag | null) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('orders').update({ flag }).eq('id', orderId)
  revalidatePath('/admin/commandes')
}

export async function updatePaymentMethodAction(orderId: string, paymentMethod: PaymentMethod | null) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('orders').update({ payment_method: paymentMethod }).eq('id', orderId)
  revalidatePath('/admin/commandes')
}

export async function updatePickupSlotAction(orderId: string, pickupSlotId: string | null) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('orders').update({ pickup_slot_id: pickupSlotId }).eq('id', orderId)
  revalidatePath('/admin/commandes')
  revalidatePath('/admin/pickup')
}

type OrderItem = {
  product_id: string
  name_fr: string
  name_tw: string
  unit_label: string
  unit_price: number
  promo_price: number | null
  qty: number
  line_total: number
  preference: string | null
}

export async function updateOrderItemsAction(orderId: string, items: OrderItem[]) {
  await requireAdmin()
  const supabase = createAdminClient()
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
  await supabase.from('orders').update({ items, subtotal }).eq('id', orderId)
  revalidatePath('/admin/commandes')
}

async function getPaymentIntentForOrder(orderId: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('orders')
    .select('stripe_session_id')
    .eq('id', orderId)
    .single()
  if (!order?.stripe_session_id) throw new Error('No Stripe session for this order')
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id)
  if (!session.payment_intent || typeof session.payment_intent !== 'string')
    throw new Error('No payment intent on session')
  return session.payment_intent
}

export async function captureStripePaymentAction(orderId: string) {
  const paymentIntentId = await getPaymentIntentForOrder(orderId)
  await getStripe().paymentIntents.capture(paymentIntentId)
  revalidatePath('/admin/commandes')
}

export async function voidStripePaymentAction(orderId: string) {
  const paymentIntentId = await getPaymentIntentForOrder(orderId)
  await getStripe().paymentIntents.cancel(paymentIntentId)
  revalidatePath('/admin/commandes')
}
