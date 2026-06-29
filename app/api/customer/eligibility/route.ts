import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')?.trim().toLowerCase()
  if (!email) return NextResponse.json({ eligible: false })

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('customers')
    .select('has_complete_order')
    .eq('email', email)
    .single()

  return NextResponse.json({ eligible: data?.has_complete_order === true })
}
