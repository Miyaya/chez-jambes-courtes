'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function toggleFlashAction(productId: string, visible_flash: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('products').update({ visible_flash }).eq('id', productId)
  revalidatePath('/admin/produits')
}

export async function toggleInstockAction(productId: string, visible_instock: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('products').update({ visible_instock }).eq('id', productId)
  revalidatePath('/admin/produits')
}

export async function toggleHasPriceRangeAction(productId: string, has_price_range: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('products').update({ has_price_range }).eq('id', productId)
  revalidatePath('/admin/produits')
}

export async function updateStockAction(productId: string, stock_quantity: number) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('products').update({ stock_quantity }).eq('id', productId)
  revalidatePath('/admin/produits')
}

export async function updateProductAction(productId: string, formData: FormData) {
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

  const image_url       = (formData.get('image_url') as string).trim() || null
  const description     = (formData.get('description') as string).trim() || null
  const visible_instock = formData.get('visible_instock') === 'on'
  const visible_flash   = formData.get('visible_flash') === 'on'
  const has_price_range = formData.get('has_price_range') === 'on'

  let preference_options: string[] = []
  try {
    const parsed = JSON.parse((formData.get('preference_options') as string) || '[]')
    if (Array.isArray(parsed)) preference_options = parsed.filter(o => typeof o === 'string' && o.trim()).map(o => o.trim())
  } catch {
    // ignore malformed input, fall back to empty list
  }

  const supabase = createAdminClient()
  await supabase.from('products').update({
    name_fr, name_tw, origin, unit_label, unit_price,
    stock_quantity, supplier, cost, image_url, description,
    visible_instock, visible_flash, has_price_range,
    preference_options,
  }).eq('id', productId)
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

  const image_url       = (formData.get('image_url') as string).trim() || null
  const description     = (formData.get('description') as string).trim() || null
  const visible_instock = formData.get('visible_instock') === 'on'

  const supabase = createAdminClient()
  await supabase.from('products').insert({
    name_fr, name_tw, origin, unit_label, unit_price,
    stock_quantity, supplier, cost, image_url, description, visible_instock,
  })
  revalidatePath('/admin/produits')
}
