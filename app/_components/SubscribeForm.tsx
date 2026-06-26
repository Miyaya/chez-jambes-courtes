'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { subscribeAction } from '@/app/actions'

const inputClass =
  'w-full border border-orange/50 rounded-sm px-3 py-2.5 text-base text-midnight bg-transparent outline-none focus:border-magenta placeholder:text-midnight/30 transition-colors'

const labelClass =
  'block text-[0.72rem] uppercase tracking-[0.12em] text-midnight/60 mb-1.5 font-medium'

export default function SubscribeForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const isValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid(email)) { setEmailError(true); return }
    if (!consent) return

    setLoading(true)
    setServerError(null)

    const result = await subscribeAction(email, name)

    if (result.data === 'subscribed') {
      router.push('/merci')
      return
    }

    if (result.error === 'already_subscribed') {
      setServerError('Cette adresse est déjà inscrite · 此信箱已訂閱')
    } else if (result.error === 'email_failed') {
      setServerError(`Inscription réussie mais l'e-mail a échoué · 訂閱成功但確認信發送失敗${result.detail ? ` (${result.detail})` : ''}`)
    } else {
      setServerError(`Une erreur est survenue · 發生錯誤${result.detail ? ` (${result.detail})` : ''}`)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-4 text-left">
        <label className={labelClass}>Prénom · 姓名</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Sophie / 小芳"
          autoComplete="given-name"
          className={inputClass}
        />
      </div>

      <div className="mb-4 text-left">
        <label className={labelClass}>
          Adresse e-mail · 電子信箱 <span className="text-magenta">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={e => {
            setEmail(e.target.value)
            if (emailError && isValid(e.target.value)) setEmailError(false)
          }}
          placeholder="vous@example.com"
          autoComplete="email"
          required
          className={inputClass}
        />
        {emailError && (
          <p className="text-[0.72rem] text-magenta mt-1">
            Veuillez entrer une adresse valide · 請輸入有效的電子信箱
          </p>
        )}
      </div>

      <div className="flex items-start gap-2.5 my-5 text-left">
        <input
          type="checkbox"
          id="consent"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          className="mt-0.5 shrink-0 accent-orange w-4 h-4"
        />
        <label htmlFor="consent" className="text-xs text-midnight/55 leading-relaxed cursor-pointer">
          J&apos;accepte de recevoir des notifications de Chez Jambes Courtes.
          Vous pouvez vous désabonner à tout moment.<br />
          <span className="opacity-80">我同意接收到貨通知，可隨時退訂。</span>
        </label>
      </div>

      {serverError && (
        <p className="text-[0.72rem] text-magenta mb-3">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={loading || !consent}
        className="w-full py-3 bg-midnight text-white text-[0.8rem] font-medium uppercase tracking-[0.15em] rounded-sm hover:bg-midnight/80 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? '…' : 'Me prévenir · 通知我'}
      </button>
    </form>
  )
}
