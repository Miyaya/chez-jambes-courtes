'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useCart } from './CartProvider'
import { createClient } from '@/lib/supabase/browser'

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function BurgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [burgerOpen, setBurgerOpen] = useState(false)
  const burgerRef = useRef<HTMLDivElement>(null)
  const { cartTotal, openCart } = useCart()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const el = document.scrollingElement ?? document.documentElement
    const check = () => setScrolled(el.scrollTop > 10)
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (burgerRef.current && !burgerRef.current.contains(e.target as Node)) setBurgerOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const dropdownBg = scrolled ? 'bg-dark-green border-white/10' : 'bg-green border-midnight/10'
  const dropdownItem = scrolled ? 'text-white hover:bg-white/10' : 'text-midnight hover:bg-midnight/10'

  return (
    <header className={`relative z-50 transition-colors duration-300 ${scrolled ? 'bg-dark-green' : 'bg-green'}`}>
      <div className="mx-auto w-full max-w-xl px-8 pt-4 pb-3 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        <Link
          href="/"
          className={`text-base font-bold tracking-[0.14em] uppercase transition-colors duration-300 text-center md:text-left ${scrolled ? 'text-white' : 'text-midnight'}`}
        >
          Chez Jambes Courtes
        </Link>

        <div className="flex items-center gap-3 justify-end md:justify-start w-full md:w-auto">
          {/* Flash */}
          <Link
            href="/flash"
            className={`text-sm font-bold tracking-[0.1em] px-4 py-1.5 rounded-full border-2 transition-colors duration-300 ${
              scrolled
                ? 'border-white text-white hover:bg-white hover:text-dark-green'
                : 'border-midnight text-midnight hover:bg-midnight hover:text-green'
            }`}
          >
            Flash
          </Link>

          {/* Cart */}
          <button
            data-cart-icon
            onClick={openCart}
            className={`relative transition-colors duration-300 ${scrolled ? 'text-white' : 'text-midnight'}`}
            aria-label={`Panier — ${cartTotal} article${cartTotal !== 1 ? 's' : ''}`}
          >
            <CartIcon />
            {cartTotal > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-magenta text-white text-[0.6rem] font-bold min-w-[1.1rem] h-[1.1rem] px-0.5 rounded-full flex items-center justify-center leading-none">
                {cartTotal > 99 ? '99+' : cartTotal}
              </span>
            )}
          </button>

          {/* Burger */}
          <div ref={burgerRef} className="relative flex items-center">
            <button
              onClick={() => setBurgerOpen(o => !o)}
              className={`p-3 -m-3 transition-colors duration-300 ${scrolled ? 'text-white' : 'text-midnight'}`}
              aria-label="選單"
            >
              <BurgerIcon />
            </button>
            {burgerOpen && (
              <div className={`absolute right-0 top-full mt-2 min-w-[10rem] rounded-xl border overflow-hidden ${dropdownBg}`}>
                <Link href="/comment-ca-marche" onClick={() => setBurgerOpen(false)} className={`block px-4 py-2.5 transition-colors ${dropdownItem}`}>
                  <p className="text-sm font-semibold tracking-[0.08em]">購物流程</p>
                  <p className="text-sm font-semibold tracking-[0.08em]">Comment ça marche</p>
                </Link>
                <Link href="/faq" onClick={() => setBurgerOpen(false)} className={`block px-4 py-2.5 transition-colors ${dropdownItem}`}>
                  <p className="text-sm font-semibold tracking-[0.08em]">FAQ</p>
                  <p className="text-sm font-semibold tracking-[0.08em]">Questions fréquentes</p>
                </Link>
                <Link href="/abonnement" onClick={() => setBurgerOpen(false)} className={`block px-4 py-2.5 transition-colors ${dropdownItem}`}>
                  <p className="text-sm font-semibold tracking-[0.08em]">訂閱電子報</p>
                  <p className="text-sm font-semibold tracking-[0.08em]">Abonnement</p>
                </Link>
                <Link href="/contact" onClick={() => setBurgerOpen(false)} className={`block px-4 py-2.5 transition-colors ${dropdownItem}`}>
                  <p className="text-sm font-semibold tracking-[0.08em]">聯絡我們</p>
                  <p className="text-sm font-semibold tracking-[0.08em]">Nous contacter</p>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
