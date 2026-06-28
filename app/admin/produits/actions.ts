'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function toggleAvailabilityAction(productId: string, available: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('products').update({ available }).eq('id', productId)
  revalidatePath('/admin/produits')
}

export async function updateStockAction(productId: string, stock_quantity: number) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('products').update({ stock_quantity }).eq('id', productId)
  revalidatePath('/admin/produits')
}

export async function createProductAction(formData: FormData) {
  await requireAdmin()

  const name_fr        = (formData.get('name_fr') as string).trim()
  const name_tw        = (formData.get('name_tw') as string).trim()
  const origin         = (formData.get('origin') as string).trim()
  const unit_label     = (formData.get('unit_label') as string).trim()
  const unit_price     = Math.round(parseFloat(formData.get('unit_price') as string) * 100)
  const stock_quantity = parseInt(formData.get('stock_quantity') as string, 10) || 0
  const supplier       = (formData.get('supplier') as string).trim() || null
  const costRaw        = formData.get('cost') as string
  const cost           = costRaw ? Math.round(parseFloat(costRaw) * 100) : null

  if (!name_fr || !name_tw || !origin || !unit_label || isNaN(unit_price)) return

  const image_url    = (formData.get('image_url') as string).trim() || null
  const description  = (formData.get('description') as string).trim() || null
  const available    = formData.get('available') === 'on'

  const supabase = createAdminClient()
  await supabase.from('products').insert({
    name_fr, name_tw, origin, unit_label, unit_price,
    stock_quantity, supplier, cost, image_url, description, available,
  })
  revalidatePath('/admin/produits')
}
