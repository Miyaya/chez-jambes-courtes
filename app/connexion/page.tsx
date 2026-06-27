'use client'

import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function ConnexionPage() {
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error') === 'auth'

  function signInWith(provider: 'google' | 'facebook') {
    const supabase = createClient()
    supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <main
      className="flex flex-col min-h-screen bg-orange items-center justify-center px-6 py-16"
      style={{
        backgroundImage: 'radial-gradient(circle, #FFCD8B 2.5px, transparent 2.5px)',
        backgroundSize: '28px 28px',
      }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <p className="text-xs uppercase tracking-[0.14em] text-midnight/40 mb-6 text-center">
          Chez Jambes Courtes
        </p>

        <h1 className="text-xl font-bold text-midnight tracking-tight text-center mb-2">
          Mon compte · 我的帳號
        </h1>
        <p className="text-xs text-midnight/40 text-center mb-8">
          Suivez vos commandes et gérez vos préférences.
          <br />
          <span className="text-midnight/30">追蹤訂單，管理個人偏好設定。</span>
        </p>

        {hasError && (
          <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-5 text-center">
            Connexion échouée — veuillez réessayer. · 登入失敗，請再試一次。
          </p>
        )}

        <div className="space-y-3">
          <button
            onClick={() => signInWith('google')}
            className="w-full flex items-center gap-3 border-2 border-midnight/15 rounded-xl px-4 py-3 text-sm font-bold text-midnight hover:border-midnight hover:bg-midnight/3 transition-colors"
          >
            <GoogleIcon />
            Continuer avec Google
          </button>
        </div>

        <p className="text-[11px] text-midnight/25 text-center mt-6 leading-relaxed">
          En vous connectant, vous acceptez nos conditions d&apos;utilisation.
          <br />
          登入即表示您同意我們的使用條款。
        </p>
      </div>
    </main>
  )
}
