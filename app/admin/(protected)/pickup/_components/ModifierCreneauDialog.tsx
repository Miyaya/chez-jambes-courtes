'use client'

import { useState } from 'react'
import { updatePickupSlotAction } from '../actions'

export type PurchaseTripOption = {
  id: string
  purchase_date: string
  note: string | null
}

type Slot = {
  id: string
  label: string
  slot_at: string
  location: string | null
  active: boolean
  purchase_trips: { id: string } | null
}

function fmtTripDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function toDateInputValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function toTimeInputValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function ModifierCreneauDialog({ slot, purchaseTrips }: { slot: Slot; purchaseTrips: PurchaseTripOption[] }) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const date = formData.get('slot_date') as string
    const time = formData.get('slot_time') as string
    if (date && time) {
      // date/time inputs have no timezone — interpret them in the admin's
      // own local time (Paris) and convert to an unambiguous UTC instant.
      formData.set('slot_at', new Date(`${date}T${time}`).toISOString())
    }
    await updatePickupSlotAction(slot.id, formData)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold text-midnight/40 hover:text-midnight transition-colors px-2 py-1"
      >
        Modifier
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-midnight/10 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-midnight">Modifier le créneau · 編輯取貨時段</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-midnight/30 hover:text-midnight text-xl leading-none p-1 -mr-1"
                >
                  ✕
                </button>
              </div>

              <form action={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1">
                    Libellé <span className="text-magenta ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="label"
                    required
                    defaultValue={slot.label}
                    className="w-full text-sm text-midnight border border-midnight/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-midnight/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1">
                      Date <span className="text-magenta ml-0.5">*</span>
                    </label>
                    <input
                      type="date"
                      name="slot_date"
                      required
                      defaultValue={toDateInputValue(slot.slot_at)}
                      className="w-full text-sm text-midnight border border-midnight/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-midnight/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1">
                      Heure <span className="text-magenta ml-0.5">*</span>
                    </label>
                    <input
                      type="time"
                      name="slot_time"
                      required
                      defaultValue={toTimeInputValue(slot.slot_at)}
                      className="w-full text-sm text-midnight border border-midnight/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-midnight/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1">
                    Lieu
                  </label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={slot.location ?? ''}
                    placeholder="Optionnel"
                    className="w-full text-sm text-midnight border border-midnight/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-midnight/20 placeholder:text-midnight/25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1">
                    Achat lié
                  </label>
                  <select
                    name="purchase_trip_id"
                    defaultValue={slot.purchase_trips?.id ?? ''}
                    className="w-full text-sm text-midnight border border-midnight/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-midnight/20"
                  >
                    <option value="">Aucun</option>
                    {purchaseTrips.map(trip => (
                      <option key={trip.id} value={trip.id}>
                        {fmtTripDate(trip.purchase_date)}{trip.note ? ` — ${trip.note}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-bold text-midnight/50 uppercase tracking-wider">
                    Actif
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="active" defaultChecked={slot.active} className="sr-only peer" />
                    <div className="w-11 h-6 rounded-full bg-midnight/20 peer-checked:bg-midnight transition-colors duration-200" />
                    <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5" />
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 border border-midnight/20 text-midnight/60 text-sm font-bold py-2.5 rounded-xl hover:border-midnight/40 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-midnight text-white text-sm font-bold py-2.5 rounded-xl hover:bg-midnight/80 transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
