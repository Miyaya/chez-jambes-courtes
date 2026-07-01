import Link from 'next/link'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'
import { createAdminClient } from '@/lib/supabase/admin'
import { resubscribeAction } from '@/app/actions'
import Footer from '@/app/_components/Footer'

export const metadata = { title: 'Désabonnement — Chez Jambes Courtes' }

interface Props {
  searchParams: Promise<{ email?: string; token?: string; resubscribed?: string }>
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-midnight">
        <div className="w-full max-w-md bg-white border border-midnight/10 rounded-2xl shadow-xl overflow-hidden text-center">
          <div className="h-1.5 bg-yellow" />
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

export default async function SeDesabonnerPage({ searchParams }: Props) {
  const { email, token, resubscribed } = await searchParams

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return (
      <PageShell>
        <span className="text-4xl block mb-6">✗</span>
        <h1 className="text-2xl mb-3">Lien invalide · 連結無效</h1>
        <p className="text-sm text-midnight/55 mb-8 leading-relaxed">
          Ce lien de désabonnement est invalide ou a expiré.<br />
          <span className="text-xs">此取消訂閱連結無效或已過期。</span>
        </p>
        <Link href="/" className="text-xs uppercase tracking-[0.14em] underline underline-offset-4 text-midnight/50 hover:text-midnight transition-colors">
          Retour · 返回
        </Link>
      </PageShell>
    )
  }

  if (resubscribed === 'true') {
    return (
      <PageShell>
        <span className="text-4xl block mb-6">🥭</span>
        <h1 className="text-2xl mb-3">Vous êtes de retour · 歡迎回來</h1>
        <p className="text-sm text-midnight/55 mb-8 leading-relaxed">
          Votre inscription est réactivée.<br />
          <span className="text-xs">您的訂閱已重新啟用。</span>
        </p>
        <Link href="/" className="text-xs uppercase tracking-[0.14em] underline underline-offset-4 text-midnight/50 hover:text-midnight transition-colors">
          Retour à l&apos;accueil · 返回首頁
        </Link>
      </PageShell>
    )
  }

  const supabase = createAdminClient()
  await supabase.from('subscribers').update({ active: false }).eq('email', email)

  return (
    <PageShell>
      <span className="text-4xl block mb-6">✓</span>
      <h1 className="text-2xl mb-3">Désabonnement effectué · 已取消訂閱</h1>
      <p className="text-sm text-midnight/55 mb-8 leading-relaxed">
        Vous ne recevrez plus de notifications de notre part.<br />
        <span className="text-xs">您將不再收到我們的通知信。</span>
      </p>
      <Link href="/" className="text-xs uppercase tracking-[0.14em] underline underline-offset-4 text-midnight/50 hover:text-midnight transition-colors block mb-6">
        Retour à l&apos;accueil · 返回首頁
      </Link>
      <hr className="border-midnight/10 mb-6" />
      <form action={resubscribeAction.bind(null, email, token)}>
        <button
          type="submit"
          className="text-xs uppercase tracking-[0.14em] text-midnight/40 hover:text-midnight transition-colors cursor-pointer"
        >
          Vous avez changé d&apos;avis ? · 改變心意了？<br />
          <span className="underline underline-offset-4">Se réabonner · 重新訂閱</span>
        </button>
      </form>
    </PageShell>
  )
}
