'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from './CartProvider'

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

const MIN_ORDER_CENTS = 1600

export default function CartPanel() {
  const { cart, products, removeFromCart, updateQty, isCartOpen, closeCart } = useCart()

  // rendered: panel exists in DOM; visible: CSS transition "open" state
  const [rendered, setRendered] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isCartOpen) {
      setRendered(true)
      // Defer one frame so the browser paints the panel before we trigger the transition
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    } else {
      setVisible(false)
      // Unmount after the CSS transition (300ms) finishes
      const t = setTimeout(() => setRendered(false), 300)
      return () => clearTimeout(t)
    }
  }, [isCartOpen])

  if (!rendered) return null

  const items = Object.entries(cart).filter(([, qty]) => qty > 0)
  const subtotal = items.reduce((sum, [id, qty]) => sum + (products[id]?.unit_price ?? 0) * qty, 0)
  const belowMinimum = subtotal < MIN_ORDER_CENTS

  const instockItems = items.filter(([id]) => products[id]?.channel === 'instock')
  const preorderItems = items.filter(([id]) => products[id]?.channel === 'flash')
  const hasBoth = instockItems.length > 0 && preorderItems.length > 0

  function renderCartItem(id: string, qty: number) {
    const p = products[id]
    if (!p) return null
    const maxQty = p.stock_quantity != null ? p.stock_quantity : Infinity
    return (
      <div key={id} className="flex items-center gap-3 py-4 border-b border-midnight/10">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-midnight text-sm leading-tight mt-0.5">{p.name_tw} {p.name_fr}</p>
          <p className="text-sm text-midnight/55 mt-0.5">{centsToEur(p.unit_price)} € / {p.unit_label}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => updateQty(id, qty - 1)}
            className="w-6 h-6 rounded-full border border-midnight/20 flex items-center justify-center text-midnight text-xs font-bold hover:bg-midnight hover:text-yellow hover:border-midnight transition-colors"
          >
            −
          </button>
          <span className="w-5 text-center text-sm font-bold text-midnight tabular-nums">{qty}</span>
          <button
            onClick={() => updateQty(id, Math.min(maxQty, qty + 1))}
            disabled={qty >= maxQty}
            className="w-6 h-6 rounded-full border border-midnight/20 flex items-center justify-center text-midnight text-xs font-bold hover:bg-midnight hover:text-yellow hover:border-midnight transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        <p className="text-sm font-bold text-midnight tabular-nums shrink-0 w-14 text-right">
          {centsToEur(p.unit_price * qty)} €
        </p>

        <button
          onClick={() => removeFromCart(id)}
          className="text-midnight/25 hover:text-midnight transition-colors shrink-0 text-sm leading-none ml-1"
          aria-label="Retirer"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-midnight/40 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeCart}
      />

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 h-[88vh] rounded-t-2xl sm:rounded-none sm:left-auto sm:right-0 sm:top-[58px] sm:h-[calc(100vh-58px)] sm:w-[400px] bg-white border-t sm:border-t-0 sm:border-l border-midnight/10 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          visible ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-midnight/10 shrink-0">
          <h2 className="font-bold text-midnight tracking-tight">Panier · 購物車</h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center text-midnight/35 hover:text-midnight rounded-full hover:bg-midnight/5 transition-colors"
            aria-label="Fermer le panier"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {items.length === 0 ? (
            <p className="text-midnight/30 text-sm tracking-widest uppercase text-center py-20">
              Panier vide · 購物車是空的
            </p>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.14em] text-midnight/40 font-bold pt-4 pb-1">
                {instockItems.length > 0 ? '現貨 · En stock' : '快閃 · Flash'}
              </p>
              {items.map(([id, qty]) => renderCartItem(id, qty))}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-midnight/10 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-midnight/50">Sous-total</p>
              <p className="font-bold text-midnight tabular-nums">{centsToEur(subtotal)} €</p>
            </div>
            <div className="relative">
              {belowMinimum ? (
                <button
                  type="button"
                  className="peer block w-full bg-midnight text-yellow font-bold text-sm uppercase tracking-wider py-4 rounded-xl text-center opacity-50 cursor-not-allowed"
                >
                  Confirmer · 前往結帳 →
                </button>
              ) : (
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-midnight text-yellow font-bold text-sm uppercase tracking-wider py-4 rounded-xl hover:bg-yellow hover:text-midnight transition-colors duration-200 text-center"
                >
                  Confirmer · 前往結帳 →
                </Link>
              )}

              {belowMinimum && (
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-midnight text-white text-xs rounded-xl whitespace-nowrap opacity-0 peer-hover:opacity-100 peer-focus:opacity-100 peer-active:opacity-100 transition-opacity duration-150 text-center leading-relaxed z-10">
                  必須訂至少兩顆水果
                  <br />
                  <span className="text-white/60 text-[10px]">Il faut commander au moins 2 fruits</span>
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-midnight" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
