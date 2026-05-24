import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const FINAL_STAGES = new Set(['COMPLETED', 'REFUSED'])

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { stage } = await request.json()

  const isFinal = FINAL_STAGES.has(stage)
  const updateData: any = { stage }

  if (isFinal) {
    updateData.completedAt = new Date()
  } else {
    // Если возвращают из финальной в активную — сбрасываем completedAt
    updateData.completedAt = null
  }

  const deal = await prisma.deal.update({
    where: { id },
    data: updateData,
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
