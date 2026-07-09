'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'

export type CartProduct = {
  name_tw: string
  name_fr: string
  unit_price: number
  unit_label: string
  stock_quantity?: number | null
  preference_options?: string[]
  channel: 'instock' | 'flash'
}

type CartContextType = {
  cart: Record<string, number>
  products: Record<string, CartProduct>
  addToCart: (id: string, qty: number, product: CartProduct) => void
  removeFromCart: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  cartTotal: number
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [products, setProducts] = useState<Record<string, CartProduct>>({})
  const [isCartOpen, setIsCartOpen] = useState(false)

  const cartTotal = Object.values(cart).reduce((a, b) => a + b, 0)

  const addToCart = (id: string, qty: number, product: CartProduct) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] ?? 0) + qty }))
    setProducts(prev => ({ ...prev, [id]: product }))
  }

  const removeFromCart = (id: string) =>
    setCart(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })

  const updateQty = (id: string, qty: number) =>
    setCart(prev => {
      if (qty <= 0) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: qty }
    })

  const clearCart = () => {
    setCart({})
    setProducts({})
  }

  // Live stock counts for whatever's in the cart, so the checkout page (and cart
  // panel) reflect stock changes too — same broadcast ShopClient listens to
  // (see migration/07_stock_broadcast.sql), just applied to cart products instead
  // of the full catalog. Only touches products already tracked in state, so a
  // broadcast for a product never added to a cart is a no-op.
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('products:stock')
      .on('broadcast', { event: 'stock_update' }, ({ payload }) => {
        setProducts(prev => {
          if (!(payload.id in prev)) return prev
          return { ...prev, [payload.id]: { ...prev[payload.id], stock_quantity: payload.stock_quantity } }
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <CartContext.Provider value={{
      cart, products, addToCart, removeFromCart, updateQty, clearCart, cartTotal,
      isCartOpen, openCart: () => setIsCartOpen(true), closeCart: () => setIsCartOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
