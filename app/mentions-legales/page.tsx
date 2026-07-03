import Link from 'next/link'
import Footer from '../_components/Footer'

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-midnight mb-1">法律資訊 · Mentions Légales</h1>
      </section>

      <section className="max-w-2xl lg:max-w-3xl mx-auto px-6 py-16 space-y-12">
        {/* Version Française */}
        <div>
          <p className="text-xs text-midnight/40 uppercase tracking-widest font-bold mb-4">Version française</p>

          <div className="space-y-6 text-sm text-midnight leading-relaxed">
            <div>
              <h2 className="font-bold text-midnight mb-2">Éditeur du site</h2>
              <p className="mb-3">
                L&apos;édition et la direction de la publication du site <em className="italic">Chez Jambes Courtes</em> sont assurées par Mme Yi-Hsuan LECLERE, agissant sous le statut d&apos;Entrepreneur Individuel (EI).
              </p>
              <ul className="list-none space-y-1.5">
                <li className="flex gap-2"><span className="shrink-0 text-midnight/40">—</span><span><strong>Nom commercial</strong> : CHEZ JAMBES COURTES</span></li>
                <li className="flex gap-2"><span className="shrink-0 text-midnight/40">—</span><span><strong>SIREN</strong> : 106 846 538</span></li>
                <li className="flex gap-2"><span className="shrink-0 text-midnight/40">—</span><span><strong>Siège social</strong> : 75012 PARIS (l&apos;adresse complète est protégée pour des raisons de confidentialité. Elle est disponible sur simple demande via notre formulaire de contact et figure obligatoirement sur l&apos;ensemble de nos factures)</span></li>
                <li className="flex gap-2"><span className="shrink-0 text-midnight/40">—</span><span><strong>Contact</strong> : contact@chezjambescourtes.com</span></li>
              </ul>
            </div>

            <div className="border-t border-midnight/10 pt-6">
              <h2 className="font-bold text-midnight mb-2">Hébergeur du site</h2>
              <p className="mb-3">Le site est hébergé par Cloudflare, Inc.</p>
              <ul className="list-none space-y-1.5">
                <li className="flex gap-2"><span className="shrink-0 text-midnight/40">—</span><span><strong>Adresse</strong> : 101 Townsend St, San Francisco, CA 94107, USA</span></li>
                <li className="flex gap-2"><span className="shrink-0 text-midnight/40">—</span><span><strong>Contact</strong> : https://www.cloudflare.com / +1 (888) 993 5273</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* 中文版本 */}
        <div className="border-t border-midnight/10 pt-12">
          <p className="text-xs text-midnight/40 uppercase tracking-widest font-bold mb-4">中文版本 (繁體中文 · zh-TW)</p>

          <div className="space-y-6 text-sm text-midnight/70 leading-relaxed">
            <div>
              <h2 className="font-bold text-midnight/85 mb-2">網站營運方資訊</h2>
              <p className="mb-3">
                本網站 <em className="italic">Chez Jambes Courtes</em> 之管理與內容出版，由 Yi-Hsuan LECLERE 以獨立獨資企業（Entrepreneur Individuel, EI）身份合法營運。
              </p>
              <ul className="list-none space-y-1.5">
                <li className="flex gap-2"><span className="shrink-0 text-midnight/30">—</span><span><strong>商業名稱</strong>：CHEZ JAMBES COURTES</span></li>
                <li className="flex gap-2"><span className="shrink-0 text-midnight/30">—</span><span><strong>公司統一編號 (SIREN)</strong>：106 846 538</span></li>
                <li className="flex gap-2"><span className="shrink-0 text-midnight/30">—</span><span><strong>註冊地址</strong>：75012 PARIS（基於隱私保護，網頁僅顯示郵遞區號與城市。完整註冊地址可在需要時透過我們的「聯絡表單」索取，且該地址亦會依法完整標示於我們開立的所有客戶發票上）</span></li>
                <li className="flex gap-2"><span className="shrink-0 text-midnight/30">—</span><span><strong>聯絡信箱</strong>：contact@chezjambescourtes.com</span></li>
              </ul>
            </div>

            <div className="border-t border-midnight/10 pt-6">
              <h2 className="font-bold text-midnight/85 mb-2">網站託管服務商</h2>
              <p className="mb-3">本網站架設於 Cloudflare, Inc. 雲端平台。</p>
              <ul className="list-none space-y-1.5">
                <li className="flex gap-2"><span className="shrink-0 text-midnight/30">—</span><span><strong>公司地址</strong>：101 Townsend St, San Francisco, CA 94107, USA</span></li>
                <li className="flex gap-2"><span className="shrink-0 text-midnight/30">—</span><span><strong>聯絡管道</strong>：https://www.cloudflare.com / +1 (888) 993 5273</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
