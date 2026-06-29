'use client'

import { useActionState } from 'react'
import { updateProfileAction } from '../actions'

const inputClass = 'w-full rounded-xl border border-midnight/15 bg-midnight/3 px-4 py-2.5 text-sm text-midnight placeholder:text-midnight/30 focus:outline-none focus:border-midnight/40 transition-colors'

type Props = {
  customerId: string
  prenom: string
  nom: string
  phone: string | null
}

export function ProfileForm({ customerId, prenom, nom, phone }: Props) {
  const action = updateProfileAction.bind(null, customerId)
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-midnight/40 uppercase tracking-wider mb-1.5">
            Prénom · 名字 <span className="text-red-400">*</span>
          </label>
          <input name="prenom" defaultValue={prenom} required className={inputClass} placeholder="Sophie" />
        </div>
        <div>
          <label className="block text-xs text-midnight/40 uppercase tracking-wider mb-1.5">
            Nom · 姓氏 <span className="text-red-400">*</span>
          </label>
          <input name="nom" defaultValue={nom} required className={inputClass} placeholder="Martin" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-midnight/40 uppercase tracking-wider mb-1.5">
          Téléphone · 電話
        </label>
        <input name="phone" defaultValue={phone ?? ''} className={inputClass} placeholder="+33 6 xx xx xx xx" />
      </div>

      {state?.error && (
        <p className="text-xs text-red-500">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-xs text-green-600">Mis à jour · 已更新</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-midnight text-orange hover:bg-orange hover:text-midnight border-2 border-midnight transition-colors disabled:opacity-50"
      >
        {pending ? 'Enregistrement…' : 'Enregistrer · 儲存'}
      </button>
    </form>
  )
}
