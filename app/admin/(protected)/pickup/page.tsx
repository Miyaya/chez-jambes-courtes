import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NouveauCreneauDialog } from './_components/NouveauCreneauDialog'
import { PickupSlotsView, type PickupSlot } from './_components/PickupSlotsView'

export const metadata = { title: 'Pickup — Admin' }

export default async function PickupAdminPage() {
  await requireAdmin()

  const admin = createAdminClient()

  const [{ data: slots }, { data: purchaseTrips }] = await Promise.all([
    admin
      .from('pickup_slots')
      .select(`
        id, label, slot_at, location, active,
        purchase_trips(id, purchase_date, note),
        orders(
          order_number, status, subtotal, tracking_token,
          customer_prenom, customer_nom, customer_email, customer_phone, line_username,
          note, items, payment_method
        )
      `)
      .order('slot_at', { ascending: true }),
    admin
      .from('purchase_trips')
      .select('id, purchase_date, note')
      .order('purchase_date', { ascending: false }),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-midnight">
          Pickup · 取貨時段
        </h1>
        <NouveauCreneauDialog purchaseTrips={purchaseTrips ?? []} />
      </div>

      <PickupSlotsView slots={(slots ?? []) as unknown as PickupSlot[]} purchaseTrips={purchaseTrips ?? []} />
    </div>
  )
}
