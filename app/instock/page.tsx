import { createServerClient } from '@/lib/supabase/server'
import ShopClient from '@/app/_components/ShopClient'
import type { PublicProduct } from '@/app/_components/ShopClient'

const hero = {
  zh: '這是目前有現貨的商品，可以直接購買，原則上一週內面交。',
  fr: 'Ces produits sont actuellement disponibles en stock et peuvent être commandés immédiatement. Remise en main propre sous une semaine en principe.',
}

export default async function InstockPage() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('instock_products')
    .select('*')
    .order('created_at', { ascending: true })

  return <ShopClient products={(data ?? []) as PublicProduct[]} hero={hero} />
}
