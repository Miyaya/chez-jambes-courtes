'use client'

import { useState } from 'react'
import { updateStockAction } from '../actions'

export function StockInput({ productId, defaultValue }: { productId: string; defaultValue: number }) {
  const [isDirty, setIsDirty] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  function showToast() {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  async function handleSubmit(formData: FormData) {
    const qty = parseInt(formData.get('stock') as string, 10)
    if (!isNaN(qty)) {
      await updateStockAction(productId, qty)
      setIsDirty(false)
      showToast()
    }
  }

  return (
    <>
      <form action={handleSubmit}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="stock"
            defaultValue={defaultValue}
            min={0}
            onChange={e => setIsDirty(e.target.value !== String(defaultValue))}
            className={`w-16 text-sm font-bold border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 tabular-nums transition-colors ${
              isDirty
                ? 'border-yellow text-yellow focus:ring-yellow/30'
                : 'border-midnight/15 text-midnight focus:ring-midnight/20'
            }`}
          />
          <button
            type="submit"
            className={`text-xs underline underline-offset-2 transition-colors ${
              isDirty ? 'text-yellow font-bold hover:text-yellow/70' : 'text-midnight/40 hover:text-midnight'
            }`}
          >
            Enregistrer
          </button>
        </div>
      </form>

      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <div className="bg-green-400 text-green-950 text-base font-bold px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
          <span className="text-2xl leading-none">✓</span>
          Stock mis à jour
        </div>
      </div>
    </>
  )
}
