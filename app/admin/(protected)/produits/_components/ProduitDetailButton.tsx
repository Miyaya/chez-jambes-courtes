'use client'

import { useState } from 'react'

type Props = {
  name_tw: string
  name_fr: string
  description: string | null
  image_url: string | null
  supplier: string | null
}

export function ProduitDetailButton({ name_tw, name_fr, description, image_url, supplier }: Props) {
  const [open, setOpen] = useState(false)

  if (!description && !image_url && !supplier) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-midnight/40 hover:text-midnight border border-midnight/15 rounded-lg px-2.5 py-1.5 hover:border-midnight/30 transition-colors whitespace-nowrap"
      >
        Détails
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-midnight">{name_tw}</h2>
                  <p className="text-sm text-midnight/40">{name_fr}</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-midnight/30 hover:text-midnight text-xl leading-none p-1 -mt-1 -mr-1"
                >
                  ✕
                </button>
              </div>

              {image_url && (
                <img
                  src={image_url}
                  alt={name_fr}
                  className="w-full rounded-xl object-cover mb-4 max-h-48"
                />
              )}

              {description && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-midnight/40 mb-1">Description</p>
                  <p className="text-sm text-midnight leading-relaxed">{description}</p>
                </div>
              )}

              {supplier && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-midnight/40 mb-1">Fournisseur</p>
                  <p className="text-sm font-bold text-midnight">{supplier}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
