'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from './CartProvider'

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const { cartTotal, openCart } = useCart()

  useEffect(() => {
    const el = document.scrollingElement ?? document.documentElement
    const check = () => setScrolled(el.scrollTop > 10)
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  const isScrolled = scrolled

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-midnight' : 'bg-orange'
      }`}
    >
      <div className="mx-auto w-full max-w-xl px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className={`text-base font-bold tracking-[0.14em] uppercase transition-colors duration-300 ${isScrolled ? 'text-white' : 'text-midnight'}`}
        >
          Chez Jambes Courtes
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/instock"
            className={`text-sm font-bold tracking-[0.1em] px-4 py-1.5 rounded-full border-2 transition-colors duration-300 ${
              isScrolled
                ? 'border-orange text-orange hover:bg-orange hover:text-midnight'
                : 'border-midnight text-midnight hover:bg-midnight hover:text-orange'
            }`}
          >
            現貨
          </Link>
          <Link
            href="/preorder"
            className={`text-sm font-bold tracking-[0.1em] px-4 py-1.5 rounded-full border-2 transition-colors duration-300 ${
              isScrolled
                ? 'border-white text-white hover:bg-white hover:text-midnight'
                : 'border-midnight/40 text-midnight/70 hover:border-midnight hover:text-midnight'
            }`}
          >
            預購
          </Link>

          {/* Cart icon — animation target, queried via data-cart-icon */}
          <button
            data-cart-icon
            onClick={openCart}
            className={`relative transition-colors duration-300 ${isScrolled ? 'text-white' : 'text-midnight'}`}
            aria-label={`Panier — ${cartTotal} article${cartTotal !== 1 ? 's' : ''}`}
          >
            <CartIcon />
            {cartTotal > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-magenta text-white text-[0.6rem] font-bold min-w-[1.1rem] h-[1.1rem] px-0.5 rounded-full flex items-center justify-center leading-none">
                {cartTotal > 99 ? '99+' : cartTotal}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Wave bottom edge */}
      <div
        aria-hidden="true"
        className={`absolute top-full left-0 right-0 h-7 pointer-events-none transition-opacity duration-300 ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          viewBox="0 0 1440 28"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="block w-full h-full"
        >
          <path
            d="M0,0 L1440,0 L1440,20 C1402,14 1342,24 1264,12 C1124,0 1042,22 902,10 C762,22 696,4 572,16 C448,24 386,6 294,16 C168,24 82,8 0,16 Z"
            fill="#031926"
          />
        </svg>
      </div>
    </header>
  )
}
