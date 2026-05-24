import { fetchAllLeads, mapAmoStatusToStage } from '@/lib/amocrm'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

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

export async function POST() {
  const leads = await fetchAllLeads()
  if (!leads.length) {
    return NextResponse.json({
      imported: 0,
      updated: 0,
      total: 0,
      error: 'Не удалось получить сделки из Amo (или их нет). Проверь токен и поддомен.',
    })
  }

  const responsibleId = await getDefaultUserId()

  let imported = 0
  let updated = 0

  for (const lead of leads) {
    const stage = mapAmoStatusToStage(lead.statusName)
    const existing = await prisma.deal.findUnique({ where: { amoLeadId: BigInt(lead.id) } })

    if (existing) {
      await prisma.deal.update({
        where: { id: existing.id },
        data: {
          title: lead.name,
          stage: stage as any,
          budgetClient: lead.price || null,
          contractorName: lead.contactName || null,
          updatedAt: lead.updatedAt,
        },
      })
      updated++
    } else {
      await prisma.deal.create({
        data: {
          amoLeadId: BigInt(lead.id),
          source_system: 'amo',
          title: lead.name,
          stage: stage as any,
          budgetClient: lead.price || null,
          contractorName: lead.contactName || null,
          responsibleId,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
          completedAt: lead.closedAt,
        },
      })
      imported++
    }
  }

  return NextResponse.json({ imported, updated, total: leads.length })
}
