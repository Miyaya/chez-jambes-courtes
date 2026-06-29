'use server'

import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

type OrderStatus = 'received' | 'accepted' | 'processing' | 'validated' | 'partial_validated' | 'complete' | 'canceled'
type OrderFlag = 'shortage' | 'contact_needed' | 'postponed' | 'others' | 'no_show'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    httpClient: Stripe.createFetchHttpClient(),
  })
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('orders').update({ status }).eq('id', orderId)
  revalidatePath('/admin/commandes')
}

export async function updateFlagAction(orderId: string, flag: OrderFlag | null) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('orders').update({ flag }).eq('id', orderId)
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
