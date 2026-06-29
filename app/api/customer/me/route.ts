import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createAuthClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json(null)

  const admin = createAdminClient()
  const { data: customer } = await admin
    .from('customers')
    .select('prenom, nom, email, phone')
    .eq('auth_user_id', user.id)
    .single()

  if (!customer) return NextResponse.json(null)

  return NextResponse.json(customer)
}
