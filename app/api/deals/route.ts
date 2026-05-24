import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

async function getDefaultUserId() {
  const existing = await prisma.user.findFirst()
  if (existing) return existing.id

  const user = await prisma.user.create({
    data: {
      email: 'kirill@example.com',
      name: 'Кирилл',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('kirill123', 12),
    },
  })
  return user.id
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')

    const deals = await prisma.deal.findMany({
      where: stage ? { stage: stage as any } : undefined,
      include: { responsible: true, files: true, comments: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(deals)
  } catch (err: any) {
    console.error('[GET /api/deals] error:', err)
    return NextResponse.json({ error: err?.message || 'load failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const responsibleId = await getDefaultUserId()

    // Whitelist полей — иначе spread может пихнуть лишнее и вызвать unknown column
    const ALLOWED = [
      'title', 'stage', 'status', 'source',
      'budgetClient', 'budgetContractor',
      'orderDate', 'reminderDate', 'reminderTime',
      'contactName', 'contactPhone', 'contactEmail', 'contactTelegram',
      'contractorName', 'contractorPhone', 'contractorTgHandle',
      'address', 'city', 'notes',
    ]
    const safeData: any = {}
    for (const k of ALLOWED) if (k in data) safeData[k] = data[k]

    const deal = await prisma.deal.create({
      data: {
        ...safeData,
        title: safeData.title || 'Новая сделка',
        responsibleId,
      },
      include: { responsible: true, files: true },
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/deals] error:', err)
    return NextResponse.json(
      { error: err?.message || 'Ошибка создания сделки', code: err?.code },
      { status: 500 }
    )
  }
}
