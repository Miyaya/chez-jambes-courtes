'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function toggleDisplayFlashAction(display_flash: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('site_config').update({ display_flash }).eq('id', 1)
  revalidatePath('/', 'layout')
}

export async function toggleDisplayInstockAction(display_instock: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('site_config').update({ display_instock }).eq('id', 1)
  revalidatePath('/', 'layout')
}
