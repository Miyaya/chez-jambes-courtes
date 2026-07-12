import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getActiveChannel } from '@/lib/siteConfig'
import Footer from './_components/Footer'
import SubscribeForm from './_components/SubscribeForm'

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

      <section className="px-8 py-20 border-t border-midnight/10 flex flex-col items-center text-center">
        <h2 className="text-xl font-bold text-midnight text-balance mb-1">
          搶<span className="text-magenta">鮮</span>掌握第一手消息
        </h2>
        <p className="text-sm text-midnight/60 mb-8">Soyez les premiers informés dès qu&apos;une vente ouvre</p>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-midnight/65 mb-2">
            加入 Line 官方帳號 @120xcqsx
          </p>
          <a href="https://lin.ee/WdOYi2z" className="inline-block">
            <img src="https://scdn.line-apps.com/n/line_add_friends/btn/zh-Hant.png" alt="加入好友" height="36" className="border-0" />
          </a>
        </div>

        <div className="flex items-center gap-3 w-full max-w-sm mb-8">
          <div className="flex-1 h-px bg-midnight/15" />
          <span className="text-xs text-midnight/40 uppercase tracking-wider">或</span>
          <div className="flex-1 h-px bg-midnight/15" />
        </div>

        <div className="w-full max-w-sm text-left">
          <h3 className="text-sm font-semibold text-midnight mb-3 text-center">
            訂閱電子報 · S&apos;abonner à la newsletter
          </h3>
          <SubscribeForm source="manual" />
        </div>
      </section>

      <Footer />
    </main>
  )
}
