import { Deal, DealStageId, SOURCE_OPTIONS, STATUS_OPTIONS } from '@/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

function fmtDate(d: Date | string | null | undefined): string | null {
  if (!d) return null
  try {
    return format(new Date(d), 'd MMM', { locale: ru })
  } catch {
    return null
  }
}

function fmtMoney(n: number | null | undefined): string | null {
  if (!n) return null
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'М ₽'
  if (n >= 1_000) return Math.round(n / 1000) + 'К ₽'
  return n + ' ₽'
}

function sourceLabel(s: string | null | undefined): string | null {
  if (!s) return null
  return SOURCE_OPTIONS.find((x) => x.value === s)?.label || null
}

function statusLabel(s: string | null | undefined): string | null {
  if (!s) return null
  return STATUS_OPTIONS.find((x) => x.value === s)?.label || null
}

function join(parts: (string | null)[], sep = ' · '): string {
  return parts.filter(Boolean).join(sep)
}

/**
 * Авто-название сделки в зависимости от стадии и заполненных полей.
 * Если менеджер ввёл свой title — используем его.
 */
export function autoDealTitle(deal: Pick<Deal, 'title' | 'stage' | 'status' | 'source' | 'orderDate' | 'reminderDate' | 'reminderTime' | 'budgetClient' | 'contactName'>): string {
  // Менеджер задал название — приоритет за ним
  if (deal.title && deal.title.trim() && !isAutoTitle(deal.title)) {
    return deal.title
  }

  const stage = deal.stage as DealStageId
  const src = sourceLabel(deal.source)
  const status = statusLabel(deal.status)
  const orderDate = fmtDate(deal.orderDate)
  const reminderDate = fmtDate(deal.reminderDate)
  const budget = fmtMoney(deal.budgetClient)
  const time = deal.reminderTime || null

  switch (stage) {
    case 'NEW':
      return deal.contactName || deal.title || 'Новая заявка'

    case 'AWAITING_DECISION':
      return join([status, reminderDate, src]) || deal.title || 'Дожим'

    case 'DEFERRED':
      return join([orderDate || reminderDate, budget, src]) || deal.title || 'Отложено'

    case 'AGREED_FINDING':
    case 'IN_PROGRESS': {
      const dt = orderDate && time ? `${orderDate} ${time}` : orderDate || time
      return join([dt, budget, src]) || deal.title || (stage === 'IN_PROGRESS' ? 'В работе' : 'Согласовано')
    }

    case 'COMPLETED':
      return join([orderDate, budget, src]) || deal.title || 'Реализована'

    case 'REFUSED':
      return deal.title || 'Отказ'

    default:
      return deal.title || 'Сделка'
  }
}

// Эвристика: если title выглядит как автоматический ("12 мая · 50К ₽ · Avito"),
// значит можно перегенерировать без потери ручного ввода.
const AUTO_PATTERN = /^[\d\sа-яА-Я]+([·.\-—]\s*\S+)+$/

export function isAutoTitle(title: string): boolean {
  return AUTO_PATTERN.test(title.trim())
}
