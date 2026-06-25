'use client'

import { useEffect, useState } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const el = document.scrollingElement ?? document.documentElement
    const check = () => setScrolled(el.scrollTop > 10)
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-midnight' : 'bg-orange'
      }`}
    >
      <div className="mx-auto w-full max-w-xl px-8 py-4 flex items-center justify-between">
        <span className={`text-base font-bold tracking-[0.14em] uppercase transition-colors duration-300 ${scrolled ? 'text-white' : 'text-midnight'}`}>
          Chez Jambes Courtes
        </span>
      </div>

      {/* Wave bottom edge — fades in when scrolled */}
      <div
        aria-hidden="true"
        className={`absolute top-full left-0 right-0 h-7 pointer-events-none transition-opacity duration-300 ${
          scrolled ? 'opacity-100' : 'opacity-0'
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
