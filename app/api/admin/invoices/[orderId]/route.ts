import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateInvoicePdf } from '@/lib/invoice'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  await requireAdmin()

  const { orderId } = await params
  const supabase = createAdminClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('order_number, customer_prenom, customer_nom, customer_email, customer_phone, created_at, items, subtotal, discount_amount, total_amount, payment_method, status')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  if (order.status !== 'complete') {
    return NextResponse.json({ error: 'La facture est disponible uniquement pour les commandes terminées' }, { status: 400 })
  }

  const pdfBytes = await generateInvoicePdf(order)

  return new Response(new Uint8Array(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="facture-${order.order_number}.pdf"`,
    },
  })
}
