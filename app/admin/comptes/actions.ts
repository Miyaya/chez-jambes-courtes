'use server'

import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function fetchCustomerOrdersAction(email: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('orders')
    .select('id, order_number, status, created_at, items, subtotal, discount_amount, total_amount, note, pickup_slots(label)')
    .eq('customer_email', email)
    .order('created_at', { ascending: false })
  return data ?? []
}
