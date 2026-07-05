import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { logoutAction } from './actions'

export const metadata = { title: 'Admin — Chez Jambes Courtes' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-midnight/5">
      <nav className="bg-midnight text-white px-6 py-3 flex items-center gap-1">
        <NavLink href="/admin/commandes">Commandes</NavLink>
        <NavLink href="/admin/pickup">Pickup</NavLink>
        <NavLink href="/admin/produits">Produits</NavLink>
        <NavLink href="/admin/achats">Achats</NavLink>
        <NavLink href="/admin/clients">Clients</NavLink>
        <NavLink href="/admin/campaign">Campaign</NavLink>
        <Link
          href="/"
          className="ml-auto text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          ← Site
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            Déconnexion
          </button>
        </form>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
    >
      {children}
    </Link>
  )
}
