import { prisma } from '@/lib/prisma'
import { createTochkaInvoice } from '@/lib/tochka'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { number: 'desc' },
  })
  return NextResponse.json(invoices)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Если номер не указан — берём следующий из БД
  let number = Number(body.number)
  if (!number) {
    const last = await prisma.invoice.findFirst({ orderBy: { number: 'desc' } })
    number = (last?.number || 0) + 1
  }

  const quantity = Number(body.quantity || 1)
  const price = Number(body.price || 0)
  const total = quantity * price
  const date = body.date ? new Date(body.date) : new Date()

  const created = await prisma.invoice.create({
    data: {
      number,
      date,
      counterpartyInn: String(body.counterpartyInn || ''),
      counterpartyName: String(body.counterpartyName || ''),
      counterpartyKpp: body.counterpartyKpp || null,
      counterpartyAddress: body.counterpartyAddress || null,
      serviceName: body.serviceName || 'Услуги по уборке территории',
      unit: body.unit || 'Услуга',
      quantity,
      price,
      withVat: Boolean(body.withVat),
      total,
      status: 'DRAFT',
    },
  })

  // Опциональная отправка в Точку
  const tochkaResult = await createTochkaInvoice({
    number,
    date: date.toISOString().slice(0, 10),
    counterpartyInn: created.counterpartyInn,
    counterpartyName: created.counterpartyName,
    serviceName: created.serviceName,
    unit: created.unit,
    quantity: created.quantity,
    price: created.price,
    withVat: created.withVat,
  })

  if (tochkaResult) {
    const updated = await prisma.invoice.update({
      where: { id: created.id },
      data: {
        tochkaId: tochkaResult.id || null,
        pdfUrl: tochkaResult.pdfUrl || null,
        status: 'SENT',
      },
    })
    return NextResponse.json(updated, { status: 201 })
  }

  return NextResponse.json(created, { status: 201 })
}
