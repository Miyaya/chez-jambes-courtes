'use client'

import Link from 'next/link'
import { useState } from 'react'
import Footer from '../_components/Footer'

function FieldError({ msg }: { msg: string | null }) {
  if (!msg) return null
  return <p className="mt-1.5 text-xs text-red-500">{msg}</p>
}

function validateEmail(v: string) {
  if (!v) return '請填寫電子郵件 · E-mail requis'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return '電子郵件格式不正確 · Format invalide'
  return null
}

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [touched, setTouched] = useState({ email: false, message: false })
  const [submitted, setSubmitted] = useState(false)

  const emailErr = (touched.email || submitted) ? validateEmail(email) : null
  const messageErr = (touched.message || submitted) && !message.trim() ? '請填寫留言 · Message requis' : null

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    if (validateEmail(email) || !message.trim()) return
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
      setName('')
      setEmail('')
      setMessage('')
      setTouched({ email: false, message: false })
      setSubmitted(false)
    } catch {
      setStatus('error')
    }
  }

  const inputClass = 'w-full rounded-xl border bg-midnight/3 px-4 py-3 text-sm text-midnight placeholder:text-midnight/30 focus:outline-none transition-colors'
  const fieldClass = (err: string | null) => `${inputClass} ${err ? 'border-red-400 focus:border-red-400' : 'border-midnight/15 focus:border-midnight/40'}`

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="bg-yellow px-8 py-14 text-center"
        style={{
          backgroundImage: 'radial-gradient(circle, #FFCD8B 2.5px, transparent 2.5px)',
          backgroundSize: '28px 28px',
        }}
      >
        <h1 className="text-3xl font-bold text-midnight mb-1">聯絡我們</h1>
        <p className="text-midnight/60 text-sm tracking-[0.15em] uppercase">Nous contacter</p>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-16 space-y-8">
        {/* Contact form */}
        <div className="rounded-2xl border border-midnight/10 px-6 py-8">
          <p className="text-xs text-midnight/40 uppercase tracking-widest font-bold mb-1">留言 · Message</p>
          <p className="text-sm text-midnight/60 mb-6">有任何問題都歡迎留言，我們通常在 24–48 小時內回覆。<br /><span className="text-xs">N&apos;hésitez pas à nous écrire, nous répondons sous 24–48 h.</span></p>

          {status === 'sent' ? (
            <div className="rounded-xl bg-midnight/4 border border-midnight/10 px-5 py-6 text-center">
              <p className="font-bold text-midnight mb-1">訊息已送出！· Message envoyé !</p>
              <p className="text-sm text-midnight/55">我們會盡快回覆您。· Nous vous répondrons très vite.</p>
              <button onClick={() => setStatus('idle')} className="mt-4 text-xs text-midnight/40 underline underline-offset-2">再傳一則 · Envoyer un autre</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1.5">姓名 · Nom</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Votre nom"
                    className={fieldClass(null)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1.5">
                    電子郵件 · E-mail <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, email: true }))}
                    placeholder="vous@exemple.com"
                    className={fieldClass(emailErr)}
                  />
                  <FieldError msg={emailErr} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1.5">
                  留言 · Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, message: true }))}
                  placeholder="Votre message..."
                  className={`${fieldClass(messageErr)} resize-none`}
                />
                <FieldError msg={messageErr} />
              </div>
              {status === 'error' && (
                <p className="text-sm text-red-600">發送失敗，請稍後再試或直接寫信給我們。<br /><span className="text-xs">Échec de l&apos;envoi, réessayez ou écrivez-nous directement.</span></p>
              )}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="px-6 py-2.5 bg-midnight text-yellow font-bold text-sm rounded-full hover:bg-yellow hover:text-midnight transition-colors duration-200 disabled:opacity-50"
              >
                {status === 'sending' ? '傳送中…' : '傳送 · Envoyer'}
              </button>
            </form>
          )}
        </div>

        {/* Direct contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-midnight/10 bg-midnight/3 px-5 py-5 text-center">
            <p className="text-xs text-midnight/40 uppercase tracking-widest font-bold mb-3">E-mail</p>
            <a
              href="mailto:contact@chezjambescourtes.com"
              className="text-sm font-bold text-midnight hover:text-midnight/60 transition-colors underline underline-offset-2"
            >
              contact@chezjambescourtes.com
            </a>
          </div>
          <div className="rounded-2xl border border-midnight/10 bg-midnight/3 px-5 py-5 text-center">
            <p className="text-xs text-midnight/40 uppercase tracking-widest font-bold mb-3">Facebook</p>
            <a
              href="https://facebook.com/chezjambescourtes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-midnight hover:text-midnight/60 transition-colors underline underline-offset-2"
            >
              Chez Jambes Courtes
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/faq"
            className="px-5 py-2.5 bg-midnight text-yellow font-bold rounded-full hover:bg-yellow hover:text-midnight transition-colors duration-200"
          >
            常見問題 FAQ →
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 border-2 border-midnight/20 text-midnight/60 font-bold rounded-full hover:border-midnight hover:text-midnight transition-colors duration-200"
          >
            返回首頁 →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
