'use client'

import { useState } from 'react'
import { updateProductAction } from '../actions'

type Props = {
  productId: string
  name_fr: string
  name_tw: string
  origin: string
  unit_label: string
  unit_price: number
  cost: number | null
  stock_quantity: number
  supplier: string | null
  description: string | null
  image_url: string | null
  visible_instock: boolean
  visible_flash: boolean
  has_price_range: boolean
  preference_options: string[]
}

export function EditProduitDialog(props: Props) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<string[]>(props.preference_options)
  const [newOption, setNewOption] = useState('')

  function addOption() {
    const trimmed = newOption.trim()
    if (!trimmed || options.includes(trimmed)) return
    setOptions(o => [...o, trimmed])
    setNewOption('')
  }

  function removeOption(index: number) {
    setOptions(o => o.filter((_, i) => i !== index))
  }

  async function handleSubmit(formData: FormData) {
    await updateProductAction(props.productId, formData)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-midnight/40 hover:text-midnight border border-midnight/15 rounded-lg px-2.5 py-1.5 hover:border-midnight/30 transition-colors whitespace-nowrap"
      >
        Modifier
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
                <h2 className="text-lg font-bold text-midnight">Modifier le produit</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-midnight/30 hover:text-midnight text-xl leading-none p-1 -mr-1"
                >
                  ✕
                </button>
              </div>

              <form action={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nom (FR)" name="name_fr" required defaultValue={props.name_fr} />
                  <Field label="Nom (TW)" name="name_tw" required defaultValue={props.name_tw} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Origine" name="origin" required defaultValue={props.origin} />
                  <Field label="Unité" name="unit_label" required defaultValue={props.unit_label} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prix (€)" name="unit_price" type="number" required step="0.01" min="0" defaultValue={(props.unit_price / 100).toFixed(2)} />
                  <Field label="Coût (€)" name="cost" type="number" step="0.01" min="0" defaultValue={props.cost != null ? (props.cost / 100).toFixed(2) : ''} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Stock (0 = Flash)" name="stock_quantity" type="number" min="0" defaultValue={String(props.stock_quantity)} />
                  <Field label="Fournisseur" name="supplier" placeholder="Optionnel" defaultValue={props.supplier ?? ''} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={props.description ?? ''}
                    className="w-full text-sm text-midnight border border-midnight/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-midnight/20 placeholder:text-midnight/25 resize-none"
                  />
                </div>

                <Field label="Image URL" name="image_url" defaultValue={props.image_url ?? ''} />

                <div className="space-y-1">
                  <ToggleField label="Afficher en flash" name="visible_flash" defaultChecked={props.visible_flash} />
                  <ToggleField label="Afficher en instock" name="visible_instock" defaultChecked={props.visible_instock} />
                  <ToggleField label="Range" name="has_price_range" defaultChecked={props.has_price_range} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-midnight/50 uppercase tracking-wider mb-1.5">
                    Preference options
                  </label>
                  {options.length > 0 && (
                    <ul className="space-y-1.5 mb-2">
                      {options.map((option, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between gap-2 text-sm text-midnight border border-midnight/15 rounded-lg px-3 py-1.5"
                        >
                          <span className="truncate">{option}</span>
                          <button
                            type="button"
                            onClick={() => removeOption(i)}
                            className="text-midnight/30 hover:text-midnight shrink-0 leading-none"
                            aria-label={`Retirer ${option}`}
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={e => setNewOption(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addOption()
                        }
                      }}
                      placeholder="ex. Grand (≥400g)"
                      className="flex-1 text-sm text-midnight border border-midnight/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-midnight/20 placeholder:text-midnight/25"
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      className="shrink-0 text-xs font-bold uppercase tracking-wider px-4 rounded-lg border border-midnight/20 text-midnight/60 hover:border-midnight/40 hover:text-midnight transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  <input type="hidden" name="preference_options" value={JSON.stringify(options)} />
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

function ToggleField({ label, name, defaultChecked }: { label: string; name: string; defaultChecked: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs font-bold text-midnight/50 uppercase tracking-wider">
        {label}
      </span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 rounded-full bg-midnight/20 peer-checked:bg-midnight transition-colors duration-200" />
        <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5" />
      </label>
    </div>
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
