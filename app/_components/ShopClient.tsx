'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from './CartProvider'
import Footer from './Footer'
import { createClient } from '@/lib/supabase/browser'

export type PublicProduct = {
  id: string
  name_fr: string
  name_tw: string
  origin: string
  unit_price: number
  unit_label: string
  description: string | null
  image_url: string | null
  visible_instock: boolean
  has_price_range: boolean
  preference_options: string[]
  stock_quantity?: number | null  // only present for instock products
  created_at: string
}

export type Channel = 'instock' | 'flash'

type Hero = {
  zh: string
  fr: string
}

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

function Placeholder({ name }: { name: string }) {
  return (
    <div className="w-full h-full bg-midnight flex items-center justify-center">
      <span className="text-yellow text-4xl font-bold select-none">{name[0]}</span>
    </div>
  )
}

function flyToCartIcon(sourceEl: HTMLElement) {
  const cartIcon = document.querySelector('[data-cart-icon]')
  if (!cartIcon) return

  const sr = sourceEl.getBoundingClientRect()
  const tr = cartIcon.getBoundingClientRect()
  const sx = sr.left + sr.width / 2
  const sy = sr.top + sr.height / 2
  const ex = tr.left + tr.width / 2
  const ey = tr.top + tr.height / 2

  const dot = document.createElement('div')
  Object.assign(dot.style, {
    position: 'fixed',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#FACA31',
    zIndex: '9999',
    pointerEvents: 'none',
    left: `${sx - 6}px`,
    top: `${sy - 6}px`,
  })
  document.body.appendChild(dot)

  const duration = 520
  const start = performance.now()

  function frame(now: number) {
    const t = Math.min((now - start) / duration, 1)
    const x = sx + (ex - sx) * t
    const y = sy + (ey - sy) * t - 60 * Math.sin(Math.PI * t)
    const fade = t > 0.72 ? 1 - (t - 0.72) / 0.28 : 1
    dot.style.left = `${x - 6}px`
    dot.style.top = `${y - 6}px`
    dot.style.opacity = String(fade)
    dot.style.transform = `scale(${fade})`
    if (t < 1) requestAnimationFrame(frame)
    else dot.remove()
  }

  requestAnimationFrame(frame)
}

// ── Product card ──

function ProductCard({ product, channel }: { product: PublicProduct; channel: Channel }) {
  const [qty, setQty] = useState(1)
  const { addToCart, cart } = useCart()
  const addBtnRef = useRef<HTMLButtonElement>(null)
  const inCart = cart[product.id] ?? 0
  const maxAdditional = product.stock_quantity != null
    ? Math.max(0, product.stock_quantity - inCart)
    : Infinity

  const handleAdd = () => {
    addToCart(product.id, qty, { ...product, channel })
    if (addBtnRef.current) flyToCartIcon(addBtnRef.current)
    setQty(1)
  }

  return (
    <div className="flex flex-col sm:flex-row bg-white border border-midnight/10 rounded-2xl overflow-hidden">
      {/* Image — full-width on top on small screens, 60% of the card on the left from sm+ */}
      <div className="relative h-56 w-full sm:h-auto sm:w-3/5 shrink-0">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={`${product.name_tw} · ${product.name_fr}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 60vw, (max-width: 1024px) 60vw, 460px"
          />
        ) : (
          <Placeholder name={product.name_tw} />
        )}
        {product.stock_quantity != null && (
          <span className={`absolute bottom-2 left-2 lg:bottom-3 lg:left-3 text-[0.6rem] lg:text-xs font-bold px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-full ${
            product.stock_quantity <= 3
              ? 'bg-magenta text-white'
              : 'bg-midnight/60 text-white'
          }`}>
            剩 {product.stock_quantity} 個
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 lg:p-6 min-w-0">
        <p className="text-xl font-semibold text-midnight leading-tight">{product.name_tw}</p>
        <p className="text-base font-semibold text-midnight/75 leading-tight mt-0.5">{product.name_fr}</p>
        <p className="text-xs lg:text-sm text-midnight/55 uppercase tracking-widest mt-1.5">產地: {product.origin}</p>

        {product.description && (
          <p className="text-sm text-midnight/55 leading-relaxed mt-2 whitespace-pre-line">{product.description}</p>
        )}

        <p className="text-base lg:text-xl font-bold text-midnight mt-auto pt-3">
          {product.has_price_range && (
            <span className="text-[0.62rem] lg:text-sm font-normal text-midnight/45 mr-1">至多</span>
          )}
          {centsToEur(product.unit_price)} €
          <span className="text-[0.62rem] lg:text-sm font-normal text-midnight/45 ml-1">/ {product.unit_label}</span>
        </p>

        {/* Qty toggle — own row */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-11 h-11 lg:w-14 lg:h-14 rounded-full border border-midnight/20 flex items-center justify-center text-midnight text-base lg:text-lg font-bold hover:bg-midnight hover:text-yellow hover:border-midnight transition-colors [touch-action:manipulation]"
          >
            −
          </button>
          <span className="w-6 lg:w-8 text-center text-base lg:text-lg font-bold text-midnight tabular-nums">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(maxAdditional, q + 1))}
            disabled={qty >= maxAdditional}
            className="w-11 h-11 lg:w-14 lg:h-14 rounded-full border border-midnight/20 flex items-center justify-center text-midnight text-base lg:text-lg font-bold hover:bg-midnight hover:text-yellow hover:border-midnight transition-colors disabled:opacity-30 disabled:cursor-not-allowed [touch-action:manipulation]"
          >
            +
          </button>
          {inCart > 0 && (
            <span className="ml-auto text-[0.6rem] lg:text-xs text-midnight/40 tabular-nums">{inCart} ✓</span>
          )}
        </div>

        {/* Ajouter — own row */}
        <button
          ref={addBtnRef}
          onClick={handleAdd}
          disabled={maxAdditional <= 0}
          className="mt-3 w-full bg-midnight text-yellow text-sm lg:text-base font-bold uppercase tracking-wide py-3 lg:py-4 rounded-lg hover:bg-yellow hover:text-midnight transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed [touch-action:manipulation]"
        >
          {maxAdditional <= 0 ? '已售完 · Épuisé' : '加入購物車 · Ajouter'}
        </button>
      </div>
    </div>
  )
}

// ── Main page component ──

export default function ShopClient({ products: initialProducts, hero, channel }: { products: PublicProduct[]; hero?: Hero; channel: Channel }) {
  const [products, setProducts] = useState(initialProducts)

  // Live stock counts: subscribe to the public broadcast a DB trigger sends on
  // every stock_quantity change (see migration/07_stock_broadcast.sql). Only
  // products that arrived with a stock_quantity (i.e. in-stock, not preorder) are
  // tracked, so a broadcast for a preorder-only product id can't spuriously add
  // a stock_quantity field where the product intentionally has none.
  useEffect(() => {
    const cappedIds = new Set(
      initialProducts.filter(p => p.stock_quantity != null).map(p => p.id),
    )
    if (cappedIds.size === 0) return

    const supabase = createClient()
    const channel = supabase
      .channel('products:stock')
      .on('broadcast', { event: 'stock_update' }, ({ payload }) => {
        if (!cappedIds.has(payload.id)) return
        setProducts(prev =>
          prev.map(p => (p.id === payload.id ? { ...p, stock_quantity: payload.stock_quantity } : p)),
        )
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [initialProducts])

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Alert */}
      {hero && (
        <section className="px-4 sm:px-6 pt-8">
          <div className="max-w-3xl mx-auto rounded-2xl border border-midnight/10 bg-yellow px-6 py-5">
            <p className="text-midnight font-semibold leading-relaxed mb-1">{hero.zh}</p>
            <p className="text-midnight font-semibold text-sm leading-relaxed mb-4">{hero.fr}</p>
            <Link
              href="/comment-ca-marche"
              className="inline-block text-xs font-semibold uppercase tracking-wider text-midnight/60 border-2 border-midnight/20 rounded-full px-4 py-2 hover:bg-midnight hover:text-yellow hover:border-midnight transition-colors"
            >
              閱讀購買規則 · Comment ça marche
            </Link>
          </div>
        </section>
      )}

      {/* Product grid */}
      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {products.length === 0 ? (
            <p className="text-midnight/30 text-center text-sm tracking-widest uppercase py-24">
              目前無商品 · Aucun produit disponible
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products.map(p => (
                <ProductCard key={p.id} product={p} channel={channel} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer className="mt-auto" />
    </main>
  )
}
