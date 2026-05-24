import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

async function getDefaultUserId() {
  const existing = await prisma.user.findFirst()
  if (existing) return existing.id
  const u = await prisma.user.create({
    data: {
      email: 'kirill@example.com',
      name: 'Кирилл',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('kirill123', 12),
    },
  })
  return u.id
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params
  const messages = await prisma.comment.findMany({
    where: { dealId },
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { id: true, name: true } } },
  })
  return NextResponse.json(messages)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params
  const body = await request.json()
  const authorId = await getDefaultUserId()

  const comment = await prisma.comment.create({
    data: {
      dealId,
      authorId,
      text: String(body.text || '').slice(0, 4000),
      channel: (body.channel || 'NOTE') as any,
      direction: body.direction || null,
    },
    include: { author: { select: { id: true, name: true } } },
  })
  return NextResponse.json(comment, { status: 201 })
}
