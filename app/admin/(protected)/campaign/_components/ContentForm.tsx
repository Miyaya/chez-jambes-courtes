'use client'

import { useState } from 'react'
import { updateCampaignContent } from '../actions'

export function ContentForm({
  id,
  defaultContent,
  disabled,
}: {
  id: string
  defaultContent: string
  disabled: boolean
}) {
  const [content, setContent] = useState(defaultContent)
  const [isDirty, setIsDirty] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  function showToast() {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  async function handleSave() {
    await updateCampaignContent(id, content)
    setIsDirty(false)
    showToast()
  }

  return (
    <>
      <div className="space-y-3">
        <textarea
          value={content}
          onChange={e => {
            setContent(e.target.value)
            setIsDirty(e.target.value !== defaultContent)
          }}
          rows={4}
          disabled={disabled}
          className={`w-full text-sm border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 resize-none transition-colors ${
            disabled
              ? 'border-midnight/8 text-midnight/25 bg-midnight/3 cursor-not-allowed'
              : 'border-midnight/15 text-midnight bg-white focus:ring-midnight/20'
          }`}
        />
        <button
          onClick={handleSave}
          disabled={!isDirty || disabled}
          className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors ${
            isDirty && !disabled
              ? 'bg-midnight text-white hover:bg-midnight/80'
              : 'bg-midnight/8 text-midnight/25 cursor-not-allowed'
          }`}
        >
          Enregistrer
        </button>
      </div>

      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <div className="bg-midnight text-yellow text-base font-bold px-6 py-4 rounded-2xl flex items-center gap-3">
          <span className="text-2xl leading-none">✓</span>
          Contenu mis à jour
        </div>
      </div>
    </>
  )
}
