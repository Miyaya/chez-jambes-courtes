'use client'

import { useRef, useState } from 'react'
import { createPurchaseTripAction } from '../actions'

const inputClass = 'w-full rounded-xl border border-midnight/15 bg-midnight/3 px-4 py-2.5 text-sm text-midnight focus:outline-none focus:border-midnight/40 transition-colors'

export function NouvelAchatDialog() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    await createPurchaseTripAction(formData)
    formRef.current?.reset()
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl bg-midnight text-white hover:bg-midnight/80 transition-colors"
      >
        + Nouvel achat
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-midnight">Nouvel achat · 新增採購</h2>
                <button onClick={() => setOpen(false)} className="text-midnight/30 hover:text-midnight text-xl leading-none p-1 -mr-1">✕</button>
              </div>

              <form ref={formRef} action={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1.5">
                    Date d&apos;achat · 採購日期 <span className="text-red-400">*</span>
                  </label>
                  <input type="date" name="purchase_date" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1.5">
                    Note interne · 備註
                  </label>
                  <textarea name="note" rows={3} className={`${inputClass} resize-none`} placeholder="ex. Mangues Keitt commandées chez Wang..." />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl border border-midnight/20 text-midnight/50 hover:text-midnight transition-colors">
                    Annuler
                  </button>
                  <button type="submit" className="flex-1 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl bg-midnight text-white hover:bg-midnight/80 transition-colors">
                    Créer · 建立
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
