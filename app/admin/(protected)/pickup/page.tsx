import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NouveauCreneauDialog } from './_components/NouveauCreneauDialog'
import { PickupSlotsView } from './_components/PickupSlotsView'

export const metadata = { title: 'Pickup — Admin' }

export default async function PickupAdminPage() {
  await requireAdmin()

  const admin = createAdminClient()

  const { data: slots } = await admin
    .from('pickup_slots')
    .select(`
      id, label, slot_at, location, active,
      orders(
        order_number, status, subtotal, tracking_token,
        customer_prenom, customer_nom, customer_email, customer_phone, line_username,
        note, items, payment_method
      )
    `)
    .order('slot_at', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-midnight">
          Pickup · 取貨時段
        </h1>
        <NouveauCreneauDialog />
      </div>

      <PickupSlotsView slots={slots ?? []} />
    </div>
  )
}
