import { createHmac, timingSafeEqual } from 'crypto'

export function signUnsubscribeToken(email: string): string {
  return createHmac('sha256', process.env.UNSUBSCRIBE_SECRET!)
    .update(email.toLowerCase())
    .digest('hex')
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(signUnsubscribeToken(email), 'hex')
  const provided = Buffer.from(token, 'hex')
  if (provided.length !== expected.length) return false
  return timingSafeEqual(provided, expected)
}

export function buildUnsubscribeUrl(email: string): string {
  const token = signUnsubscribeToken(email)
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base}/se-desabonner?email=${encodeURIComponent(email)}&token=${token}`
}
