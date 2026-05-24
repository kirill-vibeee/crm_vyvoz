import { prisma } from '@/lib/prisma'
import { createTochkaInvoice, VatKind } from '@/lib/tochka'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const invoices = await prisma.invoice.findMany({ orderBy: { number: 'desc' } })
  return NextResponse.json(invoices)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  let number = Number(body.number)
  if (!number) {
    const last = await prisma.invoice.findFirst({ orderBy: { number: 'desc' } })
    number = (last?.number || 0) + 1
  }

  const quantity = Number(body.quantity || 1)
  const price = Number(body.price || 0)
  const total = +(quantity * price).toFixed(2)
  const date = body.date ? new Date(body.date) : new Date()
  const counterpartyType: 'LEGAL' | 'INDIVIDUAL' =
    body.counterpartyType === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'LEGAL'
  const vat: VatKind = (body.vat || 'none') as VatKind

  // 1) Локально (DRAFT)
  let invoice = await prisma.invoice.create({
    data: {
      number,
      date,
      counterpartyInn: String(body.counterpartyInn || ''),
      counterpartyName: String(body.counterpartyName || ''),
      counterpartyKpp: body.counterpartyKpp || null,
      counterpartyAddress: body.counterpartyAddress || null,
      serviceName: body.serviceName || 'Услуги по уборке территории',
      unit: body.unit || 'услуга.',
      quantity,
      price,
      withVat: vat !== 'none',
      total,
      status: 'DRAFT',
    },
  })

  // 2) В Точку
  const tochkaResult = await createTochkaInvoice({
    number,
    date: date.toISOString().slice(0, 10),
    counterpartyInn: invoice.counterpartyInn,
    counterpartyName: invoice.counterpartyName,
    counterpartyType,
    item: {
      name: invoice.serviceName,
      unitCode: invoice.unit,
      quantity: invoice.quantity,
      price: invoice.price,
      vat,
    },
  })

  if (tochkaResult) {
    invoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        tochkaId: tochkaResult.documentId,
        status: 'SENT',
      },
    })
  }

  return NextResponse.json(
    { ...invoice, tochkaSent: !!tochkaResult },
    { status: 201 }
  )
}
