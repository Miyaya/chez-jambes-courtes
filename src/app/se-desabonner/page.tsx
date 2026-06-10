import Link from 'next/link'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = { title: 'Désabonnement — Chez Jambes Courtes' }

interface Props {
  searchParams: Promise<{ email?: string; token?: string }>
}

export default async function SeDesabonnerPage({ searchParams }: Props) {
  const { email, token } = await searchParams

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return (
      <main className="min-h-screen bg-orange flex flex-col items-center justify-center px-8 text-midnight text-center">
        <span className="text-4xl block mb-6">✗</span>
        <h1 className="text-2xl mb-3">Lien invalide · 連結無效</h1>
        <p className="text-sm text-midnight/55 mb-8">
          Ce lien de désabonnement est invalide ou a expiré.<br />
          <span className="text-xs">此取消訂閱連結無效或已過期。</span>
        </p>
        <Link href="/" className="text-xs uppercase tracking-[0.14em] underline underline-offset-4 text-midnight/50 hover:text-midnight transition-colors">
          Retour · 返回
        </Link>
      </main>
    )
  }

  const supabase = createAdminClient()
  await supabase.from('subscribers').update({ active: false }).eq('email', email)

  return (
    <main className="min-h-screen bg-orange flex flex-col items-center justify-center px-8 text-midnight text-center">
      <span className="text-4xl block mb-6">✓</span>
      <h1 className="text-2xl mb-3">Désabonnement effectué · 已取消訂閱</h1>
      <p className="text-sm text-midnight/55 mb-8 leading-relaxed">
        Vous ne recevrez plus de notifications de notre part.<br />
        <span className="text-xs">您將不再收到我們的通知信。</span>
      </p>
      <Link href="/" className="text-xs uppercase tracking-[0.14em] underline underline-offset-4 text-midnight/50 hover:text-midnight transition-colors">
        Retour à l&apos;accueil · 返回首頁
      </Link>
    </main>
  )
}
