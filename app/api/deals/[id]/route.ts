import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      responsible: true,
      files: true,
      comments: { include: { author: { select: { id: true, name: true } } } },
      activities: true,
    },
  })
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(deal)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await request.json()

  const budgetClient = data.budgetClient ?? undefined
  const budgetContractor = data.budgetContractor ?? undefined
  const profit =
    budgetClient && budgetContractor ? budgetClient - budgetContractor : undefined
  const managerProfit = profit ? profit * 0.1 : undefined

  // Only update fields that were provided
  const updateData: any = {}
  const ALLOWED = [
    'title', 'stage', 'status', 'source',
    'budgetClient', 'budgetContractor',
    'orderDate', 'reminderDate', 'reminderTime',
    'contactName', 'contactPhone', 'contactEmail', 'contactTelegram',
    'contractorName', 'contractorPhone', 'contractorTgHandle',
    'address', 'city', 'notes',
  ]
  for (const k of ALLOWED) {
    if (k in data) updateData[k] = data[k]
  }
  if (profit !== undefined) updateData.profit = profit
  if (managerProfit !== undefined) updateData.managerProfit = managerProfit

  const deal = await prisma.deal.update({
    where: { id },
    data: updateData,
    include: { responsible: true, files: true, activities: true },
  })

  return NextResponse.json(deal)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.deal.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
