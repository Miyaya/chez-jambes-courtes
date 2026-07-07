'use server'

import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReadyForPickupEmail, sendOrderCompleteEmail, sendOrderCanceledEmail } from '@/lib/email'

type OrderStatus = 'received_preorder' | 'received_instock' | 'validated' | 'partial_validated' | 'complete' | 'canceled'
type OrderFlag = 'shortage' | 'contact_needed' | 'postponed' | 'others' | 'no_show'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    httpClient: Stripe.createFetchHttpClient(),
  })
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus, cancelReason?: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('order_number, customer_prenom, customer_nom, customer_email, items, subtotal, total_amount, payment_method, stripe_session_id, tracking_token, pickup_slots(label, location)')
    .eq('id', orderId)
    .single()

  // Preorder Stripe payments are pre-authorized only (capture_method: manual) —
  // validating the order is what actually charges the customer. Capture happens
  // before the status write so a Stripe failure blocks the status change instead
  // of silently leaving an order marked "validated" with money never collected.
  if ((status === 'validated' || status === 'partial_validated') && order?.payment_method === 'stripe' && order.stripe_session_id) {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id)
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id
    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      if (paymentIntent.status === 'requires_capture') {
        await stripe.paymentIntents.capture(paymentIntentId, { amount_to_capture: order.total_amount })
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

  if (status !== 'canceled') {
    await supabase.from('orders').update({ status }).eq('id', orderId)
  } else if (canceled) {
    const { error } = await supabase.rpc('restore_stock_for_order', { p_order_id: orderId })
    if (error) console.error('[order] restore_stock_for_order failed:', error)
  }
  revalidatePath('/admin/commandes')

  if (status !== 'validated' && status !== 'partial_validated' && status !== 'complete' && status !== 'canceled') return
  if (!order) return

  // @ts-expect-error — Supabase nested select returns object not array
  const slot = order.pickup_slots as { label: string; location: string | null } | null
  const emailData = {
    order_number: order.order_number,
    customer_prenom: order.customer_prenom,
    customer_nom: order.customer_nom,
    customer_email: order.customer_email,
    items: order.items,
    subtotal: order.subtotal,
    tracking_token: order.tracking_token,
    pickup_slot_label: slot?.label ?? null,
    pickup_slot_location: slot?.location ?? null,
  }

  try {
    if (status === 'validated' || status === 'partial_validated') {
      await sendReadyForPickupEmail(emailData)
    } else if (status === 'complete') {
      await sendOrderCompleteEmail(emailData)
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
