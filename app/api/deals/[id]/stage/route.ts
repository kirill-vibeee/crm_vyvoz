import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { stage } = await request.json()

  const deal = await prisma.deal.update({
    where: { id },
    data: { stage },
    include: { responsible: true },
  })

  // Log activity
  await prisma.activity.create({
    data: {
      dealId: id,
      type: 'STAGE_CHANGED',
      data: { to: stage },
      userId: session.user.id,
    },
  })

  return NextResponse.json(deal)
}
