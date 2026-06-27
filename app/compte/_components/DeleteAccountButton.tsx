'use client'

export function DeleteAccountButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={e => {
        if (
          !confirm(
            'Supprimer définitivement votre compte ?\n\n確定永久刪除帳號？此操作無法復原。',
          )
        ) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 rounded-xl px-4 py-2.5 transition-colors"
      >
        Supprimer mon compte · 刪除帳號
      </button>
    </form>
  )
}
