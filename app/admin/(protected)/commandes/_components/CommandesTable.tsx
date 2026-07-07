'use client'

import { useState, useTransition, useOptimistic } from 'react'
import Link from 'next/link'
import { updateOrderStatusAction, updateFlagAction, updateOrderItemsAction, captureStripePaymentAction, voidStripePaymentAction } from '../actions'

type OrderStatus = 'received_preorder' | 'received_instock' | 'validated' | 'partial_validated' | 'complete' | 'canceled'
type OrderFlag = 'shortage' | 'contact_needed' | 'postponed' | 'others' | 'no_show'

const STATUS: Record<OrderStatus, { label: string; color: string }> = {
  received_preorder: { label: 'Reçue (flash)',        color: 'bg-yellow/20 text-midnight' },
  received_instock:  { label: 'Reçue (en stock)',     color: 'bg-yellow/20 text-midnight' },
  validated:         { label: 'Validée',               color: 'bg-green/15 text-dark-green' },
  partial_validated: { label: 'Part. validée',         color: 'bg-orange/12 text-orange' },
  complete:          { label: 'Terminée',              color: 'bg-midnight/8 text-midnight' },
  canceled:          { label: 'Annulée',               color: 'bg-midnight/5 text-midnight/40' },
}
const STATUS_OPTIONS: OrderStatus[] = ['received_preorder', 'received_instock', 'validated', 'partial_validated', 'complete', 'canceled']

const FLAG: Record<OrderFlag, string> = {
  shortage:       '⚠️ Rupture',
  contact_needed: '📞 À contacter',
  postponed:      '⏸️ Reporté',
  others:         '🔖 Autre',
  no_show:        '🚫 No-show',
}
const FLAG_OPTIONS: OrderFlag[] = ['shortage', 'contact_needed', 'postponed', 'others', 'no_show']

type ItemSnapshot = {
  product_id: string
  name_fr: string
  name_tw: string
  unit_label: string
  unit_price: number
  promo_price: number | null
  qty: number
  line_total: number
  preference: string | null
}

export type Product = {
  id: string
  name_fr: string
  name_tw: string
  unit_label: string
  unit_price: number
  preference_options: string[]
}

export type Order = {
  id: string
  order_number: string
  customer_prenom: string
  customer_nom: string
  customer_email: string
  customer_phone: string | null
  status: OrderStatus
  flag: OrderFlag | null
  subtotal: number
  discount_amount: number
  total_amount: number
  created_at: string
  tracking_token: string
  note: string | null
  cancel_reason: string | null
  items: ItemSnapshot[]
  payment_method: 'stripe' | 'virement' | 'pay_on_pickup' | null
  pickup_slots: { label: string; location: string | null } | null
}

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

export function CommandesTable({
  orders,
  firstTimeEmails,
  products,
}: {
  orders: Order[]
  firstTimeEmails: string[]
  products: Product[]
}) {
  const firstTimeSet = new Set(firstTimeEmails)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [openOrderId, setOpenOrderId] = useState<string | null>(null)
  const [draftStatus, setDraftStatus] = useState<OrderStatus | null>(null)
  const [draftCancelReason, setDraftCancelReason] = useState('')
  const [cancelReasonError, setCancelReasonError] = useState(false)
  const [draftItems, setDraftItems] = useState<ItemSnapshot[]>([])
  const [saving, setSaving] = useState(false)
  const [stripeLoading, setStripeLoading] = useState<Record<string, 'capture' | 'void'>>({})
  const [, startTransition] = useTransition()

  const [optimisticOrders, updateOptimistic] = useOptimistic(
    orders,
    (
      state,
      update: { id: string; status?: OrderStatus; flag?: OrderFlag | null; items?: ItemSnapshot[]; subtotal?: number },
    ) =>
      state.map(o => {
        if (o.id !== update.id) return o
        const merged = { ...o, ...update }
        if (update.subtotal !== undefined) merged.total_amount = update.subtotal - o.discount_amount
        return merged
      })
  )

  function showToast(msg: string) {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  async function handleStripeAction(orderId: string, action: 'capture' | 'void') {
    setStripeLoading(prev => ({ ...prev, [orderId]: action }))
    try {
      if (action === 'capture') await captureStripePaymentAction(orderId)
      else await voidStripePaymentAction(orderId)
      showToast(action === 'capture' ? 'Paiement capturé ✓' : 'Autorisation annulée ✓')
    } catch {
      showToast('Erreur Stripe — vérifiez le dashboard')
    } finally {
      setStripeLoading(prev => { const n = { ...prev }; delete n[orderId]; return n })
    }
  }

  function openEditDialog(order: Order) {
    setOpenOrderId(order.id)
    setDraftStatus(order.status)
    setDraftCancelReason(order.cancel_reason ?? '')
    setCancelReasonError(false)
    setDraftItems(order.items.map(item => ({ ...item })))
  }

  function closeEditDialog() {
    setOpenOrderId(null)
  }

  function handleProductChange(index: number, productId: string) {
    const product = products.find(p => p.id === productId)
    if (!product) return
    setDraftItems(prev => prev.map((item, i) => {
      if (i !== index) return item
      const preference = product.preference_options.length > 0
        ? (item.preference && product.preference_options.includes(item.preference) ? item.preference : product.preference_options[0])
        : null
      return {
        ...item,
        product_id: product.id,
        name_fr: product.name_fr,
        name_tw: product.name_tw,
        unit_label: product.unit_label,
        unit_price: product.unit_price,
        promo_price: null,
        preference,
        line_total: product.unit_price * item.qty,
      }
    }))
  }

  function handleQtyChange(index: number, qty: number) {
    setDraftItems(prev => prev.map((item, i) => i === index ? { ...item, qty, line_total: item.unit_price * qty } : item))
  }

  function handlePreferenceChange(index: number, preference: string) {
    setDraftItems(prev => prev.map((item, i) => i === index ? { ...item, preference } : item))
  }

  function removeItem(index: number) {
    setDraftItems(prev => prev.filter((_, i) => i !== index))
  }

  function addItem() {
    const first = products[0]
    if (!first) return
    setDraftItems(prev => [...prev, {
      product_id: first.id,
      name_fr: first.name_fr,
      name_tw: first.name_tw,
      unit_label: first.unit_label,
      unit_price: first.unit_price,
      promo_price: null,
      qty: 1,
      line_total: first.unit_price,
      preference: first.preference_options.length > 0 ? first.preference_options[0] : null,
    }])
  }

  async function handleSave() {
    if (!openOrder || !draftStatus) return

    if (draftStatus === 'canceled' && !draftCancelReason.trim()) {
      setCancelReasonError(true)
      return
    }

    const statusChanged = draftStatus !== openOrder.status
    const itemsChanged = JSON.stringify(draftItems) !== JSON.stringify(openOrder.items)

    if (!statusChanged && !itemsChanged) {
      closeEditDialog()
      return
    }

    setSaving(true)
    startTransition(async () => {
      try {
        const optimisticUpdate: { id: string; status?: OrderStatus; items?: ItemSnapshot[]; subtotal?: number } = { id: openOrder.id }
        if (statusChanged) optimisticUpdate.status = draftStatus
        if (itemsChanged) {
          optimisticUpdate.items = draftItems
          optimisticUpdate.subtotal = draftItems.reduce((sum, item) => sum + item.line_total, 0)
        }
        updateOptimistic(optimisticUpdate)

        if (itemsChanged) await updateOrderItemsAction(openOrder.id, draftItems)
        if (statusChanged) {
          await updateOrderStatusAction(
            openOrder.id,
            draftStatus,
            draftStatus === 'canceled' ? draftCancelReason.trim() : undefined,
          )
        }
        showToast(statusChanged ? 'Enregistré · e-mail envoyé' : 'Enregistré')
        closeEditDialog()
      } finally {
        setSaving(false)
      }
    })
  }

  const openOrder = openOrderId ? optimisticOrders.find(o => o.id === openOrderId) : null
  const draftSubtotal = draftItems.reduce((sum, item) => sum + item.line_total, 0)

  return (
    <>
      <div className="bg-white rounded-2xl border border-midnight/8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-midnight/8 text-left">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Commande</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Client</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Créneau</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Total</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Paiement</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Statut</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Flag</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-midnight/5">
            {optimisticOrders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-midnight/35">
                  Aucune commande.
                </td>
              </tr>
            )}
            {optimisticOrders.map(order => {
              const s = STATUS[order.status] ?? STATUS.received_preorder
              const isNew = firstTimeSet.has(order.customer_email)

              return (
                <tr key={order.id} className="hover:bg-midnight/2 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/commande/${order.tracking_token}`}
                      className="font-bold text-midnight hover:underline underline-offset-2"
                    >
                      {order.order_number}
                    </Link>
                    <p className="text-xs text-midnight/35 mt-0.5">
                      {new Date(order.created_at).toLocaleString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                      })}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {isNew && (
                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-yellow text-midnight px-1.5 py-0.5 rounded-full leading-none">
                          New
                        </span>
                      )}
                      <p className="font-medium text-midnight">{order.customer_prenom} {order.customer_nom}</p>
                    </div>
                    <p className="text-xs text-midnight/40">{order.customer_email}</p>
                    {order.customer_phone && (
                      <p className="text-xs text-midnight/40">{order.customer_phone}</p>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-midnight/50 whitespace-nowrap">
                    {order.pickup_slots?.label ?? '—'}
                  </td>

                  <td className="px-4 py-3 font-bold text-midnight tabular-nums whitespace-nowrap">
                    {centsToEur(order.total_amount)} €
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {order.payment_method === 'stripe' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-midnight/6 text-midnight/70">💳 Stripe</span>
                    )}
                    {order.payment_method === 'virement' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-midnight/6 text-midnight/70">🏦 Virement</span>
                    )}
                    {order.payment_method === 'pay_on_pickup' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-midnight/6 text-midnight/70">🤝 Face</span>
                    )}
                    {!order.payment_method && (
                      <span className="text-xs text-midnight/30">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full ${s.color}`}>
                      {s.label}
                    </span>
                    {order.payment_method === 'stripe' && (
                      <div className="flex gap-1 mt-1.5">
                        <button
                          onClick={() => handleStripeAction(order.id, 'capture')}
                          disabled={!!stripeLoading[order.id]}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green/15 text-dark-green hover:bg-green/25 disabled:opacity-40 transition-colors"
                        >
                          {stripeLoading[order.id] === 'capture' ? '…' : 'Capturer'}
                        </button>
                        <button
                          onClick={() => handleStripeAction(order.id, 'void')}
                          disabled={!!stripeLoading[order.id]}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-magenta/8 text-magenta hover:bg-magenta/15 disabled:opacity-40 transition-colors"
                        >
                          {stripeLoading[order.id] === 'void' ? '…' : 'Void'}
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={order.flag ?? ''}
                      className="text-xs px-2 py-1 rounded-full border border-midnight/15 cursor-pointer focus:outline-none focus:ring-2 focus:ring-midnight/20 text-midnight/60 bg-white"
                      aria-label="Flag"
                      onChange={e => {
                        const newFlag = (e.target.value || null) as OrderFlag | null
                        startTransition(async () => {
                          updateOptimistic({ id: order.id, flag: newFlag })
                          await updateFlagAction(order.id, newFlag)
                          showToast('Flag mis à jour')
                        })
                      }}
                    >
                      <option value="">—</option>
                      {FLAG_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{FLAG[opt]}</option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEditDialog(order)}
                        className="text-xs text-midnight/40 hover:text-midnight border border-midnight/15 rounded-lg px-2.5 py-1.5 hover:border-midnight/30 transition-colors whitespace-nowrap"
                      >
                        Modifier
                      </button>
                      {order.status === 'complete' && (
                        <a
                          href={`/api/admin/invoices/${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-midnight/40 hover:text-midnight border border-midnight/15 rounded-lg px-2.5 py-1.5 hover:border-midnight/30 transition-colors whitespace-nowrap"
                        >
                          Facture
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Order edit dialog */}
      {openOrder && draftStatus && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/40 backdrop-blur-sm"
          onClick={closeEditDialog}
        >
          <div
            className="bg-white rounded-2xl border border-midnight/10 w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-midnight/40 mb-0.5">Commande</p>
                  <h2 className="text-xl font-bold text-midnight">{openOrder.order_number}</h2>
                  <p className="text-sm text-midnight/40 mt-0.5">
                    {new Date(openOrder.created_at).toLocaleString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={closeEditDialog}
                  className="text-midnight/30 hover:text-midnight text-xl leading-none p-1 -mt-1 -mr-1"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-xs uppercase tracking-wider text-midnight/40 mb-1.5">Statut</label>
                <select
                  value={draftStatus}
                  onChange={e => {
                    setDraftStatus(e.target.value as OrderStatus)
                    setCancelReasonError(false)
                  }}
                  className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-midnight/15 cursor-pointer focus:outline-none focus:ring-2 focus:ring-midnight/20 bg-white text-midnight"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{STATUS[opt].label}</option>
                  ))}
                </select>
                <p className="text-xs text-midnight/35 mt-1.5">
                  Un e-mail correspondant sera envoyé au client si le statut change.
                </p>

                {draftStatus === 'canceled' && (
                  <div className="mt-3">
                    <textarea
                      value={draftCancelReason}
                      onChange={e => {
                        setDraftCancelReason(e.target.value)
                        if (e.target.value.trim()) setCancelReasonError(false)
                      }}
                      rows={2}
                      placeholder="Raison de l'annulation · 取消原因"
                      className={`w-full text-sm px-3 py-2 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-midnight/20 ${
                        cancelReasonError ? 'border-magenta' : 'border-midnight/15'
                      }`}
                    />
                    {cancelReasonError && (
                      <p className="text-xs text-magenta mt-1">Veuillez indiquer une raison · 請填寫取消原因</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-midnight/4 rounded-xl p-4 mb-4">
                <p className="text-xs uppercase tracking-wider text-midnight/40 mb-2">Client</p>
                <p className="font-bold text-midnight">{openOrder.customer_prenom} {openOrder.customer_nom}</p>
                <p className="text-sm text-midnight/50">{openOrder.customer_email}</p>
                {openOrder.customer_phone && (
                  <p className="text-sm text-midnight/50">{openOrder.customer_phone}</p>
                )}
              </div>

              {openOrder.pickup_slots && (
                <div className="bg-yellow/15 rounded-xl p-4 mb-4">
                  <p className="text-xs uppercase tracking-wider text-midnight/40 mb-1">Créneau de retrait</p>
                  <p className="font-bold text-midnight text-sm">{openOrder.pickup_slots.label}</p>
                  {openOrder.pickup_slots.location && (
                    <p className="text-xs text-midnight/50 mt-0.5">{openOrder.pickup_slots.location}</p>
                  )}
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-wider text-midnight/40">Articles</p>
                  <button
                    onClick={addItem}
                    className="text-xs font-bold text-midnight/50 hover:text-midnight transition-colors"
                  >
                    + Ajouter un article
                  </button>
                </div>
                <div className="space-y-2.5">
                  {draftItems.map((item, i) => {
                    const product = products.find(p => p.id === item.product_id)
                    const preferenceOptions = product?.preference_options ?? []
                    return (
                      <div key={i} className="border border-midnight/10 rounded-xl p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <select
                            value={item.product_id}
                            onChange={e => handleProductChange(i, e.target.value)}
                            className="flex-1 text-sm px-2 py-1.5 rounded-lg border border-midnight/15 bg-white text-midnight cursor-pointer focus:outline-none focus:ring-2 focus:ring-midnight/20"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name_tw} · {p.name_fr}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeItem(i)}
                            className="text-midnight/30 hover:text-magenta text-sm leading-none p-1.5 shrink-0"
                            aria-label="Retirer l'article"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={e => handleQtyChange(i, Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-16 text-sm px-2 py-1 rounded-lg border border-midnight/15 tabular-nums focus:outline-none focus:ring-2 focus:ring-midnight/20"
                          />
                          <span className="text-xs text-midnight/40">× {item.unit_label}</span>
                          {preferenceOptions.length > 0 && (
                            <select
                              value={item.preference ?? ''}
                              onChange={e => handlePreferenceChange(i, e.target.value)}
                              className="text-xs font-bold px-2 py-1 rounded-lg border border-midnight/15 bg-yellow/15 text-midnight cursor-pointer focus:outline-none focus:ring-2 focus:ring-midnight/20"
                            >
                              {preferenceOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}
                          <span className="ml-auto font-bold text-midnight text-sm tabular-nums shrink-0">
                            {centsToEur(item.line_total)} €
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {draftItems.length === 0 && (
                    <p className="text-xs text-midnight/35 text-center py-4">Aucun article.</p>
                  )}
                </div>
              </div>

              <div className="border-t border-midnight/8 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-midnight/60">
                  <span>Sous-total</span>
                  <span className="tabular-nums">{centsToEur(draftSubtotal)} €</span>
                </div>
                {openOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-dark-green">
                    <span>Réduction</span>
                    <span className="tabular-nums">−{centsToEur(openOrder.discount_amount)} €</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-midnight pt-1">
                  <span>Total</span>
                  <span className="tabular-nums">{centsToEur(draftSubtotal - openOrder.discount_amount)} €</span>
                </div>
              </div>

              {openOrder.note && (
                <div className="mt-4 bg-yellow/12 rounded-xl p-3">
                  <p className="text-xs uppercase tracking-wider text-midnight/40 mb-1">Note</p>
                  <p className="text-sm text-midnight">{openOrder.note}</p>
                </div>
              )}

              <div className="flex gap-2 mt-6 pt-4 border-t border-midnight/8">
                <button
                  onClick={closeEditDialog}
                  disabled={saving}
                  className="flex-1 text-sm font-bold text-midnight/50 border-2 border-midnight/15 rounded-xl py-2.5 hover:border-midnight/30 hover:text-midnight transition-colors disabled:opacity-40"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 text-sm font-bold text-yellow bg-midnight rounded-xl py-2.5 hover:bg-yellow hover:text-midnight border-2 border-midnight transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <div className="bg-midnight text-yellow text-base font-bold px-6 py-4 rounded-2xl flex items-center gap-3">
          <span className="text-2xl leading-none">✓</span>
          {toastMsg}
        </div>
      </div>
    </>
  )
}
