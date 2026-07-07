import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { toggleFlashAction, toggleInstockAction, toggleHasPriceRangeAction } from './actions'
import { NouveauProduitDialog } from './_components/NouveauProduitDialog'
import { StockInput } from './_components/StockInput'
import { EditProduitDialog } from './_components/EditProduitDialog'

export const metadata = { title: 'Produits — Admin' }

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

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

export default async function ProduitsAdminPage() {
  await requireAdmin()

  const supabase = createAdminClient()
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name_fr, name_tw, origin, unit_price, promo_price, unit_label, visible_flash, visible_instock, has_price_range, stock_quantity, supplier, description, image_url, cost, preference_options')
    .order('name_fr')

  if (error) {
    console.error('[admin/produits] fetch error:', error)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-midnight">Produits</h1>
        <NouveauProduitDialog />
      </div>

      <div className="bg-white rounded-2xl border border-midnight/8 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-midnight/8 text-left">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Produit</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Origine</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Prix</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Stock</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Flash</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Instock</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Range</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-midnight/5">
            {!products?.length && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-midnight/35">
                  {error ? 'Erreur de chargement des produits — voir les logs serveur.' : 'Aucun produit.'}
                </td>
              </tr>
            )}
            {(products ?? []).map(product => (
                <tr key={product.id} className="hover:bg-midnight/2 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-midnight">{product.name_tw}</p>
                    <p className="text-xs text-midnight/40">{product.name_fr} · {product.unit_label}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-midnight/60">
                    {product.origin}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <p className="font-bold text-midnight">{centsToEur(product.unit_price)} €</p>
                    {product.promo_price && (
                      <p className="text-xs text-dark-green">{centsToEur(product.promo_price)} € promo</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StockInput productId={product.id} defaultValue={product.stock_quantity} />
                  </td>
                  <td className="px-4 py-3">
                    <ToggleSwitch
                      checked={product.visible_flash}
                      label="Flash"
                      action={async () => {
                        'use server'
                        await toggleFlashAction(product.id, !product.visible_flash)
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <ToggleSwitch
                      checked={product.visible_instock}
                      label="Instock"
                      action={async () => {
                        'use server'
                        await toggleInstockAction(product.id, !product.visible_instock)
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <ToggleSwitch
                      checked={product.has_price_range}
                      label="Range"
                      action={async () => {
                        'use server'
                        await toggleHasPriceRangeAction(product.id, !product.has_price_range)
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <EditProduitDialog
                      productId={product.id}
                      name_fr={product.name_fr}
                      name_tw={product.name_tw}
                      origin={product.origin}
                      unit_label={product.unit_label}
                      unit_price={product.unit_price}
                      cost={product.cost ?? null}
                      stock_quantity={product.stock_quantity}
                      supplier={product.supplier ?? null}
                      description={product.description ?? null}
                      image_url={product.image_url ?? null}
                      visible_instock={product.visible_instock}
                      visible_flash={product.visible_flash}
                      has_price_range={product.has_price_range}
                      preference_options={product.preference_options ?? []}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  )
}
