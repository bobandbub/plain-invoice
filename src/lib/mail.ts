import { Resend } from 'resend'

import { APP_NAME } from '#/lib/config'
import { formatMoney } from '#/lib/money'

export function isMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY)
}

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('MAIL_NOT_CONFIGURED')
  return new Resend(key)
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export async function sendInvoiceMail(input: {
  to: string
  replyTo?: string
  fromName: string
  clientName: string
  number: string
  totalCents: number
  currency: string
  publicUrl: string
}) {
  const from = process.env.RESEND_FROM_EMAIL ?? `${APP_NAME} <beth.t@example.com>`
  const total = formatMoney(input.totalCents, input.currency)
  const replyTo = input.replyTo?.includes('@') ? input.replyTo : undefined

  const { error } = await getResend().emails.send({
    from,
    to: input.to,
    replyTo,
    subject: `${input.number} from ${input.fromName} — ${total}`,
    text: [
      `Hi ${input.clientName},`,
      '',
      `${input.fromName} sent you invoice ${input.number} for ${total}.`,
      '',
      `Open it here: ${input.publicUrl}`,
      '',
      `Sent with ${APP_NAME}.`,
    ].join('\n'),
    html: `<!doctype html>
<html>
  <body style="margin:0;background:#e7f3ec;font-family:Manrope,Helvetica,Arial,sans-serif;color:#173a40;">
    <div style="max-width:520px;margin:32px auto;padding:28px;background:#ffffff;border:1px solid rgba(23,58,64,0.14);border-radius:16px;">
      <p style="letter-spacing:0.16em;text-transform:uppercase;font-size:11px;font-weight:700;color:#2f6a4a;margin:0 0 12px;">${escapeHtml(APP_NAME)}</p>
      <h1 style="font-family:Georgia,serif;font-size:28px;margin:0 0 12px;">Invoice ${escapeHtml(input.number)}</h1>
      <p style="margin:0 0 20px;line-height:1.5;">
        Hi ${escapeHtml(input.clientName)},<br /><br />
        ${escapeHtml(input.fromName)} sent you an invoice for <strong>${escapeHtml(total)}</strong>.
      </p>
      <p style="margin:0 0 28px;">
        <a href="${escapeHtml(input.publicUrl)}" style="display:inline-block;background:#173a40;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">
          Open invoice
        </a>
      </p>
      <p style="margin:0;font-size:13px;color:#416166;">Or paste this link: ${escapeHtml(input.publicUrl)}</p>
    </div>
  </body>
</html>`,
  })

  if (error) throw new Error(error.message)
}
