'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

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
    sendWelcomeEmail(cleanEmail, cleanName).catch(() => {})
    redirect('/merci')
  }

  if (error.code === '23505') return { error: 'already_subscribed' }
  return { error: 'unknown' }
}
