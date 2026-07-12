'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { subscribeAction } from '@/app/actions'

const inputClass =
  'w-full border border-yellow/50 rounded-sm px-3 py-2.5 text-base text-midnight bg-transparent outline-none focus:border-magenta placeholder:text-midnight/30 transition-colors'

const labelClass =
  'block text-[0.72rem] uppercase tracking-[0.12em] text-midnight/60 mb-1.5 font-medium'

export default function SubscribeForm({ source = 'manual' }: { source?: 'prelaunch' | 'checkout' | 'manual' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [consentError, setConsentError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const consentRef = useRef<HTMLInputElement>(null)

  const isValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid(email)) { setEmailError(true); return }
    if (!consent) {
      setConsentError(true)
      consentRef.current?.focus()
      return
    }

    setLoading(true)
    setServerError(null)

    const result = await subscribeAction(email, name, source)

    if (result.data === 'subscribed') {
      router.push('/merci')
      return
    }

    if (result.error === 'already_subscribed') {
      setServerError('此信箱已訂閱 · Cette adresse est déjà inscrite')
    } else if (result.error === 'email_failed') {
      setServerError(`訂閱成功但確認信發送失敗 · Inscription réussie mais l'e-mail a échoué${result.detail ? ` (${result.detail})` : ''}`)
    } else {
      setServerError(`發生錯誤 · Une erreur est survenue${result.detail ? ` (${result.detail})` : ''}`)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-4 text-left">
        <label htmlFor="subscribe-name" className={labelClass}>名字 · Prénom</label>
        <input
          id="subscribe-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Sophie / 小芳"
          autoComplete="given-name"
          className={inputClass}
        />
      </div>

      <div className="mb-4 text-left">
        <label htmlFor="subscribe-email" className={labelClass}>
          電子信箱 · Adresse e-mail <span className="text-magenta">*</span>
        </label>
        <input
          id="subscribe-email"
          type="email"
          value={email}
          onChange={e => {
            setEmail(e.target.value)
            if (emailError && isValid(e.target.value)) setEmailError(false)
          }}
          placeholder="vous@example.com"
          autoComplete="email"
          required
          aria-invalid={emailError}
          aria-describedby={emailError ? 'email-error' : undefined}
          className={inputClass}
        />
        {emailError && (
          <p id="email-error" role="alert" className="text-[0.72rem] text-magenta mt-1">
            請輸入有效的電子信箱 · Veuillez entrer une adresse valide
          </p>
        )}
      </div>

      <div className="flex items-start gap-2.5 my-5 text-left">
        <input
          ref={consentRef}
          type="checkbox"
          id="consent"
          checked={consent}
          onChange={e => {
            setConsent(e.target.checked)
            if (e.target.checked) setConsentError(false)
          }}
          aria-invalid={consentError}
          aria-describedby={consentError ? 'consent-error' : undefined}
          className="mt-0.5 shrink-0 accent-yellow w-4 h-4"
        />
        <label htmlFor="consent" className="text-xs text-midnight/55 leading-relaxed cursor-pointer">
          符合 RGPD 數據隱私規範，您的個人資料絕不外洩。您隨時有權查閱、修改或要求刪除您的電子信箱，只需透過 contact@chezjambescourtes.com 送出申請即可。
          <br />
          Conformément au RGPD, vos données restent strictement confidentielles. Vous disposez d'un droit d'accès, de rectification et d'effacement de vos informations, exerçable à tout moment sur simple demande à contact@chezjambescourtes.com
        </label>
      </div>
      {consentError && (
        <p id="consent-error" role="alert" className="text-[0.72rem] text-magenta mb-3 -mt-3">
          請先勾選同意後再送出 · Veuillez cocher la case avant de continuer
        </p>
      )}

      {serverError && (
        <p role="alert" className="text-[0.72rem] text-magenta mb-3">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        aria-live="polite"
        className="w-full py-3 bg-midnight text-white text-[0.8rem] font-medium uppercase tracking-[0.15em] rounded-sm hover:bg-midnight/80 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? '處理中… · Envoi en cours…' : '即刻訂閱 · Me prévenir'}
      </button>
    </form>
  )
}
