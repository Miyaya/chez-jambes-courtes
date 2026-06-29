import { NextResponse } from 'next/server'
import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(req: Request) {
  const { name, email, message } = await req.json()

  if (!email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  await getResend().emails.send({
    from: process.env.RESEND_FROM ?? 'Chez Jambes Courtes <onboarding@resend.dev>',
    to: process.env.CONTACT || 'contact@chezjambescourtes.com',
    replyTo: email,
    subject: `訊息來自聯絡表單 · ${name || email}`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Contact</title></head>
<body style="margin:0;padding:0;background:#FFA630;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFA630;padding:48px 24px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr>
          <td style="padding-bottom:32px;">
            <p style="margin:0;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#031926;opacity:0.6;">
              Chez Jambes Courtes · Formulaire de contact
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;border:1px solid rgba(3,25,38,0.15);border-radius:2px;padding:40px 36px;">
            <p style="margin:0 0 24px;font-size:20px;color:#031926;">新訊息 · Nouveau message</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${name ? `<tr>
                <td style="padding-bottom:16px;border-bottom:1px solid rgba(3,25,38,0.08);">
                  <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(3,25,38,0.4);">姓名 · Nom</p>
                  <p style="margin:0;font-size:15px;font-weight:bold;color:#031926;">${name}</p>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding:16px 0;border-bottom:1px solid rgba(3,25,38,0.08);">
                  <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(3,25,38,0.4);">電子郵件 · E-mail</p>
                  <p style="margin:0;font-size:15px;color:#031926;"><a href="mailto:${email}" style="color:#031926;">${email}</a></p>
                </td>
              </tr>
              <tr>
                <td style="padding-top:16px;">
                  <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(3,25,38,0.4);">留言 · Message</p>
                  <p style="margin:0;font-size:14px;color:#031926;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top:24px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#031926;opacity:0.4;letter-spacing:0.08em;">
              © 2025 Chez Jambes Courtes · Paris
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    text: `新訊息 · Nouveau message\n\n${name ? `姓名: ${name}\n` : ''}Email: ${email}\n\n${message}`,
  })

  return NextResponse.json({ ok: true })
}
