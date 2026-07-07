import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { COMPANY_INFO } from './company-info'

type InvoiceItem = {
  name_fr: string
  unit_label: string
  unit_price: number
  qty: number
  line_total: number
}

export type InvoiceOrder = {
  order_number: string
  customer_prenom: string
  customer_nom: string
  customer_email: string
  customer_phone: string | null
  created_at: string
  items: InvoiceItem[]
  subtotal: number
  discount_amount: number
  total_amount: number
  payment_method: 'stripe' | 'virement' | 'pay_on_pickup' | null
}

const PAYMENT_LABEL: Record<string, string> = {
  stripe: 'Carte bancaire (Stripe)',
  virement: 'Virement bancaire',
  pay_on_pickup: 'Espèces au retrait',
}

function centsToEur(cents: number) {
  return `${(cents / 100).toFixed(2)} €`
}

const MARGIN = 50
const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89

// Standard PDF fonts (WinAnsi encoding) can't render CJK glyphs — product data
// (e.g. unit_label) is admin-entered free text that may contain Chinese. Rather
// than bundling a multi-MB CJK font just for this legal (French-only) document,
// drop characters the font can't encode instead of crashing generation.
function sanitizeForFont(value: string, font: PDFFont): string {
  return Array.from(value)
    .filter(ch => {
      try {
        font.encodeText(ch)
        return true
      } catch {
        return false
      }
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function generateInvoicePdf(order: InvoiceOrder): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const ink = rgb(0.10, 0.08, 0.07) // midnight
  const muted = rgb(0.45, 0.42, 0.40)

  let y = PAGE_HEIGHT - MARGIN

  function text(
    value: string,
    x: number,
    lineY: number,
    opts: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb> } = {},
  ) {
    const f = opts.f ?? font
    page.drawText(sanitizeForFont(value, f), {
      x,
      y: lineY,
      size: opts.size ?? 10,
      font: f,
      color: opts.color ?? ink,
    })
  }

  function rightAlignedText(
    targetPage: PDFPage,
    value: string,
    rightX: number,
    lineY: number,
    opts: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb> } = {},
  ) {
    const size = opts.size ?? 10
    const f = opts.f ?? font
    const cleaned = sanitizeForFont(value, f)
    const width = f.widthOfTextAtSize(cleaned, size)
    targetPage.drawText(cleaned, { x: rightX - width, y: lineY, size, font: f, color: opts.color ?? ink })
  }

  // Header — seller identity
  text(COMPANY_INFO.tradeName, MARGIN, y, { size: 16, f: bold })
  y -= 18
  text(`${COMPANY_INFO.legalName} — ${COMPANY_INFO.legalForm}`, MARGIN, y, { size: 9, color: muted })
  y -= 12
  text(`SIREN ${COMPANY_INFO.siren}`, MARGIN, y, { size: 9, color: muted })
  y -= 12
  text(`${COMPANY_INFO.address}, ${COMPANY_INFO.postalCode} ${COMPANY_INFO.city}`, MARGIN, y, { size: 9, color: muted })
  y -= 12
  text(COMPANY_INFO.email, MARGIN, y, { size: 9, color: muted })

  // Header — invoice meta (right-aligned)
  let metaY = PAGE_HEIGHT - MARGIN
  rightAlignedText(page, 'FACTURE', PAGE_WIDTH - MARGIN, metaY, { size: 16, f: bold })
  metaY -= 18
  rightAlignedText(page, `N° ${order.order_number}`, PAGE_WIDTH - MARGIN, metaY, { size: 9, color: muted })
  metaY -= 12
  rightAlignedText(
    page,
    new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    PAGE_WIDTH - MARGIN,
    metaY,
    { size: 9, color: muted },
  )

  y -= 36
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 0.5,
    color: rgb(0.85, 0.83, 0.81),
  })
  y -= 24

  // Buyer
  text('Facturé à', MARGIN, y, { size: 8, f: bold, color: muted })
  y -= 14
  text(`${order.customer_prenom} ${order.customer_nom}`, MARGIN, y, { size: 10, f: bold })
  y -= 13
  text(order.customer_email, MARGIN, y, { size: 9, color: muted })
  if (order.customer_phone) {
    y -= 12
    text(order.customer_phone, MARGIN, y, { size: 9, color: muted })
  }

  y -= 30

  // Items table header
  const col = { name: MARGIN, qty: 330, unitPrice: 400, total: PAGE_WIDTH - MARGIN }
  text('Article', col.name, y, { size: 8, f: bold, color: muted })
  text('Qté', col.qty, y, { size: 8, f: bold, color: muted })
  text('Prix unit.', col.unitPrice, y, { size: 8, f: bold, color: muted })
  rightAlignedText(page, 'Total', col.total, y, { size: 8, f: bold, color: muted })
  y -= 8
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 0.5,
    color: rgb(0.85, 0.83, 0.81),
  })
  y -= 16

  for (const item of order.items) {
    text(item.name_fr, col.name, y, { size: 9 })
    text(`${item.qty} × ${item.unit_label}`, col.qty, y, { size: 9, color: muted })
    text(centsToEur(item.unit_price), col.unitPrice, y, { size: 9, color: muted })
    rightAlignedText(page, centsToEur(item.line_total), col.total, y, { size: 9 })
    y -= 18
  }

  y -= 6
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 0.5,
    color: rgb(0.85, 0.83, 0.81),
  })
  y -= 20

  // Totals
  text('Sous-total', 400, y, { size: 9, color: muted })
  rightAlignedText(page, centsToEur(order.subtotal), col.total, y, { size: 9 })
  y -= 15

  if (order.discount_amount > 0) {
    text('Réduction', 400, y, { size: 9, color: muted })
    rightAlignedText(page, `-${centsToEur(order.discount_amount)}`, col.total, y, { size: 9 })
    y -= 15
  }

  text('Total', 400, y, { size: 11, f: bold })
  rightAlignedText(page, centsToEur(order.total_amount), col.total, y, { size: 11, f: bold })
  y -= 15

  if (order.payment_method) {
    text('Paiement', 400, y, { size: 9, color: muted })
    rightAlignedText(page, PAYMENT_LABEL[order.payment_method] ?? order.payment_method, col.total, y, {
      size: 9,
      color: muted,
    })
  }

  // Footer
  text(COMPANY_INFO.vatStatement, MARGIN, MARGIN, { size: 8, color: muted })

  return pdfDoc.save()
}
