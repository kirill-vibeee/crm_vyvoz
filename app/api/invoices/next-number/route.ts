import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Точка не реализовала GET /bills/{customerCode} (501 Not Implemented),
// поэтому используем локальный счётчик.
export async function GET() {
  const last = await prisma.invoice.findFirst({ orderBy: { number: 'desc' } })
  return NextResponse.json({ next: (last?.number || 0) + 1, source: 'local' })
}
