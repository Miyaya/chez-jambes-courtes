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

  await supabase
    .from('orders')
    .update(status === 'canceled' ? { status, cancel_reason: cancelReason ?? null } : { status })
    .eq('id', orderId)
  revalidatePath('/admin/commandes')

  if (status !== 'validated' && status !== 'partial_validated' && status !== 'complete' && status !== 'canceled') return

  const { data: order } = await supabase
    .from('orders')
    .select('order_number, customer_prenom, customer_nom, customer_email, items, subtotal, tracking_token, pickup_slots(label, location)')
    .eq('id', orderId)
    .single()
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
