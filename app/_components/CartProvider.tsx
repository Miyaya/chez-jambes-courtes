'use client'

import { createContext, useContext, useState } from 'react'

export type CartProduct = {
  name_tw: string
  name_fr: string
  unit_price: number
  unit_label: string
  stock_quantity?: number | null
}

type CartContextType = {
  cart: Record<string, number>
  products: Record<string, CartProduct>
  addToCart: (id: string, qty: number, product: CartProduct) => void
  removeFromCart: (id: string) => void
  updateQty: (id: string, qty: number) => void
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

  return (
    <CartContext.Provider value={{
      cart, products, addToCart, removeFromCart, updateQty, cartTotal,
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
