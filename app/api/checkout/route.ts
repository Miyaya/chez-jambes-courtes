import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

type CartItem = { id: string; qty: number }
type Customer = {
  name: string
  email: string
  phone?: string
  pickup_slot_id?: string | null
  note?: string
}

type ItemSnapshot = {
  product_id: string
  name_fr: string
  name_tw: string
  unit_label: string
  unit_price: number
  promo_price: number | null
  qty: number
  line_total: number
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { cartItems, customer }: { cartItems: CartItem[]; customer: Customer } = body

  if (!Array.isArray(cartItems) || cartItems.length === 0)
    return NextResponse.json({ error: 'Panier vide · 購物車是空的' }, { status: 400 })

  for (const item of cartItems) {
    if (!item.id || !Number.isInteger(item.qty) || item.qty <= 0)
      return NextResponse.json({ error: 'Données du panier invalides · 購物車資料有誤' }, { status: 400 })
  }

  if (!customer?.name?.trim() || !customer?.email?.trim())
    return NextResponse.json({ error: 'Nom et email requis · 請填寫姓名和 Email' }, { status: 400 })

  const supabase = createAdminClient()

  // Fetch server-authoritative prices and stock — never trust client amounts
  const { data: dbProducts, error: dbError } = await supabase
    .from('products')
    .select('id, name_fr, name_tw, unit_price, promo_price, promo_until, unit_label, available, stock_quantity')
    .in(
      'id',
      cartItems.map(i => i.id),
    )

  if (dbError || !dbProducts) {
    console.error('[checkout] products fetch error:', dbError)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  const now = new Date()
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
  const itemsSnapshot: ItemSnapshot[] = []

  for (const cartItem of cartItems) {
    const product = dbProducts.find(p => p.id === cartItem.id)
    if (!product)
      return NextResponse.json({ error: 'Produit introuvable · 找不到商品' }, { status: 400 })
    if (!product.available)
      return NextResponse.json(
        { error: `${product.name_fr} n'est plus disponible · 商品已下架` },
        { status: 400 },
      )
    // stock_quantity = 0 means pre-order (no stock cap); > 0 means in-stock with a hard limit
    if (product.stock_quantity > 0 && cartItem.qty > product.stock_quantity)
      return NextResponse.json(
        {
          error: `Stock insuffisant pour ${product.name_fr} · ${product.name_tw} 庫存不足（剩 ${product.stock_quantity} ${product.unit_label}）`,
        },
        { status: 400 },
      )

    const effectivePrice =
      product.promo_price != null &&
      product.promo_until != null &&
      new Date(product.promo_until) > now
        ? product.promo_price
        : product.unit_price

    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${product.name_tw} · ${product.name_fr}`,
          description: `${cartItem.qty} × ${product.unit_label}`,
        },
        unit_amount: effectivePrice,
      },
      quantity: cartItem.qty,
    })

    itemsSnapshot.push({
      product_id: product.id,
      name_fr: product.name_fr,
      name_tw: product.name_tw,
      unit_label: product.unit_label,
      unit_price: product.unit_price,
      promo_price: product.promo_price ?? null,
      qty: cartItem.qty,
      line_total: effectivePrice * cartItem.qty,
    })
  }

  const subtotal = itemsSnapshot.reduce((sum, i) => sum + i.line_total, 0)

  // Create pending order in Supabase first — gets us an order ID to reference in Stripe metadata
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      items: itemsSnapshot,
      subtotal,
      status: 'pending',
      pickup_slot_id: customer.pickup_slot_id || null,
      customer_name: customer.name.trim(),
      customer_email: customer.email.trim().toLowerCase(),
      customer_phone: customer.phone?.trim() || null,
      note: customer.note?.trim() || null,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('[checkout] order insert error:', orderError)
    return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 })
  }

  // Create Stripe Checkout Session
  // Uses Stripe.createFetchHttpClient() for Cloudflare Workers compatibility
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    httpClient: Stripe.createFetchHttpClient(),
  })

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: customer.email.trim().toLowerCase(),
      metadata: { order_id: order.id },
      payment_intent_data: {
        description: 'Chez Jambes Courtes',
      },
      locale: 'fr',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/merci/commande?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    })
  } catch (stripeErr) {
    console.error('[checkout] stripe error:', stripeErr)
    // Remove the pending order so it doesn't litter the DB
    await supabase.from('orders').delete().eq('id', order.id)
    return NextResponse.json({ error: 'Erreur de paiement · 付款服務發生錯誤' }, { status: 500 })
  }

  // Link the Stripe session back to the order
  await supabase.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id)

  return NextResponse.json({ url: session.url })
}
