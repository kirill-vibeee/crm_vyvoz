import { prisma } from '@/lib/prisma'
import { normalizePhone } from '@/lib/phone'
import { NextResponse } from 'next/server'

interface Contact {
  phone: string
  name: string
  email?: string
  telegram?: string
  dealCount: number
  totalBudget: number
  lastDealAt: string
  dealIds: string[]
}

export async function GET() {
  const deals = await prisma.deal.findMany({ orderBy: { updatedAt: 'desc' } })

  const byPhone = new Map<string, Contact>()
  for (const d of deals as any[]) {
    if (!d.contactPhone && !d.contactName) continue
    const phone = d.contactPhone ? normalizePhone(d.contactPhone) : ''
    const key = phone || `__noname_${d.contactName || d.id}`

    const existing = byPhone.get(key)
    if (existing) {
      existing.dealCount += 1
      existing.totalBudget += d.budgetClient || 0
      existing.dealIds.push(d.id)
      // Обновляем поля если у новой записи есть свежие данные
      if (d.contactName && !existing.name) existing.name = d.contactName
      if (d.contactEmail && !existing.email) existing.email = d.contactEmail
      if (d.contactTelegram && !existing.telegram) existing.telegram = d.contactTelegram
    } else {
      byPhone.set(key, {
        phone,
        name: d.contactName || '—',
        email: d.contactEmail || undefined,
        telegram: d.contactTelegram || undefined,
        dealCount: 1,
        totalBudget: d.budgetClient || 0,
        lastDealAt: d.updatedAt,
        dealIds: [d.id],
      })
    }
  }

  const contacts = [...byPhone.values()].sort(
    (a, b) => new Date(b.lastDealAt).getTime() - new Date(a.lastDealAt).getTime()
  )
  return NextResponse.json(contacts)
}
