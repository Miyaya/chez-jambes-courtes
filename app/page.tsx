import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getActiveChannel } from '@/lib/siteConfig'
import Footer from './_components/Footer'

export default async function Page() {
  const channel = await getActiveChannel()
  if (channel === 'instock') redirect('/instock')
  if (channel === 'flash') redirect('/flash')

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
        <h1 className="text-2xl font-bold text-midnight mb-2">目前暫無開放訂購</h1>
        <p className="text-midnight/55 mb-8">Aucune commande n&apos;est ouverte pour le moment.</p>
        <Link
          href="/comment-ca-marche"
          className="inline-block text-xs font-semibold uppercase tracking-wider text-midnight/60 border-2 border-midnight/20 rounded-full px-4 py-2 hover:bg-midnight hover:text-yellow hover:border-midnight transition-colors"
        >
          閱讀購買規則 · Comment ça marche
        </Link>
      </section>
      <Footer />
    </main>
  )
}
