'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'

type SubscribeResult =
  | { data: 'subscribed'; error: null }
  | { data: null; error: 'already_subscribed' | 'email_failed' | 'unknown'; detail?: string }

export async function subscribeAction(
  email: string,
  name: string,
  source: 'prelaunch' | 'checkout' = 'prelaunch',
): Promise<SubscribeResult> {
  const supabase = createServerClient()

  const cleanEmail = email.trim().toLowerCase()
  const cleanName = name.trim() || null

  const { error: dbError } = await supabase.from('subscribers').insert({
    email: cleanEmail,
    name: cleanName,
    source,
    active: true,
  })

  if (dbError) {
    if (dbError.code === '23505') return { data: null, error: 'already_subscribed' }
    return { data: null, error: 'unknown', detail: dbError.message }
  }

  try {
    await sendWelcomeEmail(cleanEmail, cleanName)
  } catch (err) {
    console.error('[email]', err)
    return { data: null, error: 'email_failed', detail: String(err) }
  }

  return { data: 'subscribed', error: null }
}

export async function resubscribeAction(email: string, token: string) {
  if (!verifyUnsubscribeToken(email, token)) return

  const supabase = createAdminClient()
  await supabase.from('subscribers').update({ active: true }).eq('email', email)

  const params = new URLSearchParams({ email, token, resubscribed: 'true' })
  redirect(`/se-desabonner?${params}`)
}
