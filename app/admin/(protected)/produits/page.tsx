import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { toggleAvailabilityAction } from './actions'
import { NouveauProduitDialog } from './_components/NouveauProduitDialog'
import { StockInput } from './_components/StockInput'
import { ProduitDetailButton } from './_components/ProduitDetailButton'

export const metadata = { title: 'Produits — Admin' }

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

export default async function ProduitsAdminPage() {
  await requireAdmin()

  const supabase = createAdminClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name_fr, name_tw, origin, unit_price, promo_price, unit_label, available, stock_quantity, supplier, description, image_url')
    .order('name_fr')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-midnight">Produits</h1>
        <NouveauProduitDialog />
      </div>

      <div className="bg-white rounded-2xl border border-midnight/8 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-midnight/8 text-left">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Produit</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Origine</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Prix</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Stock</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-midnight/40">Afficher</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-midnight/5">
            {!products?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-midnight/35">
                  Aucun produit.
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
                      <p className="text-xs text-green-600">{centsToEur(product.promo_price)} € promo</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StockInput productId={product.id} defaultValue={product.stock_quantity} />
                  </td>
                  <td className="px-4 py-3">
                    <form>
                      <button
                        type="submit"
                        formAction={async () => {
                          'use server'
                          await toggleAvailabilityAction(product.id, !product.available)
                        }}
                        className={`relative block w-11 h-6 rounded-full cursor-pointer p-0 border-0 overflow-hidden transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-midnight/30 ${
                          product.available ? 'bg-midnight' : 'bg-midnight/20'
                        }`}
                        aria-label={product.available ? 'Désactiver' : 'Activer'}
                      >
                        <span
                          className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                            product.available ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <ProduitDetailButton
                      name_tw={product.name_tw}
                      name_fr={product.name_fr}
                      description={product.description ?? null}
                      image_url={product.image_url ?? null}
                      supplier={product.supplier ?? null}
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
