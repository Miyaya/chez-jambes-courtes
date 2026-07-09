import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { toggleDisplayFlashAction, toggleDisplayInstockAction } from './actions'

export const metadata = { title: 'Réglages — Admin' }

function ToggleSwitch({ checked, label, action }: { checked: boolean; label: string; action: () => Promise<void> }) {
  return (
    <form>
      <button
        type="submit"
        formAction={action}
        className={`relative block w-11 h-6 rounded-full cursor-pointer p-0 border-0 overflow-hidden transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-midnight/30 ${
          checked ? 'bg-midnight' : 'bg-midnight/20'
        }`}
        aria-label={`${label} — ${checked ? 'Désactiver' : 'Activer'}`}
      >
        <span
          className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </form>
  )
}

export default async function ReglagesAdminPage() {
  await requireAdmin()

  const supabase = createAdminClient()
  const { data: config } = await supabase
    .from('site_config')
    .select('display_flash, display_instock')
    .eq('id', 1)
    .single()

  const displayFlash = config?.display_flash ?? false
  const displayInstock = config?.display_instock ?? false

  return (
    <div>
      <h1 className="text-lg font-bold text-midnight mb-6">Réglages</h1>

      <div className="bg-white rounded-2xl border border-midnight/8 divide-y divide-midnight/5 max-w-md">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="font-bold text-midnight">顯示快閃 Afficher Flash</p>
            <p className="text-xs text-midnight/40 mt-0.5">兩者皆開時，Flash 優先顯示</p>
          </div>
          <ToggleSwitch
            checked={displayFlash}
            label="Flash"
            action={async () => {
              'use server'
              await toggleDisplayFlashAction(!displayFlash)
            }}
          />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="font-bold text-midnight">顯示現貨 Afficher Instock</p>
          </div>
          <ToggleSwitch
            checked={displayInstock}
            label="Instock"
            action={async () => {
              'use server'
              await toggleDisplayInstockAction(!displayInstock)
            }}
          />
        </div>
      </div>

      {!displayFlash && !displayInstock && (
        <p className="text-xs text-midnight/40 mt-3 max-w-md">
          兩者皆關閉時，前台會隱藏購物入口，首頁改導向「購物流程」頁面。
        </p>
      )}
    </div>
  )
}
