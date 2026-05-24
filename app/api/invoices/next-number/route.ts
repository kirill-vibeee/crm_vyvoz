import { prisma } from '@/lib/prisma'
import { getNextTochkaInvoiceNumber } from '@/lib/tochka'
import { NextResponse } from 'next/server'

export async function GET() {
  // 1. Пробуем из документооборота Точки
  const tochkaNext = await getNextTochkaInvoiceNumber()
  if (tochkaNext) {
    return NextResponse.json({ next: tochkaNext, source: 'tochka' })
  }

  // 2. Fallback на локальную БД
  const last = await prisma.invoice.findFirst({ orderBy: { number: 'desc' } })
  return NextResponse.json({ next: (last?.number || 0) + 1, source: 'local' })
}
