import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { stage } = await request.json()

  const deal = await prisma.deal.update({
    where: { id },
    data: { stage },
    include: { responsible: true },
  })

  await prisma.activity.create({
    data: {
      dealId: id,
      type: 'STAGE_CHANGED',
      data: { to: stage },
    },
  })

  return NextResponse.json(deal)
}
