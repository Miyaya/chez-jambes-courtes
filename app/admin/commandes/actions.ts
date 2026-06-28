'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

type OrderStatus = 'received' | 'accepted' | 'processing' | 'validated' | 'partial_validated' | 'complete' | 'canceled'
type OrderFlag = 'shortage' | 'contact_needed' | 'postponed' | 'others' | 'no_show'

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('orders').update({ status }).eq('id', orderId)
  revalidatePath('/admin/commandes')
}

export async function updateFlagAction(orderId: string, flag: OrderFlag | null) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('orders').update({ flag }).eq('id', orderId)
  revalidatePath('/admin/commandes')
}
