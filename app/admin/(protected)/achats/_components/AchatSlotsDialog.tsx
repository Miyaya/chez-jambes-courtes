'use client'

import { useState, useTransition } from 'react'
import { updatePurchaseTripSlotsAction } from '../actions'

type Slot = {
  id: string
  label: string
  slot_at: string
  location: string | null
  purchase_trip_id: string | null
}

function formatSlotDate(slot_at: string) {
  return new Date(slot_at).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export function AchatSlotsDialog({ tripId, tripLabel, slots }: { tripId: string; tripLabel: string; slots: Slot[] }) {
  const linkedSlots = slots.filter(s => s.purchase_trip_id === tripId)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(() => new Set(linkedSlots.map(s => s.id)))
  const [isPending, startTransition] = useTransition()

  function openDialog() {
    setSelected(new Set(linkedSlots.map(s => s.id)))
    setOpen(true)
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSave() {
    startTransition(async () => {
      await updatePurchaseTripSlotsAction(tripId, Array.from(selected))
      setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={openDialog}
        className="text-left"
      >
        {linkedSlots.length ? (
          <div className="flex flex-wrap gap-1">
            {linkedSlots.map(s => (
              <span key={s.id} className="text-xs bg-midnight/8 text-midnight/60 rounded-full px-2 py-0.5">
                {s.label}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-midnight/25 hover:text-midnight/50 transition-colors">+ associer des créneaux</span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-midnight/10 w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-midnight">Créneaux liés</h2>
                <button onClick={() => setOpen(false)} className="text-midnight/30 hover:text-midnight text-xl leading-none p-1 -mr-1">✕</button>
              </div>
              <p className="text-xs text-midnight/40">{tripLabel}</p>
            </div>

            <div className="px-6 overflow-y-auto flex-1 space-y-1.5">
              {!slots.length && (
                <p className="text-sm text-midnight/35 py-4">Aucun créneau de pickup n&apos;existe encore.</p>
              )}
              {slots.map(slot => (
                <label
                  key={slot.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl border border-midnight/10 hover:border-midnight/25 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(slot.id)}
                    onChange={() => toggle(slot.id)}
                    className="accent-midnight w-4 h-4 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-midnight truncate">{slot.label}</p>
                    <p className="text-xs text-midnight/35">
                      {formatSlotDate(slot.slot_at)}{slot.location ? ` · ${slot.location}` : ''}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3 p-6 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl border border-midnight/20 text-midnight/50 hover:text-midnight transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="flex-1 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl bg-midnight text-white hover:bg-midnight/80 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
