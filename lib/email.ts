import { Resend } from 'resend'
import { buildUnsubscribeUrl } from '@/lib/unsubscribe-token'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const firstName = name?.trim() || null
  const greeting = firstName ? `Bonjour ${firstName}` : 'Bonjour'
  const greetingZh = firstName ? `${firstName}，您好` : '您好'
  const unsubscribeUrl = buildUnsubscribeUrl(to)

  await resend.emails.send({
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
<body style="margin:0;padding:0;background:#FFA630;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFA630;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#031926;opacity:0.6;">
                Chez Jambes Courtes
              </p>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:#ffffff;border:1px solid rgba(3,25,38,0.15);border-radius:2px;padding:40px 36px;">

              <p style="margin:0 0 24px;font-size:24px;color:#031926;line-height:1.3;">
                ${greeting} 🍊
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#031926;line-height:1.7;opacity:0.85;">
                Votre inscription est bien enregistrée.
                Vous serez parmi les premiers à savoir dès la première livraison —
                mangues de Taïwan, litchis parfumés et pitayas rouges.
              </p>

              <p style="margin:0 0 32px;font-size:13px;color:#031926;line-height:1.7;opacity:0.55;">
                ${greetingZh}！<br />
                您的訂閱已成功建立。<br />
                台灣芒果、荔枝、紅火龍果——第一批到貨時，我們會立即通知您。
              </p>

              <hr style="border:none;border-top:1px dashed rgba(3,25,38,0.12);margin:0 0 28px;" />

              <p style="margin:0;font-size:12px;color:#031926;opacity:0.4;line-height:1.8;">
                Vous recevez cet e-mail car vous vous êtes inscrit sur chezjambescourtes.com.<br />
                Pour vous désabonner :
                <a href="${unsubscribeUrl}" style="color:#031926;opacity:0.6;text-decoration:underline;">cliquez ici</a>.<br />
                <span style="font-size:11px;">如需退訂，請
                  <a href="${unsubscribeUrl}" style="color:#031926;opacity:0.6;text-decoration:underline;">點此取消訂閱</a>。
                </span>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#031926;opacity:0.4;letter-spacing:0.08em;">
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
