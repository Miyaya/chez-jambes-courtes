import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPreorderReceivedEmail, sendInstockOrderReceivedEmail } from '@/lib/email'

type PaymentMethod = 'stripe' | 'virement' | 'pay_on_pickup'
const MAX_PAY_ON_PICKUP_CENTS = 5000
type Channel = 'instock' | 'flash'
type CartItem = { id: string; qty: number; preference?: string }
type Customer = {
  nom: string
  prenom: string
  email: string
  phone?: string
  line_username?: string
  pickup_slot_id?: string | null
  note?: string
  payment_method: PaymentMethod
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
  preference: string | null
  capped: boolean
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { cartItems, customer, channel, partialAllowed }: {
    cartItems: CartItem[]
    customer: Customer
    channel: Channel
    partialAllowed?: boolean
  } = body

  if (!Array.isArray(cartItems) || cartItems.length === 0)
    return NextResponse.json({ error: 'Panier vide · 購物車是空的' }, { status: 400 })

  if (channel !== 'instock' && channel !== 'flash')
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })

  if (channel === 'flash' && typeof partialAllowed !== 'boolean')
    return NextResponse.json({ error: 'Veuillez choisir une option en cas de rupture · 請選擇缺貨時的處理方式' }, { status: 400 })

  for (const item of cartItems) {
    if (!item.id || !Number.isInteger(item.qty) || item.qty <= 0)
      return NextResponse.json({ error: 'Données du panier invalides · 購物車資料有誤' }, { status: 400 })
  }

  if (!customer?.prenom?.trim() || !customer?.nom?.trim() || !customer?.email?.trim())
    return NextResponse.json({ error: 'Nom et email requis · 請填寫姓名和 Email' }, { status: 400 })

  const supabase = createAdminClient()

  // Fetch server-authoritative prices and stock — never trust client amounts
  const { data: dbProducts, error: dbError } = await supabase
    .from('products')
    .select('id, name_fr, name_tw, unit_price, promo_price, promo_until, unit_label, visible_instock, visible_flash, stock_quantity, preference_options')
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
  // The channel the whole cart checks out through decides the rules — never the
  // raw stock_quantity value. Carts never mix channels (each product page only
  // adds items tagged with its own channel; checkout/page.tsx derives one channel
  // for the whole order and the client can't add items from two pages at once).
  const isPreorder = channel === 'flash'

  for (const cartItem of cartItems) {
    const product = dbProducts.find(p => p.id === cartItem.id)
    if (!product)
      return NextResponse.json({ error: 'Produit introuvable · 找不到商品' }, { status: 400 })

    const visibleOnChannel = channel === 'instock' ? product.visible_instock : product.visible_flash
    if (!visibleOnChannel)
      return NextResponse.json(
        { error: `${product.name_fr} n'est plus disponible · 商品已下架` },
        { status: 400 },
      )

    // Instock checkout: always capped by real stock, even at 0 (sold out).
    // Flash/preorder checkout: never capped — the raw stock_quantity value on a
    // flash-only product (e.g. left over from before it was flash-only) doesn't
    // apply here, sourcing happens later at the market.
    if (channel === 'instock' && cartItem.qty > product.stock_quantity)
      return NextResponse.json(
        {
          error: `Stock insuffisant pour ${product.name_fr} · ${product.name_tw} 庫存不足（剩 ${product.stock_quantity} ${product.unit_label} ）請回到上一頁調整數量`,
        },
        { status: 400 },
      )

    // Validate preference against the product's allowed options
    const options: string[] = Array.isArray(product.preference_options) ? product.preference_options : []
    let preference: string | null = null
    if (options.length > 0) {
      if (!cartItem.preference || !options.includes(cartItem.preference))
        return NextResponse.json(
          { error: `Veuillez choisir une option pour ${product.name_fr} · 請為 ${product.name_tw} 選擇一個選項` },
          { status: 400 },
        )
      preference = cartItem.preference
    }

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
          description: `${cartItem.qty} × ${product.unit_label}${preference ? ` · ${preference}` : ''}`,
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
      preference,
      capped: channel === 'instock',
    })
  }

  const subtotal = itemsSnapshot.reduce((sum, i) => sum + i.line_total, 0)
  const paymentMethod: PaymentMethod = customer.payment_method ?? 'stripe'

  if (paymentMethod === 'pay_on_pickup' && subtotal > MAX_PAY_ON_PICKUP_CENTS)
    return NextResponse.json(
      { error: `Paiement à la livraison indisponible au-delà de ${(MAX_PAY_ON_PICKUP_CENTS / 100).toFixed(2)}€ · 訂單超過 ${(MAX_PAY_ON_PICKUP_CENTS / 100).toFixed(2)}€ 恕不接受面交付款` },
      { status: 400 },
    )

  // create_order_with_stock reserves stock (row-locked, per product) and inserts the
  // order in one transaction — the earlier stock_quantity check above is only an
  // optimistic pre-check for a fast error message; this call is the actual gate that
  // prevents two concurrent checkouts from both winning the last unit.
  const { data: rpcData, error: orderError } = await supabase
    .rpc('create_order_with_stock', {
      p_items: itemsSnapshot,
      p_subtotal: subtotal,
      p_status: isPreorder ? 'received_preorder' : 'received_instock',
      p_payment_method: paymentMethod,
      p_pickup_slot_id: customer.pickup_slot_id || null,
      p_customer_prenom: customer.prenom.trim(),
      p_customer_nom: customer.nom.trim(),
      p_customer_email: customer.email.trim().toLowerCase(),
      p_customer_phone: customer.phone?.trim() || null,
      p_line_username: customer.line_username?.trim() || null,
      p_note: customer.note?.trim() || null,
      p_partial_allowed: channel === 'flash' ? partialAllowed : null,
    })
    .single()

  const order = rpcData as { id: string; tracking_token: string } | null

  if (orderError || !order) {
    const match = orderError?.message.match(/insufficient_stock:([0-9a-f-]+)/i)
    if (match) {
      const product = dbProducts.find(p => p.id === match[1])
      return NextResponse.json(
        {
          error: product
            ? `Stock insuffisant pour ${product.name_fr} · ${product.name_tw} 庫存不足（剩 ${product.stock_quantity} ${product.unit_label}）`
            : 'Stock insuffisant · 庫存不足',
        },
        { status: 409 },
      )
    }
    console.error('[checkout] order insert error:', orderError)
    return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 })
  }

  // Non-Stripe: send confirmation email immediately and return tracking token
  if (paymentMethod !== 'stripe') {
    let pickupSlotLabel: string | null = null
    let pickupSlotLocation: string | null = null
    if (customer.pickup_slot_id) {
      const { data: slot } = await supabase
        .from('pickup_slots')
        .select('label, location')
        .eq('id', customer.pickup_slot_id)
        .single()
      pickupSlotLabel = slot?.label ?? null
      pickupSlotLocation = slot?.location ?? null
    }
    const emailData = {
      customer_prenom: customer.prenom.trim(),
      customer_nom: customer.nom.trim(),
      customer_email: customer.email.trim().toLowerCase(),
      items: itemsSnapshot,
      subtotal,
      tracking_token: order.tracking_token,
      pickup_slot_label: pickupSlotLabel,
      pickup_slot_location: pickupSlotLocation,
    }

    // Must be awaited: on Cloudflare Workers, a fire-and-forget promise left running
    // after the Response is returned can get torn down with the isolate before the
    // Resend request ever completes — unlike a Node server, there's no guarantee the
    // event loop keeps spinning post-response.
    try {
      const sendPromise = isPreorder
        ? sendPreorderReceivedEmail({ ...emailData, payment_method: paymentMethod })
        : sendInstockOrderReceivedEmail(emailData)
      await sendPromise
      await supabase.from('orders').update({ confirmation_email_sent: true }).eq('id', order.id)
    } catch (err) {
      console.error('[email] order confirmation failed:', err)
    }

    return NextResponse.json({ token: order.tracking_token, method: paymentMethod })
  }

  // Stripe flow
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
        // Preorder (flash) items aren't sourced yet — only pre-authorize, and
        // capture later once the order is validated (see commandes/actions.ts).
        // In-stock items ship immediately, so they're charged immediately too.
        capture_method: isPreorder ? 'manual' : 'automatic',
      },
      locale: 'fr',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/merci/commande?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
      // Stock is reserved the moment this order was created (create_order_with_stock
      // above) — 30 minutes is Stripe's minimum allowed expiry, so an abandoned
      // in-stock cart holds reserved stock hostage for as short a window as possible.
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    })
  } catch (stripeErr) {
    console.error('[checkout] stripe error:', stripeErr)
    // Restore stock before deleting — restore_stock_for_order reads the item
    // snapshot off the order row, so it must run while the row still exists.
    const { error: restoreError } = await supabase.rpc('restore_stock_for_order', { p_order_id: order.id })
    if (restoreError) console.error('[checkout] restore_stock_for_order failed:', restoreError)
    await supabase.from('orders').delete().eq('id', order.id)
    return NextResponse.json({ error: 'Erreur de paiement · 付款服務發生錯誤' }, { status: 500 })
  }

  await supabase.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id)
  return NextResponse.json({ url: session.url })
}
