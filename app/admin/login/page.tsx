'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Identifiants invalides.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="flex flex-col min-h-screen bg-white items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm bg-white border border-midnight/15 rounded-2xl overflow-hidden">
        <div className="h-1.5 bg-yellow" />
        <div className="p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-midnight/40 mb-6 text-center">
            Chez Jambes Courtes
          </p>

          <h1 className="text-xl font-bold text-midnight tracking-tight text-center mb-8">
            Admin
          </h1>

          {error && (
            <p className="text-xs text-magenta bg-magenta/8 rounded-xl px-4 py-3 mb-5 text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border-2 border-midnight/15 rounded-xl px-4 py-3 text-sm text-midnight focus:outline-none focus:border-magenta"
            />
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border-2 border-midnight/15 rounded-xl px-4 py-3 text-sm text-midnight focus:outline-none focus:border-magenta"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-midnight text-white rounded-xl px-4 py-3 text-sm font-bold hover:bg-midnight/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
