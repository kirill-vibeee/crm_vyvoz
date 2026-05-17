import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()

  const deal = await prisma.deal.create({
    data: {
      ...data,
      responsibleId: session.user.id,
    },
    include: { responsible: true, files: true },
  })

  return NextResponse.json(deal, { status: 201 })
}
