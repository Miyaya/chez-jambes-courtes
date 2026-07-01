import Link from 'next/link'

export default function Footer({ className = '' }: { className?: string }) {
  return (
    <footer className={`bg-dark-green text-center px-8 py-10 text-sm text-white font-normal tracking-[0.08em] leading-loose ${className}`}>
      <nav className="mt-3 flex flex-col sm:flex-row justify-center gap-2 sm:gap-6">
        <Link href="/comment-acheter" className="hover:underline transition-colors">
          購買流程 · Comment acheter
        </Link>
        <Link href="/faq" className="hover:underline transition-colors">
          常見問題 · FAQ
        </Link>
      </nav>
      <p className="mt-3">Chez Jambes Courtes · Paris © 2026 · Mentions légales</p>
    </footer>
  )
}
