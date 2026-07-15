'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createPurchaseTripAction(formData: FormData) {
  const purchase_date = formData.get('purchase_date')?.toString().trim()
  const note          = formData.get('note')?.toString().trim() || null

  if (!purchase_date) return

  const admin = createAdminClient()
  await admin.from('purchase_trips').insert({ purchase_date, note })
  revalidatePath('/admin/achats')
}

export async function deletePurchaseTripAction(id: string) {
  const admin = createAdminClient()
  await admin.from('purchase_trips').delete().eq('id', id)
  revalidatePath('/admin/achats')
}

export async function updatePurchaseTripSlotsAction(tripId: string, slotIds: string[]) {
  const admin = createAdminClient()
  await admin.from('pickup_slots').update({ purchase_trip_id: null }).eq('purchase_trip_id', tripId)
  if (slotIds.length) {
    await admin.from('pickup_slots').update({ purchase_trip_id: tripId }).in('id', slotIds)
  }
  revalidatePath('/admin/achats')
  revalidatePath('/admin/pickup')
}
