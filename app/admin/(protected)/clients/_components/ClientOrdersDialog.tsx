'use client'

import { useState } from 'react'
import { fetchCustomerOrdersAction } from '../actions'

type OrderStatus = 'received_preorder' | 'received_instock' | 'validated' | 'partial_validated' | 'complete' | 'canceled'

const STATUS: Record<OrderStatus, { label: string; color: string }> = {
  received_preorder: { label: 'Reçue (flash)',    color: 'bg-yellow/20 text-midnight' },
  received_instock:  { label: 'Reçue (en stock)', color: 'bg-yellow/20 text-midnight' },
  validated:         { label: 'Validée',         color: 'bg-green/15 text-dark-green' },
  partial_validated: { label: 'Part. validée',   color: 'bg-orange/12 text-orange' },
  complete:          { label: 'Terminée',        color: 'bg-midnight/8 text-midnight' },
  canceled:          { label: 'Annulée',         color: 'bg-midnight/5 text-midnight/40' },
}

type ItemSnapshot = {
  name_fr: string
  name_tw: string
  unit_label: string
  qty: number
  line_total: number
}

type Order = {
  id: string
  order_number: string | null
  status: OrderStatus
  created_at: string
  items: ItemSnapshot[]
  subtotal: number
  discount_amount: number
  total_amount: number
  note: string | null
  pickup_slots: { label: string }[] | null
}

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

export function ClientOrdersDialog({
  customerName,
  email,
}: {
  customerName: string
  email: string
}) {
  const [open, setOpen] = useState(false)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  async function handleOpen() {
    setOpen(true)
    if (orders === null) {
      setLoading(true)
      const data = await fetchCustomerOrdersAction(email)
      setOrders(data as Order[])
      setLoading(false)
    }
  }

  function toggleAccordion(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs text-midnight/40 hover:text-midnight border border-midnight/15 rounded-lg px-2.5 py-1.5 hover:border-midnight/30 transition-colors whitespace-nowrap"
      >
        Historique
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-midnight/10 w-full max-w-lg max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-midnight/8">
              <div>
                <p className="text-xs uppercase tracking-wider text-midnight/40 mb-0.5">Commandes</p>
                <h2 className="text-lg font-bold text-midnight">{customerName}</h2>
                <p className="text-xs text-midnight/35">{email}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-midnight/30 hover:text-midnight text-xl leading-none p-1 -mt-1 -mr-1 shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {loading && (
                <p className="text-sm text-midnight/40 text-center py-8">Chargement…</p>
              )}

              {!loading && orders?.length === 0 && (
                <p className="text-sm text-midnight/35 text-center py-8">Aucune commande.</p>
              )}

              {!loading && orders?.map(order => {
                const isOpen = expanded.has(order.id)
                const s = STATUS[order.status] ?? STATUS.received_preorder

                return (
                  <div key={order.id} className="border border-midnight/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleAccordion(order.id)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-midnight/2 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-bold text-midnight text-sm shrink-0">{order.order_number ?? '—'}</span>
                        <span className="text-xs text-midnight/35">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.color}`}>
                          {s.label}
                        </span>
                        <span className="text-midnight/30 text-xs">{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-midnight/8">
                        {order.pickup_slots && (
                          <p className="text-xs text-midnight/40 mt-3 mb-2">
                            📍 {order.pickup_slots[0]?.label}
                          </p>
                        )}

                        <div className="space-y-1.5 mt-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-baseline gap-2 text-sm">
                              <div>
                                <span className="font-medium text-midnight">{item.name_tw}</span>
                                <span className="text-xs text-midnight/40 ml-1.5">{item.name_fr}</span>
                                <span className="text-xs text-midnight/30 ml-1">× {item.qty} {item.unit_label}</span>
                              </div>
                              <span className="tabular-nums text-midnight font-medium shrink-0">
                                {centsToEur(item.line_total)} €
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-midnight/8 space-y-1">
                          {order.discount_amount > 0 && (
                            <div className="flex justify-between text-xs text-midnight/50">
                              <span>Sous-total</span>
                              <span className="tabular-nums">{centsToEur(order.subtotal)} €</span>
                            </div>
                          )}
                          {order.discount_amount > 0 && (
                            <div className="flex justify-between text-xs text-dark-green">
                              <span>Réduction</span>
                              <span className="tabular-nums">−{centsToEur(order.discount_amount)} €</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-bold text-midnight">
                            <span>Total</span>
                            <span className="tabular-nums">{centsToEur(order.total_amount)} €</span>
                          </div>
                        </div>

                        {order.note && (
                          <div className="mt-3 bg-yellow/12 rounded-lg px-3 py-2">
                            <p className="text-xs text-midnight/40 mb-0.5">Note</p>
                            <p className="text-xs text-midnight">{order.note}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
