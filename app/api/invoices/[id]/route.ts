import { prisma } from '@/lib/prisma'
import { createTochkaInvoice, deleteTochkaInvoice, VatKind } from '@/lib/tochka'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const invoice = await prisma.invoice.findUnique({ where: { id } })
  if (!invoice) return NextResponse.json({ error: 'Не найден' }, { status: 404 })
  return NextResponse.json(invoice)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const existing = await prisma.invoice.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Не найден' }, { status: 404 })

  const body = await request.json()
  const quantity = Number(body.quantity ?? existing.quantity)
  const price = Number(body.price ?? existing.price)
  const total = +(quantity * price).toFixed(2)
  const date = body.date ? new Date(body.date) : existing.date
  const vat: VatKind = (body.vat ?? (existing.withVat ? 'nds_22' : 'none')) as VatKind
  const number = Number(body.number ?? existing.number)

  // Если был отправлен в Точку — удалим старый и создадим новый
  let newTochkaId: string | null = existing.tochkaId
  let status = existing.status

  if (existing.tochkaId) {
    await deleteTochkaInvoice(existing.tochkaId)
    newTochkaId = null
    status = 'DRAFT'

    const counterpartyType: 'LEGAL' | 'INDIVIDUAL' =
      (body.counterpartyType || (existing.counterpartyInn.length === 12 ? 'INDIVIDUAL' : 'LEGAL'))
    const recreated = await createTochkaInvoice({
      number,
      date: date.toISOString().slice(0, 10),
      counterpartyInn: body.counterpartyInn ?? existing.counterpartyInn,
      counterpartyName: body.counterpartyName ?? existing.counterpartyName,
      counterpartyType,
      item: {
        name: body.serviceName ?? existing.serviceName,
        unitCode: body.unit ?? existing.unit,
        quantity,
        price,
        vat,
      },
    })
    if (recreated) {
      newTochkaId = recreated.documentId
      status = 'SENT'
    }
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      number,
      date,
      counterpartyInn: body.counterpartyInn ?? existing.counterpartyInn,
      counterpartyName: body.counterpartyName ?? existing.counterpartyName,
      counterpartyKpp: body.counterpartyKpp ?? existing.counterpartyKpp,
      counterpartyAddress: body.counterpartyAddress ?? existing.counterpartyAddress,
      serviceName: body.serviceName ?? existing.serviceName,
      unit: body.unit ?? existing.unit,
      quantity,
      price,
      withVat: vat !== 'none',
      total,
      tochkaId: newTochkaId,
      status,
    },
  })

  return NextResponse.json({ ...updated, tochkaSent: !!newTochkaId })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const existing = await prisma.invoice.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ ok: true })

  if (existing.tochkaId) {
    await deleteTochkaInvoice(existing.tochkaId)
  }

  await prisma.invoice.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
