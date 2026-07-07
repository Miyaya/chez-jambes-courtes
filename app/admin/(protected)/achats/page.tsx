import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { deletePurchaseTripAction } from './actions'
import { NouvelAchatDialog } from './_components/NouvelAchatDialog'

export const metadata = { title: 'Achats — Admin' }

function fmt(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function AchatsAdminPage() {
  await requireAdmin()

  const admin = createAdminClient()
  const { data: trips } = await admin
    .from('purchase_trips')
    .select('id, purchase_date, note, created_at')
    .order('purchase_date', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-midnight mb-0.5">Achats · 採購行程</h1>
          <p className="text-sm text-midnight/40">{trips?.length ?? 0} enregistrement{(trips?.length ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <NouvelAchatDialog />
      </div>

      <div className="bg-white rounded-2xl border border-midnight/8 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-midnight/8 text-left">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Date d&apos;achat</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Note</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-midnight/5">
            {!trips?.length && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-midnight/35">
                  Aucun achat enregistré.
                </td>
              </tr>
            )}
            {(trips ?? []).map(trip => (
              <tr key={trip.id} className="hover:bg-midnight/2 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-bold text-midnight">{fmt(trip.purchase_date)}</p>
                  <p className="text-xs text-midnight/35">
                    {new Date(trip.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-midnight/60 max-w-xs">
                  {trip.note ?? <span className="text-midnight/25">—</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <form>
                    <button
                      type="submit"
                      formAction={async () => {
                        'use server'
                        await deletePurchaseTripAction(trip.id)
                      }}
                      className="text-xs text-midnight/30 hover:text-magenta transition-colors px-2 py-1"
                      aria-label="Supprimer"
                    >
                      Supprimer
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
