import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

// Releases stock reserved by create_order_with_stock (see app/api/checkout/route.ts)
// when a Stripe Checkout Session expires without payment — the default expiry is
// 24h after creation, so this is what unblocks stock for an abandoned in-stock cart.
export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    httpClient: Stripe.createFetchHttpClient(),
  })

  const signature = request.headers.get('stripe-signature')
  const payload = await request.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.expired') return NextResponse.json({ received: true })

  const session = event.data.object as Stripe.Checkout.Session
  const orderId = session.metadata?.order_id
  if (!orderId) return NextResponse.json({ received: true })

  const supabase = createAdminClient()

  // Conditional update acts as the lock: only the request that actually flips the
  // status (out of the still-pending states) gets to restore stock, so a webhook
  // retry or a race with an admin cancellation can't double-restore.
  const { data: locked } = await supabase
    .from('orders')
    .update({ status: 'canceled', cancel_reason: 'Session Stripe expirée · Stripe 結帳連結逾時' })
    .eq('id', orderId)
    .in('status', ['received_instock', 'received_preorder'])
    .select('id')
    .single()

  if (locked) {
    const { error } = await supabase.rpc('restore_stock_for_order', { p_order_id: orderId })
    if (error) console.error('[stripe-webhook] restore_stock_for_order failed:', error)
  }

  return NextResponse.json({ received: true })
}
