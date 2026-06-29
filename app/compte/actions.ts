'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function signOutAction() {
  const supabase = await createAuthClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function toggleNewsletterAction(
  customerId: string,
  subscriberId: string | null,
  currentlyActive: boolean,
  email: string,
  name: string,
) {
  const admin = createAdminClient()

  if (!subscriberId) {
    // Check for an existing subscriber record with this email before inserting
    const { data: existing } = await admin
      .from('subscribers')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      await admin.from('subscribers').update({ active: true }).eq('id', existing.id)
      await admin.from('customers').update({ subscriber_id: existing.id }).eq('id', customerId)
    } else {
      const { data: newSub } = await admin
        .from('subscribers')
        .insert({ email, name, source: 'checkout', active: true })
        .select('id')
        .single()
      if (newSub) {
        await admin.from('customers').update({ subscriber_id: newSub.id }).eq('id', customerId)
      }
    }
  } else {
    await admin
      .from('subscribers')
      .update({ active: !currentlyActive })
      .eq('id', subscriberId)
  }

  revalidatePath('/compte')
}

export async function updateProfileAction(
  customerId: string,
  _prevState: { error?: string; ok?: boolean } | null,
  formData: FormData,
) {
  const prenom = formData.get('prenom')?.toString().trim() ?? ''
  const nom    = formData.get('nom')?.toString().trim() ?? ''
  const phone  = formData.get('phone')?.toString().trim() ?? ''

  if (!prenom || !nom) return { error: 'Prénom et nom requis · 姓名為必填' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('customers')
    .update({ prenom, nom, phone: phone || null })
    .eq('id', customerId)

  if (error) return { error: 'Erreur lors de la mise à jour · 更新失敗' }

  revalidatePath('/compte')
  return { ok: true }
}

export async function deleteAccountAction(userId: string) {
  const supabase = await createAuthClient()
  const admin = createAdminClient()

  await admin.auth.admin.deleteUser(userId)
  await supabase.auth.signOut()
  redirect('/')
}
