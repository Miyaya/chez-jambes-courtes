'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/app/_components/CartProvider'

type PickupSlot = { id: string; label: string; location: string | null }

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

const inputClass =
  'w-full rounded-xl border border-midnight/20 px-4 py-3 text-sm text-midnight placeholder-midnight/30 focus:outline-none focus:ring-2 focus:ring-midnight/30 bg-white'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, products } = useCart()

  const [slots, setSlots] = useState<PickupSlot[]>([])
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [slotId, setSlotId] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const items = Object.entries(cart).filter(([, qty]) => qty > 0)
  const subtotal = items.reduce(
    (sum, [id, qty]) => sum + (products[id]?.unit_price ?? 0) * qty,
    0,
  )

  useEffect(() => {
    if (items.length === 0) router.replace('/')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/pickup_slots?select=id,label,location&active=eq.true&order=slot_at`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!}`,
        },
      },
    )
      .then(r => r.json())
      .then((data: PickupSlot[]) => {
        setSlots(data)
        if (data[0]) setSlotId(data[0].id)
      })
      .catch(console.error)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: items.map(([id, qty]) => ({ id, qty })),
          customer: { name: `${firstName.trim()} ${lastName.trim()}`.trim(), email, phone, pickup_slot_id: slotId || null, note },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue.')
        return
      }
      window.location.href = data.url
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) return null

  return (
    <main
      className="min-h-screen bg-orange"
      style={{
        backgroundImage: 'radial-gradient(circle, #FFCD8B 2.5px, transparent 2.5px)',
        backgroundSize: '28px 28px',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-block text-xs uppercase tracking-[0.14em] text-midnight/50 hover:text-midnight transition-colors mb-8"
        >
          ← Retour · 返回
        </Link>

        <h1 className="text-2xl font-bold text-midnight mb-8 tracking-tight">
          Récapitulatif · 結帳確認
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 items-start">
          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
            <h2 className="font-bold text-midnight text-xs uppercase tracking-wider">
              Vos coordonnées · 聯絡資料
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-midnight/50 mb-1.5 uppercase tracking-wider">
                  Prénom · 名字 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                  placeholder="Sophie"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-midnight/50 mb-1.5 uppercase tracking-wider">
                  Nom · 姓氏 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                  placeholder="Martin"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-midnight/50 mb-1.5 uppercase tracking-wider">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="sophie@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs text-midnight/50 mb-1.5 uppercase tracking-wider">
                Téléphone · 電話 <span className="text-red-400">*</span>
                <span className="normal-case ml-1 text-midnight/35">（面交聯絡用）</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                placeholder="+33 6 xx xx xx xx"
                className={inputClass}
              />
            </div>

            {slots.length > 0 && (
              <div>
                <label className="block text-xs text-midnight/50 mb-1.5 uppercase tracking-wider">
                  Créneau de retrait · 取貨時段 <span className="text-red-400">*</span>
                </label>
                <select
                  value={slotId}
                  onChange={e => setSlotId(e.target.value)}
                  required
                  className={inputClass}
                >
                  {slots.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {slotId && slots.find(s => s.id === slotId)?.location && (
                  <p className="text-xs text-midnight/40 mt-1.5 pl-1">
                    {slots.find(s => s.id === slotId)!.location}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs text-midnight/50 mb-1.5 uppercase tracking-wider">
                Note · 備註
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                placeholder="Allergie, message particulier… / 過敏資訊、特別備註…"
                className={`${inputClass} resize-none`}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-midnight text-orange font-bold text-sm uppercase tracking-wider py-4 rounded-xl hover:bg-orange hover:text-midnight border-2 border-midnight transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement… · 處理中…' : 'Payer avec Stripe · 前往付款 →'}
            </button>

            <p className="text-xs text-midnight/30 text-center">
              Paiement sécurisé via Stripe · 透過 Stripe 安全付款
            </p>
          </form>

          {/* Order summary */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="font-bold text-midnight text-xs uppercase tracking-wider mb-4">
              Votre commande · 訂單
            </h2>
            <div className="space-y-3">
              {items.map(([id, qty]) => {
                const p = products[id]
                if (!p) return null
                return (
                  <div key={id} className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-midnight leading-tight">{p.name_tw}</p>
                      <p className="text-xs text-midnight/40">
                        {p.name_fr} × {qty} {p.unit_label}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-midnight tabular-nums shrink-0">
                      {centsToEur(p.unit_price * qty)} €
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-midnight/10 mt-4 pt-4 flex justify-between">
              <p className="text-sm font-bold text-midnight">Total</p>
              <p className="text-sm font-bold text-midnight tabular-nums">
                {centsToEur(subtotal)} €
              </p>
            </div>
            <p className="text-xs text-midnight/30 mt-3 leading-relaxed">
              Retrait en main propre à Paris · 巴黎面交取貨
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
