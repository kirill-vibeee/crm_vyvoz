import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fromStr = searchParams.get('from')
  const toStr = searchParams.get('to')

  const from = fromStr ? new Date(fromStr) : new Date(0)
  const to = toStr ? new Date(toStr) : new Date()

  const allDeals = await prisma.deal.findMany({
    where: {
      createdAt: { gte: from, lte: to },
    },
    select: {
      id: true,
      stage: true,
      source: true,
      budgetClient: true,
      budgetContractor: true,
      profit: true,
      managerProfit: true,
      completedAt: true,
      createdAt: true,
    },
  })

  const completed = allDeals.filter((d) => d.stage === 'COMPLETED')

  const sumBudgetClient = completed.reduce((s, d) => s + (d.budgetClient || 0), 0)
  const sumBudgetContractor = completed.reduce((s, d) => s + (d.budgetContractor || 0), 0)
  const sumProfit = completed.reduce((s, d) => s + (d.profit || 0), 0)
  const sumManagerProfit = completed.reduce((s, d) => s + (d.managerProfit || 0), 0)
  const conversion = allDeals.length > 0 ? completed.length / allDeals.length : 0

  // По источникам (only COMPLETED)
  const bySource: Record<string, { count: number; revenue: number }> = {}
  for (const d of completed) {
    const key = d.source || 'OTHER'
    if (!bySource[key]) bySource[key] = { count: 0, revenue: 0 }
    bySource[key].count += 1
    bySource[key].revenue += d.budgetClient || 0
  }

  // По месяцам — выручка и прибыль
  const byMonth: Record<string, { revenue: number; profit: number }> = {}
  for (const d of completed) {
    const date = d.completedAt || d.createdAt
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!byMonth[month]) byMonth[month] = { revenue: 0, profit: 0 }
    byMonth[month].revenue += d.budgetClient || 0
    byMonth[month].profit += d.profit || 0
  }
  const monthsSorted = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, ...v }))

  return NextResponse.json({
    totals: {
      revenue: sumBudgetClient,
      contractorPayouts: sumBudgetContractor,
      profit: sumProfit,
      managerProfit: sumManagerProfit,
      dealsTotal: allDeals.length,
      dealsCompleted: completed.length,
      conversion: +(conversion * 100).toFixed(1),
    },
    bySource: Object.entries(bySource).map(([source, v]) => ({ source, ...v })),
    byMonth: monthsSorted,
  })
}
