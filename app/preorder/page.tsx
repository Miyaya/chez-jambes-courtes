import { createServerClient } from '@/lib/supabase/server'
import ShopClient from '@/app/_components/ShopClient'
import type { PublicProduct } from '@/app/_components/ShopClient'

const hero = {
  zh: '這是預購的頁面，未能保證一定買到的，沒有買到的會全額退款，約一週後可以面交。',
  fr: 'Page de précommande — la disponibilité n\'est pas garantie. En cas d\'indisponibilité, vous serez intégralement remboursé. Remise en main propre sous environ une semaine.',
}

export default async function PreorderPage() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('public_products')
    .select('*')
    .order('created_at', { ascending: true })

  return <ShopClient products={(data ?? []) as PublicProduct[]} hero={hero} />
}
