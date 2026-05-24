import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const last = await prisma.invoice.findFirst({ orderBy: { number: 'desc' } })
  const next = (last?.number || 0) + 1
  return NextResponse.json({ next })
}
