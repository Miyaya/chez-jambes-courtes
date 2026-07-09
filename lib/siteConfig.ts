import { createServerClient } from '@/lib/supabase/server'

export type ActiveChannel = 'flash' | 'instock' | null

export type SiteConfig = { display_flash: boolean; display_instock: boolean }

export async function getSiteConfig(): Promise<SiteConfig> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('site_config')
    .select('display_flash, display_instock')
    .eq('id', 1)
    .single()

  return data ?? { display_flash: false, display_instock: false }
}

// Flash takes priority when both channels are enabled. Null means neither
// is enabled — the shopping entry point should be hidden.
export async function getActiveChannel(): Promise<ActiveChannel> {
  const { display_flash, display_instock } = await getSiteConfig()
  if (display_flash) return 'flash'
  if (display_instock) return 'instock'
  return null
}
