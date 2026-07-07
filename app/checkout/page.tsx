'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/app/_components/CartProvider'
import { subscribeAction } from '@/app/actions'
import { BANK_INFO } from '@/lib/bank-info'

type PickupSlot = { id: string; label: string; location: string | null }
type PaymentMethod = 'virement' | 'stripe' | 'pay_on_pickup'

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

// Normalizes phone input to "country code + last 9 digits".
// A leading 0 (French local format, e.g. 06 12 34 56 78) is replaced with +33.
// Anything already starting with + is kept as typed, just stripped of non-digits.
function formatPhone(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('0')) {
    return `+33${cleaned.slice(1, 10)}`
  }
  if (cleaned.startsWith('+')) {
    return `+${cleaned.slice(1).replace(/\+/g, '')}`
  }
  return cleaned
}

// French numbers (+33) must have exactly 9 digits after the country code;
// anything else just gets a general sanity check on overall digit count.
function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (value.startsWith('+33')) return digits.length === 11
  return digits.length >= 8 && digits.length <= 15
}

const MIN_ORDER_CENTS = 1600

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
    id: 'virement',
    label: 'Virement bancaire',
    labelZh: '銀行轉帳',
    icon: '🏦',
    description: '銀行資訊於下方，也會以 email 寄送，請選擇即時轉帳 (instané)',
  },
  {
    id: 'stripe',
    label: 'Carte bancaire',
    labelZh: '信用卡',
    icon: '💳',
    description: '將會跳轉到 Stripe 頁面付款',
  },
  {
    id: 'pay_on_pickup',
    label: 'Paiement à la livraison',
    labelZh: '面交付款',
    icon: '🤝',
    description: '接受現金或 sans contact 的歐元信用卡',
  },
]

type SummaryProduct = {
  name_tw: string
  name_fr: string
  unit_price: number
  unit_label: string
  preference_options?: string[]
}

function OrderSummaryBox({
  orderItems,
  products,
  selected,
  onSelect,
  showSelector,
  preferences,
  onPreferenceChange,
}: {
  orderItems: [string, number][]
  products: Record<string, SummaryProduct>
  selected: boolean
  onSelect: () => void
  showSelector: boolean
  preferences: Record<string, string>
  onPreferenceChange: (productId: string, option: string) => void
}) {
  const total = orderItems.reduce((sum, [id, qty]) => sum + (products[id]?.unit_price ?? 0) * qty, 0)

  return (
    <div
      onClick={showSelector ? onSelect : undefined}
      className={`bg-white rounded-2xl p-6 transition-colors ${
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
        <h2 className="font-bold text-midnight text-sm uppercase tracking-wider">
          訂單 · Votre commande
        </h2>
      </div>

      <div className="space-y-3">
        {orderItems.map(([id, qty]) => {
          const p = products[id]
          if (!p) return null
          const options = p.preference_options ?? []
          return (
            <div key={id}>
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-midnight leading-tight">{p.name_tw}</p>
                  <p className="text-sm text-midnight/40">
                    {p.name_fr} × {qty} {p.unit_label}
                  </p>
                </div>
                <p className="font-semibold text-midnight tabular-nums shrink-0">
                  {centsToEur(p.unit_price * qty)} €
                </p>
              </div>

              {options.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-midnight/60 mb-1.5 leading-snug">
                    請選擇偏好，但不能保證一定是該選項；使用刷卡或匯款者，多收的錢會退還
                    <br />
                    Choisissez votre préférence — sans garantie de l&apos;obtenir ; en cas de trop-perçu (carte ou virement), vous serez remboursé.
                    {' '}<span className="text-magenta">*</span>
                  </p>
                  <div className="space-y-1">
                    {options.map(option => {
                      const checked = preferences[id] === option
                      return (
                        <label
                          key={option}
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-2 text-xs text-midnight cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`preference-${id}`}
                            checked={checked}
                            onChange={() => onPreferenceChange(id, option)}
                            className="w-4 h-4 border-midnight/30 text-midnight focus:ring-2 focus:ring-midnight/20"
                          />
                          {option}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="border-t border-midnight/10 mt-4 pt-4 flex justify-between">
        <p className="text-sm font-bold text-midnight">Total</p>
        <p className="text-sm font-bold text-midnight tabular-nums">{centsToEur(total)} €</p>
      </div>
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
  const [lineUsername, setLineUsername] = useState('')
  const [slotId, setSlotId] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('virement')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [preferences, setPreferences] = useState<Record<string, string>>({})
  const [newsletter, setNewsletter] = useState(false)
  const [agreePreorder, setAgreePreorder] = useState(false)

  const items = Object.entries(cart).filter(([, qty]) => qty > 0)
  const subtotal = items.reduce((sum, [id, qty]) => sum + (products[id]?.unit_price ?? 0) * qty, 0)
  const belowMinimum = subtotal < MIN_ORDER_CENTS

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
        setPhone(formatPhone(data.phone ?? ''))
        setLoggedIn(true)
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

  function handlePreferenceChange(productId: string, option: string) {
    setPreferences(prev => ({ ...prev, [productId]: option }))
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setError('請填寫名字與姓氏 · Veuillez indiquer votre prénom et nom')
      return
    }
    if (!email.trim()) {
      setError('請填寫 Email · Veuillez indiquer votre email')
      return
    }
    if (!phone.trim()) {
      setError('請填寫電話 · Veuillez indiquer votre téléphone')
      return
    }
    if (!isValidPhone(phone)) {
      setError('電話號碼長度不正確 · Numéro de téléphone invalide')
      return
    }
    if (slots.length > 0 && !slotId) {
      setError('請選擇面交時段與地點 · Veuillez choisir un créneau de retrait')
      return
    }

    const missingPreference = items.some(
      ([id]) => (products[id]?.preference_options?.length ?? 0) > 0 && !preferences[id],
    )
    if (missingPreference) {
      setError('Veuillez choisir une option pour chaque produit · 請為每項商品選擇一個選項')
      return
    }

    if (belowMinimum) {
      setError('訂單金額過低 · Montant de la commande trop faible')
      return
    }

    if (!agreePreorder) {
      setError(
        '請勾選同意預購條款 · Veuillez accepter les conditions de précommande',
      )
      return
    }

    setLoading(true)
    try {
      if (newsletter) {
        subscribeAction(email, `${firstName.trim()} ${lastName.trim()}`.trim(), 'checkout').catch(() => {})
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: items.map(([id, qty]) => ({ id, qty, preference: preferences[id] })),
          customer: {
            prenom: firstName.trim(),
            nom: lastName.trim(),
            email,
            phone,
            line_username: lineUsername.trim() || undefined,
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

        <h1 className="text-2xl font-bold text-midnight mb-8 tracking-tight">
          結帳確認 · Récapitulatif
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 items-start">
          {/* Form */}
          <form onSubmit={handleSubmit} className="order-2 md:order-1 bg-white border border-midnight/10 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-midnight text-sm uppercase tracking-wider">
              聯絡資料 · Vos coordonnées
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-midnight/50 mb-1.5 uppercase tracking-wider">
                  名字 · Prénom <span className="text-magenta">*</span>
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
                  姓氏 · Nom <span className="text-magenta">*</span>
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
                Email <span className="text-magenta">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loggedIn}
                placeholder="sophie@example.com"
                className={`${inputClass} ${loggedIn ? 'bg-midnight/8' : ''}`}
              />
            </div>

            <div>
              <label className="block text-xs text-midnight/50 mb-1.5 uppercase tracking-wider">
                電話 · Téléphone <span className="text-magenta">*</span>
                <span className="normal-case ml-1 text-midnight/35">（面交聯絡用）</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                required
                placeholder="+33 6 xx xx xx xx"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs text-midnight/50 mb-1.5 uppercase tracking-wider">
                Line 使用者名稱
                <span className="normal-case ml-1 text-midnight/35">（選填，可使用 Line@直接與老闆聯絡）</span>
              </label>
              <input
                type="text"
                value={lineUsername}
                onChange={e => setLineUsername(e.target.value)}
                placeholder="Optionnel"
                className={inputClass}
              />
            </div>

            {slots.length > 0 && (
              <div>
                <label className="block text-xs text-midnight/50 mb-1.5 uppercase tracking-wider">
                  面交時段與地點 · Créneau de retrait <span className="text-magenta">*</span>
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
              </div>
            )}

            {/* Payment method */}
            <div>
              <p className="text-xs text-midnight/50 mb-3 uppercase tracking-wider font-semibold">
                付款方式 · Mode de paiement<span className="text-magenta">*</span>
              </p>
              <p className="text-xs text-midnight/50 mb-3 uppercase tracking-wider">
                 (若沒有偏好的話歡迎轉帳或現金，我就不用付手續費了🙇🏻‍♀️)
              </p>
              <div className="space-y-2">
                {PAYMENT_OPTIONS.map(opt => {
                  const selected = paymentMethod === opt.id

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                        selected
                          ? 'border-midnight bg-midnight/4'
                          : 'border-midnight/15 hover:border-midnight/30 bg-white'
                      }`}
                    >
                      <span className="text-xl shrink-0">{opt.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-midnight">
                          {opt.labelZh} · {opt.label}
                        </p>
                        <p className="text-xs text-midnight/75">{opt.description}</p>
                      </div>
                      {selected && (
                        <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-midnight" />
                      )}
                    </button>
                  )
                })}
              </div>

              {paymentMethod === 'virement' && (
                <div className="mt-3 rounded-xl border border-magenta/30 bg-magenta/5 px-4 py-3 text-xs text-midnight space-y-1">
                  <p><span className="font-bold">IBAN</span> : {BANK_INFO.iban}</p>
                  <p><span className="font-bold">BIC</span> : {BANK_INFO.bic}</p>
                  <p><span className="font-bold">Bénéficiaire</span> : {BANK_INFO.beneficiary}</p>
                  <p><span className="font-bold">Banque</span> : {BANK_INFO.bank}</p>
                  <p className="text-midnight/50 pt-1 leading-relaxed">
                    Veuillez noter que ce compte prend uniquement en charge les virements SEPA.
                    <br />
                    請注意，此帳戶僅支援 SEPA 歐元區轉帳。
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-midnight/50 mb-1.5 uppercase tracking-wider">
                Note · 備註
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                placeholder="許願下次面交地點、水果品項⋯⋯或是單純跟老闆閒聊"
                className={`${inputClass} resize-none text-xs`}
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={e => setNewsletter(e.target.checked)}
                className="mt-0.5 shrink-0 accent-yellow w-4 h-4"
              />
              <span className="text-xs text-midnight/55 leading-relaxed">
                訂閱電子報，收到新品與快閃上架通知（選填）
                <br />
                S&apos;abonner à la newsletter pour être informé des nouveautés (optionnel)
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreePreorder}
                onChange={e => setAgreePreorder(e.target.checked)}
                required
                className="mt-0.5 shrink-0 accent-yellow w-4 h-4"
              />
              <span className="text-xs text-midnight leading-relaxed">
                我同意這是預購，並接受可能會沒買到，若沒買到全額退費 <span className="text-magenta">*</span>
                <br />
                <span className="text-midnight/55">
                  J&apos;accepte qu&apos;il s&apos;agit d&apos;une précommande et d&apos;être remboursé(e) intégralement en cas de rupture.
                </span>
              </span>
            </label>

            {error && (
              <p className="text-sm text-midnight border border-magenta/30 bg-magenta/5 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="relative">
              <button
                type="submit"
                disabled={loading}
                aria-disabled={belowMinimum}
                onClick={e => {
                  if (belowMinimum) e.preventDefault()
                }}
                className={`peer w-full bg-midnight text-yellow font-bold text-sm uppercase tracking-wider py-4 rounded-xl border-2 border-midnight transition-colors duration-200 disabled:cursor-not-allowed ${
                  belowMinimum
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-yellow hover:text-midnight disabled:opacity-50'
                }`}
              >
                {loading
                  ? 'Chargement… · 處理中…'
                  : paymentMethod === 'stripe'
                  ? 'Payer avec Stripe · 前往付款 →'
                  : 'Confirmer la commande · 確認訂單 →'}
              </button>

              {belowMinimum && (
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-midnight text-white text-xs rounded-xl whitespace-nowrap opacity-0 peer-hover:opacity-100 peer-focus:opacity-100 peer-active:opacity-100 transition-opacity duration-150 text-center leading-relaxed z-10">
                  必須訂至少兩顆水果
                  <br />
                  <span className="text-white/80 text-xs">Il faut commander au moins 2 fruits</span>
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-midnight" />
                </div>
              )}
            </div>

            {paymentMethod === 'stripe' && (
              <p className="text-xs text-midnight/30 text-center">
                Paiement sécurisé via Stripe · 透過 Stripe 安全付款
              </p>
            )}
          </form>

          {/* Order summary */}
          <div className="order-1 md:order-2">
            <OrderSummaryBox
              orderItems={items}
              products={products}
              selected={false}
              onSelect={() => {}}
              showSelector={false}
              preferences={preferences}
              onPreferenceChange={handlePreferenceChange}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
