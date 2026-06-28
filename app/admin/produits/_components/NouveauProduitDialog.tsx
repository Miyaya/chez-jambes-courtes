'use client'

import { useRef, useState } from 'react'
import { createProductAction } from '../actions'

export function NouveauProduitDialog() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    await createProductAction(formData)
    formRef.current?.reset()
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl bg-midnight text-white hover:bg-midnight/80 transition-colors"
      >
        + Nouveau produit
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-midnight">Nouveau produit</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-midnight/30 hover:text-midnight text-xl leading-none p-1 -mr-1"
                >
                  ✕
                </button>
              </div>

              <form ref={formRef} action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nom (FR)" name="name_fr" required placeholder="Mangue" />
                  <Field label="Nom (TW)" name="name_tw" required placeholder="芒果" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Origine" name="origin" required placeholder="Viêt Nam" />
                  <Field label="Unité" name="unit_label" required placeholder="顆" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prix (€)" name="unit_price" type="number" required placeholder="2.80" step="0.01" min="0" />
                  <Field label="Coût (€)" name="cost" type="number" placeholder="1.60" step="0.01" min="0" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Stock (0 = précommande)" name="stock_quantity" type="number" placeholder="0" min="0" defaultValue="0" />
                  <Field label="Fournisseur" name="supplier" placeholder="Optionnel" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Mangue douce et très parfumée…"
                    className="w-full text-sm text-midnight border border-midnight/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-midnight/20 placeholder:text-midnight/25 resize-none"
                  />
                </div>

                <Field label="Image URL" name="image_url" placeholder="/product_mangue.jpeg" />

                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-bold text-midnight/50 uppercase tracking-wider">
                    Disponible à la vente
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="available" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 rounded-full bg-midnight/20 peer-checked:bg-midnight transition-colors duration-200" />
                    <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5" />
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

function Field({
  label, name, required, placeholder, type = 'text', step, min, defaultValue,
}: {
  label: string
  name: string
  required?: boolean
  placeholder?: string
  type?: string
  step?: string
  min?: string
  defaultValue?: string
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        step={step}
        min={min}
        defaultValue={defaultValue}
        className="w-full text-sm text-midnight border border-midnight/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-midnight/20 placeholder:text-midnight/25"
      />
    </div>
  )
}
