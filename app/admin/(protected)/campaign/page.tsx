import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateCampaignVisible, updateCampaignDisplayDefault } from './actions'
import { ContentForm } from './_components/ContentForm'

export const metadata = { title: 'Campaign — Admin' }

function Toggle({ on, label, sublabel, action }: {
  on: boolean
  label: string
  sublabel: string
  action: () => Promise<void>
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="text-sm font-bold text-midnight">{label}</p>
        <p className="text-xs text-midnight/40 mt-0.5">{sublabel}</p>
      </div>
      <form>
        <button
          type="submit"
          formAction={action}
          className={`relative block w-11 h-6 rounded-full cursor-pointer p-0 border-0 overflow-hidden transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-midnight/30 ${
            on ? 'bg-midnight' : 'bg-midnight/20'
          }`}
          aria-label={on ? 'Désactiver' : 'Activer'}
        >
          <span
            className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
              on ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </form>
    </div>
  )
}

export default async function CampaignAdminPage() {
  await requireAdmin()

  const supabase = createAdminClient()
  const { data: campaign } = await supabase
    .from('campaign')
    .select('id, content, display_default, visible')
    .limit(1)
    .maybeSingle()

  if (!campaign) {
    return <p className="text-sm text-midnight/40">Aucune campagne trouvée.</p>
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-midnight mb-6">Bandeau · 跑馬燈</h1>

      <div className="bg-white rounded-2xl border border-midnight/8 shadow-sm divide-y divide-midnight/8 max-w-2xl">

        <div className="p-6">
          <Toggle
            on={campaign.visible}
            label="Afficher le bandeau"
            sublabel="顯示跑馬燈"
            action={async () => {
              'use server'
              await updateCampaignVisible(campaign.id, !campaign.visible)
            }}
          />
        </div>

        <div className="p-6">
          <Toggle
            on={campaign.display_default}
            label="Texte par défaut"
            sublabel="顯示預設內容（下次採購日期）"
            action={async () => {
              'use server'
              await updateCampaignDisplayDefault(campaign.id, !campaign.display_default)
            }}
          />
        </div>

        <div className="p-6">
          <p className="text-sm font-bold text-midnight mb-0.5">Contenu personnalisé</p>
          <p className="text-xs text-midnight/40 mb-4">
            自訂文字 · 關閉「Texte par défaut」後顯示
          </p>
          <ContentForm
            id={campaign.id}
            defaultContent={campaign.content ?? ''}
            disabled={campaign.display_default}
          />
        </div>

      </div>
    </div>
  )
}
