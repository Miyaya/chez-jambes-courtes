import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/siteConfig'
import ShopClient from '@/app/_components/ShopClient'
import type { PublicProduct } from '@/app/_components/ShopClient'

const hero = {
  zh: '快閃預購：4AM 前預購，我們當天去現場幫你買！（沒有意外的話應該都買得到）',
  fr: 'Vente flash – Précommande : avant 4h du mat\', on se charge de tout sur place. (Sauf cas de force majeure, les stocks devraient suffire.)'
}

export default async function FlashPage() {
  const { display_flash } = await getSiteConfig()
  if (!display_flash) redirect('/')

  const supabase = createServerClient()
  const { data } = await supabase
    .from('public_products')
    .select('*')
    .order('created_at', { ascending: true })

  return <ShopClient products={(data ?? []) as PublicProduct[]} hero={hero} channel="flash" />
}
