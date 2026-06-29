import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { CommandesTable, type Order } from './_components/CommandesTable'

export const metadata = { title: 'Commandes — Admin' }

export default async function CommandesAdminPage() {
  await requireAdmin()

  const supabase = createAdminClient()

  const [{ data: orders }, { data: allEmails }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, customer_prenom, customer_nom, customer_email, customer_phone, status, flag, subtotal, discount_amount, total_amount, created_at, tracking_token, note, items, payment_method, pickup_slots(label, location)')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('orders')
      .select('customer_email'),
  ])

  const emailCount: Record<string, number> = {}
  for (const o of allEmails ?? []) {
    emailCount[o.customer_email] = (emailCount[o.customer_email] ?? 0) + 1
  }
  const firstTimeEmails = Object.entries(emailCount)
    .filter(([, count]) => count === 1)
    .map(([email]) => email)

  return (
    <div>
      <h1 className="text-lg font-bold text-midnight mb-6">
        Commandes
        {orders?.length ? (
          <span className="text-sm font-normal text-midnight/40 ml-2">{orders.length}</span>
        ) : null}
      </h1>

      <CommandesTable
        orders={(orders ?? []) as unknown as Order[]}
        firstTimeEmails={firstTimeEmails}
      />
    </div>
  )
}
