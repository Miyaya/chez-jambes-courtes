'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createPickupSlotAction(formData: FormData) {
  await requireAdmin()

  const label    = (formData.get('label') as string).trim()
  const slot_at  = (formData.get('slot_at') as string).trim()
  const location = (formData.get('location') as string).trim() || null
  const active   = formData.get('active') === 'on'

  if (!label || !slot_at) return

  const supabase = createAdminClient()
  await supabase.from('pickup_slots').insert({ label, slot_at, location, active })
  revalidatePath('/admin/pickup')
}

export async function updatePickupSlotActiveAction(slotId: string, active: boolean) {
  await requireAdmin()

  const supabase = createAdminClient()
  const { error } = await supabase.from('pickup_slots').update({ active }).eq('id', slotId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/pickup')
}
