import { Resend } from 'resend'
import { buildUnsubscribeUrl } from '@/lib/unsubscribe-token'
import { BANK_INFO } from '@/lib/bank-info'
import { generateInvoicePdf } from '@/lib/invoice'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

type OrderItem = {
  name_fr: string
  name_tw: string
  unit_label: string
  unit_price: number
  qty: number
  line_total: number
  preference?: string | null
}

type OrderEmailData = {
  customer_prenom: string
  customer_nom: string
  customer_email: string
  items: OrderItem[]
  subtotal: number
  tracking_token: string
  pickup_slot_label?: string | null
  pickup_slot_location?: string | null
}

function centsToEur(cents: number) {
  return (cents / 100).toFixed(2)
}

function buildItemRows(items: OrderItem[]) {
  return items
    .map(
      item => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px dashed rgba(26,21,18,0.1);font-size:14px;color:#1A1512;">
          <strong>${item.name_tw}</strong>
          <span style="color:rgba(26,21,18,0.5);margin-left:6px;">${item.name_fr}</span>
          <br />
          <span style="font-size:12px;color:rgba(26,21,18,0.45);">${item.qty} × ${item.unit_label}${item.preference ? ` · ${item.preference}` : ''}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px dashed rgba(26,21,18,0.1);font-size:14px;color:#1A1512;text-align:right;white-space:nowrap;">
          ${centsToEur(item.line_total)} €
        </td>
      </tr>`,
    )
    .join('')
}

function buildPickupBlock(label?: string | null, location?: string | null) {
  if (!label) return ''
  return `
      <tr>
        <td style="padding-top:24px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(26,21,18,0.45);">
            Créneau de retrait · 取貨時段
          </p>
          <p style="margin:0;font-size:14px;font-weight:bold;color:#1A1512;">
            ${label}
          </p>
          ${location ? `<p style="margin:4px 0 0;font-size:12px;color:rgba(26,21,18,0.5);">${location}</p>` : ''}
        </td>
      </tr>`
}

function buildBankInfoBlock() {
  return `
      <tr>
        <td style="padding-top:24px;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(26,21,18,0.45);">
            Virement bancaire · 銀行轉帳
          </p>
          <p style="margin:0;font-size:13px;color:#1A1512;line-height:1.7;">
            <strong>IBAN</strong> : ${BANK_INFO.iban}<br />
            <strong>BIC</strong> : ${BANK_INFO.bic}<br />
            <strong>Bénéficiaire</strong> : ${BANK_INFO.beneficiary}<br />
            <strong>Banque</strong> : ${BANK_INFO.bank}
          </p>
        </td>
      </tr>`
}

// Brand accent — yellow for every normal lifecycle moment, magenta for the one
// that needs attention (cancellation), matching the same color-meaning split
// already used across the storefront (checkout errors, order-tracking states).
const ACCENT = { yellow: '#FACA31', magenta: '#F5736E' } as const

// Shared card/header/footer shell for every transactional email. Each caller
// only builds the inner body markup (title + message + optional blocks).
function renderEmailShell(bodyHtml: string, accent: keyof typeof ACCENT = 'yellow') {
  const bg = ACCENT[accent]
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:${bg};font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${bg};padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#1A1512;opacity:0.6;">
                Chez Jambes Courtes
              </p>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:#ffffff;border:1px solid rgba(26,21,18,0.15);border-radius:2px;padding:40px 36px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#1A1512;opacity:0.4;letter-spacing:0.08em;">
                © 2025 Chez Jambes Courtes · Paris
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildOrderSummaryTable(order: OrderEmailData, extraRowsHtml = '') {
  return `
              <table width="100%" cellpadding="0" cellspacing="0">
                ${buildItemRows(order.items)}
                <tr>
                  <td style="padding-top:12px;font-size:15px;font-weight:bold;color:#1A1512;">
                    Total
                  </td>
                  <td style="padding-top:12px;font-size:15px;font-weight:bold;color:#1A1512;text-align:right;">
                    ${centsToEur(order.subtotal)} €
                  </td>
                </tr>
                ${extraRowsHtml}
              </table>`
}

function buildTrackingCta(trackingUrl: string) {
  return `
              <hr style="border:none;border-top:1px dashed rgba(26,21,18,0.12);margin:28px 0;" />

              <p style="margin:0 0 16px;font-size:13px;color:rgba(26,21,18,0.6);line-height:1.7;">
                Vous pouvez suivre l&apos;état de votre commande à tout moment :<br />
                <span style="font-size:12px;color:rgba(26,21,18,0.4);">您可以隨時查看訂單狀態：</span>
              </p>
              <a href="${trackingUrl}"
                 style="display:inline-block;background:#1A1512;color:#FACA31;font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:12px 24px;border-radius:2px;">
                Voir ma commande · 查看訂單 →
              </a>`
}

function trackingUrlFor(token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://chezjambescourtes.com'
  return `${appUrl}/commande/${token}`
}

async function sendBrandEmail(
  to: string,
  subject: string,
  bodyHtml: string,
  opts: {
    accent?: keyof typeof ACCENT
    headers?: Record<string, string>
    bcc?: string
    attachments?: { filename: string; content: Buffer }[]
  } = {},
) {
  await getResend().emails.send({
    from: process.env.RESEND_FROM ?? 'Chez Jambes Courtes <onboarding@resend.dev>',
    to,
    bcc: opts.bcc,
    subject,
    headers: opts.headers,
    html: renderEmailShell(bodyHtml, opts.accent),
    attachments: opts.attachments,
  })
}

// sendInstockOrderReceivedEmail, sendPreorderReceivedEmail and sendOrderCompleteEmail
// are BCC'd here so the owner has a running inbox record of order activity.
const ORDER_BCC = 'chezjambescourtes@gmail.com'

// New pre-order (flash) order: procurement isn't confirmed yet — a second email
// follows once the trip to the market confirms what was actually bought.
export async function sendPreorderReceivedEmail(
  order: OrderEmailData & { payment_method: 'stripe' | 'virement' | 'pay_on_pickup' },
) {
  const bodyHtml = `
              <p style="margin:0 0 6px;font-size:24px;color:#1A1512;line-height:1.3;">
                Merci ${order.customer_prenom} 🥭
              </p>
              <p style="margin:0 0 4px;font-size:13px;color:rgba(26,21,18,0.5);">
                感謝您的訂購，${order.customer_prenom}！
              </p>
              <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(26,21,18,0.35);">
                ${order.tracking_token}
              </p>

              <hr style="border:none;border-top:1px solid rgba(26,21,18,0.1);margin:0 0 20px;" />

              <p style="margin:0 0 4px;font-size:14px;color:#1A1512;line-height:1.7;">
                訂單尚未完成，我們將會在買到芒果後再次發送確認信件；沒有買到也會通知，免得您白跑一趟。
              </p>
              <p style="margin:0 0 20px;font-size:12px;color:rgba(26,21,18,0.75);line-height:1.7;">
                Cette commande n&apos;est pas encore définitivement confirmée. Nous vous enverrons un nouvel e-mail dès l&apos;achat des mangues — et vous préviendrons aussi en cas de rupture, pour vous éviter un déplacement inutile.
              </p>

              ${buildOrderSummaryTable(order, order.payment_method === 'virement' ? buildBankInfoBlock() : '')}
              ${buildTrackingCta(trackingUrlFor(order.tracking_token))}`

  await sendBrandEmail(
    order.customer_email,
    `Commande reçue · 訂單已收到（尚未完成）`,
    bodyHtml,
    { bcc: ORDER_BCC },
  )
}

// New in-stock order: goods are already secured (nothing to procure), so this
// is both the "we received your order" confirmation and the pickup info in one
// email — unlike sendPreorderReceivedEmail, there's no second email later since
// nothing is pending.
export async function sendInstockOrderReceivedEmail(order: OrderEmailData) {
  const bodyHtml = `
              <p style="margin:0 0 6px;font-size:24px;color:#1A1512;line-height:1.3;">
                Merci ${order.customer_prenom} 🍊
              </p>
              <p style="margin:0 0 4px;font-size:13px;color:rgba(26,21,18,0.5);">
                我們已收到您的訂單，${order.customer_prenom}！
              </p>
              <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(26,21,18,0.35);">
                ${order.tracking_token}
              </p>

              <hr style="border:none;border-top:1px solid rgba(26,21,18,0.1);margin:0 0 20px;" />

              <p style="margin:0 0 4px;font-size:14px;color:#1A1512;line-height:1.7;">
                商品已備妥，請在約定好的時間地點面交，請不要忘記來，一人公司謝謝配合 🙏
              </p>
              <p style="margin:0 0 20px;font-size:12px;color:rgba(26,21,18,0.75);line-height:1.7;">
                Nous avons bien reçu votre commande. Vos produits sont prêts — merci de venir au créneau et au lieu convenus.
              </p>

              ${buildOrderSummaryTable(order, buildPickupBlock(order.pickup_slot_label, order.pickup_slot_location))}
              ${buildTrackingCta(trackingUrlFor(order.tracking_token))}`

  await sendBrandEmail(
    order.customer_email,
    `Commande reçue · 訂單已收到`,
    bodyHtml,
    { bcc: ORDER_BCC },
  )
}

// Sent when a pre-order/flash order gets validated or partially validated
// after the market trip.
export async function sendReadyForPickupEmail(order: OrderEmailData) {
  const bodyHtml = `
              <p style="margin:0 0 6px;font-size:24px;color:#1A1512;line-height:1.3;">
                ${order.customer_prenom}，準備面交囉 🍊
              </p>
              <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(26,21,18,0.35);">
                ${order.tracking_token}
              </p>

              <hr style="border:none;border-top:1px solid rgba(26,21,18,0.1);margin:0 0 20px;" />

              <p style="margin:0 0 4px;font-size:14px;color:#1A1512;line-height:1.7;">
                您的訂單已完成採購，請在約定好的時間地點面交，請不要忘記來，一人公司謝謝配合 🙏
              </p>
              <p style="margin:0 0 20px;font-size:12px;color:rgba(26,21,18,0.75);line-height:1.7;">
                Votre commande est prête. Merci de venir au créneau et au lieu convenus — nous sommes une toute petite équipe, merci de votre compréhension.
              </p>

              ${buildOrderSummaryTable(order, buildPickupBlock(order.pickup_slot_label, order.pickup_slot_location))}
              ${buildTrackingCta(trackingUrlFor(order.tracking_token))}`

  await sendBrandEmail(
    order.customer_email,
    `Prêt pour le retrait · 請準備面交`,
    bodyHtml,
  )
}

export async function sendOrderCompleteEmail(
  order: OrderEmailData & {
    order_number: string
    customer_phone: string | null
    discount_amount: number
    total_amount: number
    payment_method: 'stripe' | 'virement' | 'pay_on_pickup' | null
    created_at: string
    pickup_slot_at?: string | null
  },
) {
  const bodyHtml = `
              <p style="margin:0 0 6px;font-size:24px;color:#1A1512;line-height:1.3;">
                感謝購買 🥭
              </p>
              <p style="margin:0 0 4px;font-size:13px;color:rgba(26,21,18,0.5);">
                Merci pour votre achat, ${order.customer_prenom} !
              </p>
              <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(26,21,18,0.35);">
                ${order.order_number}
              </p>

              <hr style="border:none;border-top:1px solid rgba(26,21,18,0.1);margin:0 0 20px;" />

              ${buildOrderSummaryTable(order)}`

  const invoicePdf = await generateInvoicePdf({
    order_number: order.order_number,
    customer_prenom: order.customer_prenom,
    customer_nom: order.customer_nom,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    created_at: order.created_at,
    items: order.items,
    subtotal: order.subtotal,
    discount_amount: order.discount_amount,
    total_amount: order.total_amount,
    payment_method: order.payment_method,
    pickup_slots: order.pickup_slot_at
      ? { slot_at: order.pickup_slot_at, location: order.pickup_slot_location ?? null }
      : null,
  })

  await sendBrandEmail(
    order.customer_email,
    `Commande terminée ${order.order_number} · 感謝購買`,
    bodyHtml,
    {
      bcc: ORDER_BCC,
      attachments: [{ filename: `facture-acquittee-${order.order_number}.pdf`, content: Buffer.from(invoicePdf) }],
    },
  )
}

export async function sendOrderCanceledEmail(order: OrderEmailData & { cancel_reason: string }) {
  const bodyHtml = `
              <p style="margin:0 0 6px;font-size:24px;color:#1A1512;line-height:1.3;">
                訂單已取消
              </p>
              <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(26,21,18,0.35);">
                ${order.tracking_token}
              </p>

              <hr style="border:none;border-top:1px solid rgba(26,21,18,0.1);margin:0 0 20px;" />

              <p style="margin:0 0 4px;font-size:14px;color:#1A1512;line-height:1.7;">
                您的訂單因以下原因取消：${order.cancel_reason}
              </p>
              <p style="margin:0 0 20px;font-size:12px;color:rgba(26,21,18,0.75);line-height:1.7;">
                Votre commande a été annulée pour la raison suivante : ${order.cancel_reason}
              </p>`

  await sendBrandEmail(
    order.customer_email,
    `Commande annulée · 訂單已取消`,
    bodyHtml,
    { accent: 'magenta' },
  )
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const firstName = name?.trim() || null
  const greeting = firstName ? `Bonjour ${firstName}` : 'Bonjour'
  const greetingZh = firstName ? `${firstName}，您好` : '您好'
  const unsubscribeUrl = buildUnsubscribeUrl(to)

  const bodyHtml = `
              <p style="margin:0 0 24px;font-size:24px;color:#1A1512;line-height:1.3;">
                ${greeting} 🍊
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#1A1512;line-height:1.7;opacity:0.85;">
                Votre inscription est bien enregistrée.
                Vous serez parmi les premiers à savoir dès la première livraison —
                mangues de Taïwan, litchis parfumés et pitayas rouges.
              </p>

              <p style="margin:0 0 32px;font-size:13px;color:#1A1512;line-height:1.7;opacity:0.75;">
                ${greetingZh}！<br />
                您的訂閱已成功建立。<br />
                台灣芒果、荔枝、紅火龍果——第一批到貨時，我們會立即通知您。
              </p>

              <hr style="border:none;border-top:1px dashed rgba(26,21,18,0.12);margin:0 0 28px;" />

              <p style="margin:0;font-size:12px;color:#1A1512;opacity:0.4;line-height:1.8;">
                Vous recevez cet e-mail car vous vous êtes inscrit sur chezjambescourtes.com.<br />
                Pour vous désabonner :
                <a href="${unsubscribeUrl}" style="color:#1A1512;opacity:0.6;text-decoration:underline;">cliquez ici</a>.<br />
                <span style="font-size:11px;">如需退訂，請
                  <a href="${unsubscribeUrl}" style="color:#1A1512;opacity:0.6;text-decoration:underline;">點此取消訂閱</a>。
                </span>
              </p>`

  await sendBrandEmail(to, 'Bienvenue chez Chez Jambes Courtes · 歡迎訂閱', bodyHtml, {
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })
}
