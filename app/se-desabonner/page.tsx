import Link from 'next/link'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'
import { createAdminClient } from '@/lib/supabase/admin'
import { resubscribeAction } from '@/app/actions'

export const metadata = { title: 'Désabonnement — Chez Jambes Courtes' }

interface Props {
  searchParams: Promise<{ email?: string; token?: string; resubscribed?: string }>
}

const dotBg = {
  backgroundImage: 'radial-gradient(circle, #FFCD8B 2.5px, transparent 2.5px)',
  backgroundSize: '28px 28px',
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-1 bg-orange flex flex-col items-center justify-center px-6 py-16 text-midnight" style={dotBg}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8 text-center">
          {children}
        </div>
      </div>
      <div className="bg-orange overflow-hidden leading-none">
        <svg viewBox="0 0 1440 64" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block w-full h-14 sm:h-16">
          <path d="M0,44 C82,26 168,58 294,38 C386,22 448,52 572,32 C696,12 762,50 902,28 C1042,6 1124,46 1264,24 C1342,12 1402,36 1440,28 L1440,64 L0,64 Z" fill="#031926" />
        </svg>
      </div>
      <footer className="bg-midnight text-center px-8 py-10 text-sm text-white/40 tracking-[0.08em] leading-loose">
        <p className="text-white/70">Chez Jambes Courtes · Paris</p>
        <p className="mt-2 opacity-50">© 2025 · Mentions légales · 隱私政策</p>
      </footer>
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
