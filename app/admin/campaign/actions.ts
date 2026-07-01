'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function updateCampaignVisible(id: string, visible: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('campaign').update({ visible }).eq('id', id)
  revalidatePath('/', 'layout')
  revalidatePath('/admin/campaign')
}

export async function updateCampaignDisplayDefault(id: string, displayDefault: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('campaign').update({ display_default: displayDefault }).eq('id', id)
  revalidatePath('/', 'layout')
  revalidatePath('/admin/campaign')
}

export async function updateCampaignContent(id: string, content: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('campaign').update({ content }).eq('id', id)
  revalidatePath('/', 'layout')
  revalidatePath('/admin/campaign')
}
