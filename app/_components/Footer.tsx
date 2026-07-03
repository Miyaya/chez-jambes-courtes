import Link from 'next/link'

export default function Footer({ className = '' }: { className?: string }) {
  return (
    <footer className={`bg-dark-green text-center px-8 py-10 text-sm text-white font-normal tracking-[0.08em] leading-loose ${className}`}>
      <nav className="mt-3 flex flex-col items-start text-left gap-2 max-w-xl mx-auto lg:max-w-none lg:flex-row lg:flex-wrap lg:items-center lg:justify-center lg:text-center lg:gap-6">
        <Link href="/comment-ca-marche" className="hover:underline transition-colors">
          購物流程 · Comment ça marche
        </Link>
        <Link href="/faq" className="hover:underline transition-colors">
          常見問題 · FAQ
        </Link>
        <Link href="/contact" className="hover:underline transition-colors">
          聯絡我們 · Contact
        </Link>
        <Link href="/cgv" className="hover:underline transition-colors">
          服務條款 · CGV
        </Link>
        <Link href="/mentions-legales" className="hover:underline transition-colors">
          法律資訊 · Mentions Légales
        </Link>
      </nav>
      <p className="mt-3">Chez Jambes Courtes · Paris © 2026</p>
    </footer>
  )
}
