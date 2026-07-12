import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { CommandesTable, type Order, type Product, type PickupSlot } from './_components/CommandesTable'

export const metadata = { title: 'Commandes — Admin' }

export default async function CommandesAdminPage() {
  await requireAdmin()

  const supabase = createAdminClient()

  const [{ data: orders }, { data: allEmails }, { data: products }, { data: pickupSlots }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, customer_prenom, customer_nom, customer_email, customer_phone, line_username, status, flag, subtotal, discount_amount, total_amount, created_at, tracking_token, note, cancel_reason, items, payment_method, pickup_slot_id, pickup_slots(label, location)')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('orders')
      .select('customer_email, status'),
    supabase
      .from('products')
      .select('id, name_fr, name_tw, unit_label, unit_price, preference_options')
      .order('name_fr'),
    supabase
      .from('pickup_slots')
      .select('id, label, location, active')
      .order('slot_at', { ascending: true }),
  ])

  // "New" = no completed order yet — same definition as the has_complete_order
  // flag on `customers`, but derived straight from orders since guest checkouts
  // don't always have a row in `customers`.
  const completedEmails = new Set(
    (allEmails ?? []).filter(o => o.status === 'complete').map(o => o.customer_email)
  )
  const allEmailsSeen = new Set((allEmails ?? []).map(o => o.customer_email))
  const newEmails = Array.from(allEmailsSeen).filter(email => !completedEmails.has(email))

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
        newEmails={newEmails}
        products={(products ?? []) as unknown as Product[]}
        pickupSlots={(pickupSlots ?? []) as unknown as PickupSlot[]}
      />
    </div>
  )
}
