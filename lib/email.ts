import { Resend } from 'resend'
import { buildUnsubscribeUrl } from '@/lib/unsubscribe-token'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

type OrderItem = {
  name_fr: string
  name_tw: string
  unit_label: string
  qty: number
  line_total: number
}

type OrderEmailData = {
  order_number: string
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

export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  const firstName = order.customer_prenom
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://chezjambescourtes.com'
  const trackingUrl = `${appUrl}/commande/${order.tracking_token}`

  const itemRows = order.items
    .map(
      item => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px dashed rgba(3,25,38,0.1);font-size:14px;color:#1A1512;">
          <strong>${item.name_tw}</strong>
          <span style="color:rgba(3,25,38,0.5);margin-left:6px;">${item.name_fr}</span>
          <br />
          <span style="font-size:12px;color:rgba(3,25,38,0.45);">${item.qty} × ${item.unit_label}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px dashed rgba(3,25,38,0.1);font-size:14px;color:#1A1512;text-align:right;white-space:nowrap;">
          ${centsToEur(item.line_total)} €
        </td>
      </tr>`,
    )
    .join('')

  const pickupBlock = order.pickup_slot_label
    ? `
      <tr>
        <td style="padding-top:24px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(3,25,38,0.45);">
            Créneau de retrait · 取貨時段
          </p>
          <p style="margin:0;font-size:14px;font-weight:bold;color:#1A1512;">
            ${order.pickup_slot_label}
          </p>
          ${order.pickup_slot_location ? `<p style="margin:4px 0 0;font-size:12px;color:rgba(3,25,38,0.5);">${order.pickup_slot_location}</p>` : ''}
        </td>
      </tr>`
    : ''

  await getResend().emails.send({
    from: process.env.RESEND_FROM ?? 'Chez Jambes Courtes <onboarding@resend.dev>',
    to: order.customer_email,
    subject: `Commande confirmée ${order.order_number} · 訂單已確認`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Commande confirmée</title>
</head>
<body style="margin:0;padding:0;background:#FACA31;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FACA31;padding:48px 24px;">
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
            <td style="background:#ffffff;border:1px solid rgba(3,25,38,0.15);border-radius:2px;padding:40px 36px;">

              <p style="margin:0 0 6px;font-size:24px;color:#1A1512;line-height:1.3;">
                Merci ${firstName} 🥭
              </p>
              <p style="margin:0 0 4px;font-size:13px;color:rgba(3,25,38,0.5);">
                感謝您的訂購，${firstName}！
              </p>
              <p style="margin:0 0 28px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(3,25,38,0.35);">
                ${order.order_number}
              </p>

              <hr style="border:none;border-top:1px solid rgba(3,25,38,0.1);margin:0 0 20px;" />

              <!-- Items -->
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
                <tr>
                  <td style="padding-top:12px;font-size:15px;font-weight:bold;color:#1A1512;">
                    Total
                  </td>
                  <td style="padding-top:12px;font-size:15px;font-weight:bold;color:#1A1512;text-align:right;">
                    ${centsToEur(order.subtotal)} €
                  </td>
                </tr>
                ${pickupBlock}
              </table>

              <hr style="border:none;border-top:1px dashed rgba(3,25,38,0.12);margin:28px 0;" />

              <!-- Tracking CTA -->
              <p style="margin:0 0 16px;font-size:13px;color:rgba(3,25,38,0.6);line-height:1.7;">
                Vous pouvez suivre l&apos;état de votre commande à tout moment :<br />
                <span style="font-size:12px;color:rgba(3,25,38,0.4);">您可以隨時查看訂單狀態：</span>
              </p>
              <a href="${trackingUrl}"
                 style="display:inline-block;background:#1A1512;color:#FACA31;font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:12px 24px;border-radius:2px;">
                Voir ma commande · 查看訂單 →
              </a>

              <hr style="border:none;border-top:1px dashed rgba(3,25,38,0.12);margin:28px 0;" />

              <p style="margin:0;font-size:12px;color:rgba(3,25,38,0.4);line-height:1.8;">
                Vous recevez cet e-mail car vous avez passé une commande sur chezjambescourtes.com.<br />
                <span style="font-size:11px;">此信為訂單確認通知，請勿回覆。</span>
              </p>

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
</html>`,
  })
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const firstName = name?.trim() || null
  const greeting = firstName ? `Bonjour ${firstName}` : 'Bonjour'
  const greetingZh = firstName ? `${firstName}，您好` : '您好'
  const unsubscribeUrl = buildUnsubscribeUrl(to)

  await getResend().emails.send({
    from: process.env.RESEND_FROM ?? 'Chez Jambes Courtes <onboarding@resend.dev>',
    to,
    subject: 'Bienvenue chez Chez Jambes Courtes · 歡迎訂閱',
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Bienvenue</title>
</head>
<body style="margin:0;padding:0;background:#FACA31;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FACA31;padding:48px 24px;">
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
            <td style="background:#ffffff;border:1px solid rgba(3,25,38,0.15);border-radius:2px;padding:40px 36px;">

              <p style="margin:0 0 24px;font-size:24px;color:#1A1512;line-height:1.3;">
                ${greeting} 🍊
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#1A1512;line-height:1.7;opacity:0.85;">
                Votre inscription est bien enregistrée.
                Vous serez parmi les premiers à savoir dès la première livraison —
                mangues de Taïwan, litchis parfumés et pitayas rouges.
              </p>

              <p style="margin:0 0 32px;font-size:13px;color:#1A1512;line-height:1.7;opacity:0.55;">
                ${greetingZh}！<br />
                您的訂閱已成功建立。<br />
                台灣芒果、荔枝、紅火龍果——第一批到貨時，我們會立即通知您。
              </p>

              <hr style="border:none;border-top:1px dashed rgba(3,25,38,0.12);margin:0 0 28px;" />

              <p style="margin:0;font-size:12px;color:#1A1512;opacity:0.4;line-height:1.8;">
                Vous recevez cet e-mail car vous vous êtes inscrit sur chezjambescourtes.com.<br />
                Pour vous désabonner :
                <a href="${unsubscribeUrl}" style="color:#1A1512;opacity:0.6;text-decoration:underline;">cliquez ici</a>.<br />
                <span style="font-size:11px;">如需退訂，請
                  <a href="${unsubscribeUrl}" style="color:#1A1512;opacity:0.6;text-decoration:underline;">點此取消訂閱</a>。
                </span>
              </p>

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
</html>`,
  })
}
