'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/app/_components/CartProvider'

type PickupSlot = { id: string; label: string; location: string | null }
type PaymentMethod = 'stripe' | 'virement' | 'pay_on_pickup'

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

const inputClass =
  'w-full rounded-xl border border-midnight/20 px-4 py-3 text-sm text-midnight placeholder-midnight/30 focus:outline-none focus:ring-2 focus:ring-midnight/30 bg-white'

const PAYMENT_OPTIONS: {
  id: PaymentMethod
  label: string
  labelZh: string
  icon: string
  description: string
}[] = [
  {
    id: 'stripe',
    label: 'Carte bancaire',
    labelZh: '信用卡',
    icon: '💳',
    description: 'Paiement sécurisé via Stripe',
  },
  {
    id: 'virement',
    label: 'Virement bancaire',
    labelZh: '銀行轉帳',
    icon: '🏦',
    description: 'Coordonnées bancaires envoyées par email',
  },
  {
    id: 'pay_on_pickup',
    label: 'Paiement à la livraison',
    labelZh: '面交付款',
    icon: '🤝',
    description: 'Espèces ou virement lors du retrait',
  },
]

function OrderSummaryBox({
  titleZh,
  titleFr,
  orderItems,
  products,
  selected,
  onSelect,
  showSelector,
  note,
}: {
  titleZh: string
  titleFr: string
  orderItems: [string, number][]
  products: Record<string, { name_tw: string; name_fr: string; unit_price: number; unit_label: string }>
  selected: boolean
  onSelect: () => void
  showSelector: boolean
  note?: string
}) {
  const total = orderItems.reduce((sum, [id, qty]) => sum + (products[id]?.unit_price ?? 0) * qty, 0)

  return (
    <div
      onClick={showSelector ? onSelect : undefined}
      className={`bg-white rounded-2xl shadow-xl p-6 transition-colors ${
        showSelector
          ? selected
            ? 'border-2 border-midnight cursor-pointer'
            : 'border-2 border-midnight/10 hover:border-midnight/30 cursor-pointer'
          : 'border border-midnight/10'
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        {showSelector && (
          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected ? 'border-midnight bg-midnight' : 'border-midnight/30'
          }`}>
            {selected && <span className="w-1.5 h-1.5 rounded-full bg-yellow block" />}
          </span>
        )}
        <h2 className="font-bold text-midnight text-xs uppercase tracking-wider">
          {titleZh} · {titleFr}
        </h2>
      </div>

      <div className="space-y-3">
        {orderItems.map(([id, qty]) => {
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
        <p className="text-sm font-bold text-midnight tabular-nums">{centsToEur(total)} €</p>
      </div>

      {note && <p className="text-xs text-midnight/30 mt-3 leading-relaxed">{note}</p>}
    </div>
  )
}

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe')
  const [payOnPickupEligible, setPayOnPickupEligible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [selectedOrderType, setSelectedOrderType] = useState<'instock' | 'preorder'>('instock')

  const items = Object.entries(cart).filter(([, qty]) => qty > 0)
  const instockItems = items.filter(([id]) => products[id]?.stock_quantity != null)
  const preorderItems = items.filter(([id]) => products[id]?.stock_quantity == null)
  const hasBoth = instockItems.length > 0 && preorderItems.length > 0

  const activeItems = hasBoth
    ? (selectedOrderType === 'instock' ? instockItems : preorderItems)
    : items

  useEffect(() => {
    if (items.length === 0) router.replace('/')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch('/api/customer/me')
      .then(r => r.json())
      .then(data => {
        if (!data) return
        setFirstName(data.prenom ?? '')
        setLastName(data.nom ?? '')
        setEmail(data.email ?? '')
        setPhone(data.phone ?? '')
        setLoggedIn(true)
        if (data.email) checkEligibility(data.email)
      })
      .catch(() => {})
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

  async function checkEligibility(emailValue: string) {
    if (!emailValue.includes('@')) return
    try {
      const res = await fetch(`/api/customer/eligibility?email=${encodeURIComponent(emailValue)}`)
      const data = await res.json()
      setPayOnPickupEligible(data.eligible === true)
      if (!data.eligible && paymentMethod === 'pay_on_pickup') setPaymentMethod('stripe')
    } catch {
      // silently fail — server enforces it anyway
    }
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: activeItems.map(([id, qty]) => ({ id, qty })),
          customer: {
            prenom: firstName.trim(),
            nom: lastName.trim(),
            email,
            phone,
            pickup_slot_id: slotId || null,
            note,
            payment_method: paymentMethod,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue.')
        return
      }
      if (data.token) {
        router.push(`/merci/commande?token=${data.token}&method=${paymentMethod}`)
      } else {
        window.location.href = data.url
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) return null

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-block text-xs uppercase tracking-[0.14em] text-midnight/50 hover:text-midnight transition-colors mb-6"
        >
          ← Retour · 返回
        </Link>

        {/* Warning banner — always shown */}
        <div className="mb-6 bg-red-600 text-white rounded-xl px-4 py-3">
          <p className="text-sm font-bold mb-0.5">⚠️ 現貨與預購需分開結帳</p>
          <p className="text-xs text-white/80 leading-relaxed">
            Les articles en stock et en précommande doivent être passés en deux commandes séparées.
            {hasBoth && ' Sélectionnez ci-dessous quelle commande vous souhaitez passer maintenant. · 請選擇您本次要結帳的品項。'}
          </p>
        </div>

        <h1 className="text-2xl font-bold text-midnight mb-8 tracking-tight">
          Récapitulatif · 結帳確認
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 items-start">
          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-midnight/10 rounded-2xl shadow-xl p-6 space-y-5">
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
                onBlur={e => checkEligibility(e.target.value)}
                required
                disabled={loggedIn}
                placeholder="sophie@example.com"
                className={`${inputClass} ${loggedIn ? 'bg-midnight/8' : ''}`}
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

            {/* Payment method */}
            <div>
              <p className="text-xs text-midnight/50 mb-3 uppercase tracking-wider font-bold">
                Mode de paiement · 付款方式 <span className="text-red-400">*</span>
              </p>
              <div className="space-y-2">
                {PAYMENT_OPTIONS.map(opt => {
                  const disabled = opt.id === 'pay_on_pickup' && !payOnPickupEligible
                  const selected = paymentMethod === opt.id

                  return (
                    <div key={opt.id} className="relative group">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && setPaymentMethod(opt.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                          disabled
                            ? 'opacity-40 cursor-not-allowed border-midnight/10 bg-midnight/3'
                            : selected
                            ? 'border-midnight bg-midnight/4'
                            : 'border-midnight/15 hover:border-midnight/30 bg-white'
                        }`}
                      >
                        <span className="text-xl shrink-0">{opt.icon}</span>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold ${disabled ? 'text-midnight/40' : 'text-midnight'}`}>
                            {opt.label} · {opt.labelZh}
                          </p>
                          <p className="text-xs text-midnight/40">{opt.description}</p>
                        </div>
                        {selected && !disabled && (
                          <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-midnight" />
                        )}
                      </button>

                      {/* Tooltip for disabled pay_on_pickup */}
                      {disabled && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-midnight text-white text-xs rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-center leading-relaxed z-10">
                          Nécessite au moins une commande complétée.
                          <br />
                          <span className="text-white/60 text-[10px]">
                            需要至少一次完成的訂單才可選擇。<br/>惡意放鳥者將被列入黑名單 🚫
                          </span>
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-midnight" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

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
              className="w-full bg-midnight text-yellow font-bold text-sm uppercase tracking-wider py-4 rounded-xl hover:bg-yellow hover:text-midnight border-2 border-midnight transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Chargement… · 處理中…'
                : paymentMethod === 'stripe'
                ? 'Payer avec Stripe · 前往付款 →'
                : 'Confirmer la commande · 確認訂單 →'}
            </button>

            {paymentMethod === 'stripe' && (
              <p className="text-xs text-midnight/30 text-center">
                Paiement sécurisé via Stripe · 透過 Stripe 安全付款
              </p>
            )}
          </form>

          {/* Order summary */}
          {hasBoth ? (
            <div className="space-y-4">
              <OrderSummaryBox
                titleZh="現貨"
                titleFr="En stock"
                orderItems={instockItems}
                products={products}
                selected={selectedOrderType === 'instock'}
                onSelect={() => setSelectedOrderType('instock')}
                showSelector={true}
                note="Retrait en main propre à Paris · 巴黎面交取貨"
              />
              <OrderSummaryBox
                titleZh="預購"
                titleFr="Précommande"
                orderItems={preorderItems}
                products={products}
                selected={selectedOrderType === 'preorder'}
                onSelect={() => setSelectedOrderType('preorder')}
                showSelector={true}
                note="Retrait en main propre à Paris · 巴黎面交取貨"
              />
            </div>
          ) : (
            <OrderSummaryBox
              titleZh="訂單"
              titleFr="Votre commande"
              orderItems={items}
              products={products}
              selected={false}
              onSelect={() => {}}
              showSelector={false}
              note="Retrait en main propre à Paris · 巴黎面交取貨"
            />
          )}
        </div>
      </div>
    </main>
  )
}
