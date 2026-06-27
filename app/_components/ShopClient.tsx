'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from './CartProvider'

export type PublicProduct = {
  id: string
  name_fr: string
  name_tw: string
  origin: string
  unit_price: number
  unit_label: string
  description: string | null
  image_url: string | null
  available: boolean
  stock_quantity?: number | null  // only present for instock products
  created_at: string
}

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
      <span className="text-orange text-4xl font-bold select-none">{name[0]}</span>
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
    background: '#FFA630',
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

// ── Detail content shared by mobile modal and desktop panel ──

function DetailContent({
  product,
  onClose,
}: {
  product: PublicProduct
  onClose: () => void
}) {
  const [qty, setQty] = useState(1)
  const { addToCart, cart } = useCart()
  const addBtnRef = useRef<HTMLButtonElement>(null)
  const inCart = cart[product.id] ?? 0
  const maxAdditional = product.stock_quantity != null
    ? Math.max(0, product.stock_quantity - inCart)
    : Infinity

  const handleAdd = () => {
    addToCart(product.id, qty, product)
    if (addBtnRef.current) flyToCartIcon(addBtnRef.current)
    setQty(1)
    onClose()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Image */}
      <div className="relative h-52 shrink-0">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name_fr}
            fill
            className="object-cover"
            sizes="400px"
          />
        ) : (
          <Placeholder name={product.name_tw} />
        )}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-midnight/70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-midnight transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 overflow-y-auto p-6">
        <p className="text-xs text-midnight/45 mb-0.5">{product.name_fr}</p>
        <h2 className="text-xl font-bold text-midnight mb-1">{product.name_tw}</h2>
        <p className="text-xs text-midnight/35 uppercase tracking-widest mb-5">{product.origin}</p>

        {product.description && (
          <p className="text-sm text-midnight/65 leading-relaxed mb-6">{product.description}</p>
        )}

        <p className="text-xl font-bold text-midnight mt-auto">
          {centsToEur(product.unit_price)} €
          <span className="text-sm font-normal text-midnight/45 ml-1">/ {product.unit_label}</span>
        </p>

        {/* Qty toggle */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-full border-2 border-midnight/20 flex items-center justify-center text-midnight font-bold hover:bg-midnight hover:text-orange hover:border-midnight transition-colors"
          >
            −
          </button>
          <span className="w-6 text-center font-bold text-midnight tabular-nums">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(maxAdditional, q + 1))}
            disabled={qty >= maxAdditional}
            className="w-8 h-8 rounded-full border-2 border-midnight/20 flex items-center justify-center text-midnight font-bold hover:bg-midnight hover:text-orange hover:border-midnight transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
          {inCart > 0 && (
            <span className="ml-auto text-xs text-midnight/40 tabular-nums">{inCart} au panier</span>
          )}
        </div>

        {/* Add button */}
        <button
          ref={addBtnRef}
          onClick={handleAdd}
          disabled={maxAdditional <= 0}
          className="mt-3 w-full bg-midnight text-orange font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-orange hover:text-midnight transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {maxAdditional <= 0 ? 'Stock épuisé · 已售完' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  )
}

// ── Product card (horizontal) ──

function ProductCard({
  product,
  onSelect,
}: {
  product: PublicProduct
  onSelect: () => void
}) {
  const [qty, setQty] = useState(1)
  const { addToCart, cart } = useCart()
  const addBtnRef = useRef<HTMLButtonElement>(null)
  const inCart = cart[product.id] ?? 0
  const maxAdditional = product.stock_quantity != null
    ? Math.max(0, product.stock_quantity - inCart)
    : Infinity

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product.id, qty, product)
    if (addBtnRef.current) flyToCartIcon(addBtnRef.current)
    setQty(1)
  }

  return (
    <div
      className="flex flex-col sm:flex-row bg-white border border-midnight/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onSelect}
    >
      {/* Image — full-width on mobile (col), fixed-width on sm+ (row) */}
      <div className="relative h-44 w-full sm:h-auto sm:w-44 shrink-0">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name_fr}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 176px"
          />
        ) : (
          <Placeholder name={product.name_tw} />
        )}
        {product.stock_quantity != null && (
          <span className={`absolute bottom-2 left-2 text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${
            product.stock_quantity <= 3
              ? 'bg-magenta text-white'
              : 'bg-midnight/60 text-white'
          }`}>
            剩 {product.stock_quantity} 個
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 min-w-0">
        <p className="text-[0.62rem] text-midnight/45 leading-tight truncate">{product.name_fr}</p>
        <p className="text-base font-bold text-midnight leading-tight mt-0.5">{product.name_tw}</p>
        <p className="text-[0.6rem] text-midnight/35 uppercase tracking-widest mt-0.5">{product.origin}</p>

        <p className="text-base font-bold text-midnight mt-auto pt-3">
          {centsToEur(product.unit_price)} €
          <span className="text-[0.62rem] font-normal text-midnight/45 ml-1">/ {product.unit_label}</span>
        </p>

        {/* Qty toggle — own row */}
        <div
          className="flex items-center gap-1.5 mt-2"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-6 h-6 rounded-full border border-midnight/20 flex items-center justify-center text-midnight text-xs font-bold hover:bg-midnight hover:text-orange hover:border-midnight transition-colors"
          >
            −
          </button>
          <span className="w-5 text-center text-sm font-bold text-midnight tabular-nums">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(maxAdditional, q + 1))}
            disabled={qty >= maxAdditional}
            className="w-6 h-6 rounded-full border border-midnight/20 flex items-center justify-center text-midnight text-xs font-bold hover:bg-midnight hover:text-orange hover:border-midnight transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
          {inCart > 0 && (
            <span className="ml-auto text-[0.6rem] text-midnight/40 tabular-nums">{inCart} ✓</span>
          )}
        </div>

        {/* Ajouter — own row */}
        <button
          ref={addBtnRef}
          onClick={handleAdd}
          disabled={maxAdditional <= 0}
          className="mt-2 w-full bg-midnight text-orange text-[0.65rem] font-bold uppercase tracking-wide py-1.5 rounded-lg hover:bg-orange hover:text-midnight transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {maxAdditional <= 0 ? '已售完' : 'Ajouter'}
        </button>
      </div>
    </div>
  )
}

// ── Main page component ──

export default function ShopClient({ products, hero }: { products: PublicProduct[]; hero?: Hero }) {
  const [selected, setSelected] = useState<PublicProduct | null>(null)

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Hero */}
      {hero && (
        <section
          className="bg-orange px-8 py-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #FFCD8B 2.5px, transparent 2.5px)',
            backgroundSize: '28px 28px',
          }}
        >
          <div className="max-w-3xl mx-auto">
            <p className="text-midnight font-bold leading-relaxed mb-1">{hero.zh}</p>
            <p className="text-midnight/65 text-sm leading-relaxed mb-3">{hero.fr}</p>
            <Link
              href="/comment-acheter"
              className="inline-block text-xs text-midnight/60 underline underline-offset-2 hover:text-midnight transition-colors"
            >
              閱讀購買規則 · Lire les conditions d&apos;achat →
            </Link>
          </div>
        </section>
      )}

      {/* Product grid */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        {products.length === 0 ? (
          <p className="text-midnight/30 text-center text-sm tracking-widest uppercase py-24">
            Aucun produit disponible · 目前無商品
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onSelect={() => setSelected(p)} />
            ))}
          </div>
        )}
      </section>

      {/* Desktop: transparent click-away overlay */}
      {selected && (
        <div
          className="hidden lg:block fixed inset-0 z-30"
          onClick={() => setSelected(null)}
        />
      )}

      {/* Desktop: slide-in panel from right, starts below nav (~58px) */}
      <div
        className={`hidden lg:flex fixed right-0 top-[58px] h-[calc(100vh-58px)] w-[400px] bg-white border-l border-midnight/10 shadow-2xl z-40 flex-col overflow-hidden transition-transform duration-300 ease-in-out ${
          selected ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selected && (
          <DetailContent product={selected} onClose={() => setSelected(null)} />
        )}
      </div>

      {/* Mobile: modal overlay */}
      {selected && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/70 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <DetailContent product={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}

      <footer className="bg-midnight text-center px-8 py-10 text-sm text-white/40 tracking-[0.08em] leading-loose mt-auto">
        <p className="text-white/70">Chez Jambes Courtes · Paris</p>
        <p className="mt-2 opacity-50">© 2025 · Mentions légales · 隱私政策</p>
      </footer>
    </main>
  )
}
