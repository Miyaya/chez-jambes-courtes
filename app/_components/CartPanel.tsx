'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

export default function CartPanel() {
  const { cart, products, removeFromCart, updateQty, isCartOpen, closeCart } = useCart()

  const items = Object.entries(cart).filter(([, qty]) => qty > 0)
  const subtotal = items.reduce((sum, [id, qty]) => sum + (products[id]?.unit_price ?? 0) * qty, 0)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-midnight/40 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-[58px] h-[calc(100vh-58px)] w-full sm:w-[400px] bg-white border-l border-midnight/10 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
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
            items.map(([id, qty]) => {
              const p = products[id]
              if (!p) return null
              const maxQty = p.stock_quantity != null ? p.stock_quantity : Infinity
              return (
                <div key={id} className="flex items-center gap-3 py-4 border-b border-midnight/8">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-midnight/40 truncate">{p.name_fr}</p>
                    <p className="font-bold text-midnight text-sm leading-tight mt-0.5">{p.name_tw}</p>
                    <p className="text-xs text-midnight/35 mt-0.5">{centsToEur(p.unit_price)} € / {p.unit_label}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQty(id, qty - 1)}
                      className="w-6 h-6 rounded-full border border-midnight/20 flex items-center justify-center text-midnight text-xs font-bold hover:bg-midnight hover:text-orange hover:border-midnight transition-colors"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-midnight tabular-nums">{qty}</span>
                    <button
                      onClick={() => updateQty(id, Math.min(maxQty, qty + 1))}
                      disabled={qty >= maxQty}
                      className="w-6 h-6 rounded-full border border-midnight/20 flex items-center justify-center text-midnight text-xs font-bold hover:bg-midnight hover:text-orange hover:border-midnight transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-midnight/10 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-midnight/50">Sous-total</p>
              <p className="font-bold text-midnight tabular-nums">{centsToEur(subtotal)} €</p>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-midnight text-orange font-bold text-sm uppercase tracking-wider py-4 rounded-xl hover:bg-orange hover:text-midnight transition-colors duration-200 text-center"
            >
              Confirmer · 前往結帳 →
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
