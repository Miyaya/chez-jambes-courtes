import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { ClientOrdersDialog } from './_components/ClientOrdersDialog'

export const metadata = { title: 'Clients — Admin' }

export default async function ClientsAdminPage() {
  await requireAdmin()

  const supabase = createAdminClient()

  const { data: customers } = await supabase
    .from('customers')
    .select('id, nom, prenom, email, phone, created_at, auth_user_id, subscriber_id, subscribers(active)')
    .order('created_at', { ascending: false })
    .limit(200)

  const { data: orderCounts } = await supabase
    .from('orders')
    .select('customer_email')

  const countByEmail: Record<string, number> = {}
  for (const o of orderCounts ?? []) {
    countByEmail[o.customer_email] = (countByEmail[o.customer_email] ?? 0) + 1
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-midnight mb-1">Clients</h1>
      <p className="text-sm text-midnight/40 mb-6">{customers?.length ?? 0} client{(customers?.length ?? 0) > 1 ? 's' : ''}</p>

      <div className="bg-white rounded-2xl border border-midnight/8 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-midnight/8 text-left">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Client</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Commandes</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Newsletter</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Type</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Inscrit le</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-midnight/5">
            {!customers?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-midnight/35">
                  Aucun client.
                </td>
              </tr>
            )}
            {(customers ?? []).map(customer => (
              <tr key={customer.id} className="hover:bg-midnight/2 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-bold text-midnight mb-0.5">{customer.prenom} {customer.nom}</p>
                  <p className="text-xs text-midnight/40">{customer.email}</p>
                  {customer.phone && (
                    <p className="text-xs text-midnight/40">{customer.phone}</p>
                  )}
                </td>
                <td className="px-4 py-3 font-bold text-midnight tabular-nums">
                  {countByEmail[customer.email] ?? 0}
                </td>
                <td className="px-4 py-3">
                  {/* @ts-expect-error — Supabase nested select returns object not array */}
                  {customer.subscribers?.active === true ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow/30 text-midnight">
                      Actif
                    </span>
                  ) : customer.subscriber_id ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-midnight/8 text-midnight/40">
                      Inactif
                    </span>
                  ) : (
                    <span className="text-[10px] text-midnight/25">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {customer.auth_user_id ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-midnight/8 text-midnight">
                      Compte
                    </span>
                  ) : (
                    <span className="text-[10px] text-midnight/30">Invité</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-midnight/40">
                  {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  <ClientOrdersDialog
                    customerName={`${customer.prenom} ${customer.nom}`}
                    email={customer.email}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
