'use client'

import { useRef, useState } from 'react'
import { createPickupSlotAction } from '../actions'

type PurchaseTrip = {
  id: string
  purchase_date: string
  note: string | null
}

function fmtTripDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function NouveauCreneauDialog({ purchaseTrips }: { purchaseTrips: PurchaseTrip[] }) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const date = formData.get('slot_date') as string
    const time = formData.get('slot_time') as string
    if (date && time) {
      // date/time inputs have no timezone — interpret them in the admin's
      // own local time (Paris) and convert to an unambiguous UTC instant.
      formData.set('slot_at', new Date(`${date}T${time}`).toISOString())
    }
    await createPickupSlotAction(formData)
    formRef.current?.reset()
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl bg-midnight text-white hover:bg-midnight/80 transition-colors"
      >
        + Nouveau créneau
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
                <h2 className="text-lg font-bold text-midnight">Nouveau créneau · 新增取貨時段</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-midnight/30 hover:text-midnight text-xl leading-none p-1 -mr-1"
                >
                  ✕
                </button>
              </div>

              <form ref={formRef} action={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1">
                    Libellé <span className="text-magenta ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="label"
                    required
                    placeholder="Sam 28 juin 15h00 — Paris 11e"
                    className="w-full text-sm text-midnight border border-midnight/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-midnight/20 placeholder:text-midnight/25"
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
                    defaultValue=""
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
                    <input type="checkbox" name="active" defaultChecked className="sr-only peer" />
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
                    Créer
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
