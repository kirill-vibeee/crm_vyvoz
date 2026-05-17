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
  const { searchParams } = new URL(request.url)
  const stage = searchParams.get('stage')

  const deals = await prisma.deal.findMany({
    where: stage ? { stage: stage as any } : undefined,
    include: { responsible: true, files: true, comments: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(deals)
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  const responsibleId = await getDefaultUserId()

  const deal = await prisma.deal.create({
    data: {
      ...data,
      responsibleId,
    },
    include: { responsible: true, files: true },
  })

  return NextResponse.json(deal, { status: 201 })
}
