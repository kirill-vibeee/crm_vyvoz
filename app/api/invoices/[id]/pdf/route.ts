import { prisma } from '@/lib/prisma'
import { buildPdfUrl, getCustomerCode } from '@/lib/tochka'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const invoice = await prisma.invoice.findUnique({ where: { id } })
  if (!invoice) {
    return NextResponse.json({ error: 'Счёт не найден' }, { status: 404 })
  }
  if (!invoice.tochkaId) {
    return NextResponse.json({ error: 'Счёт ещё не отправлен в Точку' }, { status: 400 })
  }

  const token = process.env.TOCHKA_JWT_TOKEN
  const customerCode = await getCustomerCode()
  if (!token || !customerCode) {
    return NextResponse.json({ error: 'Точка-банк не настроен' }, { status: 500 })
  }

  const res = await fetch(buildPdfUrl(customerCode, invoice.tochkaId), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    return NextResponse.json({ error: `Точка вернула ${res.status}` }, { status: res.status })
  }

  const buf = await res.arrayBuffer()
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="invoice-${invoice.number}.pdf"`,
    },
  })
}
