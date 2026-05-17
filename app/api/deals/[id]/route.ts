import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: { responsible: true, files: true, comments: { include: { author: true } }, activities: true },
  })

  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(deal)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const data = await request.json()

  // Auto-calculate profit
  const budgetClient = data.budgetClient ?? undefined
  const budgetContractor = data.budgetContractor ?? undefined
  const profit = budgetClient && budgetContractor ? budgetClient - budgetContractor : undefined
  const managerProfit = profit ? profit * 0.1 : undefined

  const deal = await prisma.deal.update({
    where: { id },
    data: {
      ...data,
      profit,
      managerProfit,
    },
    include: { responsible: true, files: true, activities: true },
  })

  return NextResponse.json(deal)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.deal.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
