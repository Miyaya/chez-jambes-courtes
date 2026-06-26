'use server'

import { redirect } from 'next/navigation'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'

export async function subscribeAction(
  email: string,
  name: string
): Promise<{ error: 'already_subscribed' | 'unknown' }> {
  const supabase = createServerClient()

  const cleanEmail = email.trim().toLowerCase()
  const cleanName = name.trim() || null

  const { error } = await supabase.from('subscribers').insert({
    email: cleanEmail,
    name: cleanName,
    source: 0, // 0 = prelaunch
    active: true,
  })

  if (!error) {
    // Fire-and-forget — don't block the redirect on email delivery
    const { ctx } = getCloudflareContext()
    ctx.waitUntil(sendWelcomeEmail(cleanEmail, cleanName).catch((err) => console.error('[email]', err)))
    redirect('/merci')
  }

  if (error.code === '23505') return { error: 'already_subscribed' }
  return { error: 'unknown' }
}

export async function resubscribeAction(email: string, token: string) {
  if (!verifyUnsubscribeToken(email, token)) return

  const supabase = createAdminClient()
  await supabase.from('subscribers').update({ active: true }).eq('email', email)

  const params = new URLSearchParams({ email, token, resubscribed: 'true' })
  redirect(`/se-desabonner?${params}`)
}
