import { prisma } from '@/lib/prisma'
import { getCustomerCode } from '@/lib/tochka'
import { NextResponse } from 'next/server'

const TOCHKA_BASE = 'https://enter.tochka.com/uapi'

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
  const customerCode = getCustomerCode()
  if (!token || !customerCode) {
    return NextResponse.json({ error: 'Точка-банк не настроен' }, { status: 500 })
  }

  const tochkaUrl = `${TOCHKA_BASE}/invoice/v1.0/bills/${customerCode}/${invoice.tochkaId}/file`
  const res = await fetch(tochkaUrl, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    return NextResponse.json(
      { error: `Точка вернула ${res.status}` },
      { status: res.status }
    )
  }

  const buf = await res.arrayBuffer()
  return new Response(buf, {
    headers: {
      'Content-Type': res.headers.get('content-type') || 'application/pdf',
      'Content-Disposition': `inline; filename="invoice-${invoice.number}.pdf"`,
    },
  })
}
