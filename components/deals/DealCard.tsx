'use client'

import { autoDealTitle } from '@/lib/dealTitle'
import { formatMoney } from '@/lib/money'
import { Deal, SOURCE_OPTIONS, STATUS_OPTIONS } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, Clock, User } from 'lucide-react'

interface DealCardProps {
  deal: Deal
  onClick: () => void
}

function fmtMoney(n?: number | null) {
  if (n == null) return null
  return formatMoney(n)
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { deal },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const title = autoDealTitle(deal)
  const sourceLabel = deal.source ? SOURCE_OPTIONS.find((s) => s.value === deal.source)?.label : null
  const statusLabel = deal.status ? STATUS_OPTIONS.find((s) => s.value === deal.status)?.label : null
  const budget = fmtMoney(deal.budgetClient)
  const isFinal = deal.stage === 'COMPLETED' || deal.stage === 'REFUSED'
  const date = isFinal ? deal.completedAt : (deal.orderDate || deal.reminderDate)
  const dateStr = date ? format(new Date(date), 'd MMM', { locale: ru }) : null
  const dateLabel = isFinal ? 'закрыта' : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-bg-elevated border border-border rounded-md p-2.5 cursor-grab active:cursor-grabbing hover:border-border-hover hover:bg-surface-hover transition-colors group"
    >
      <div className="text-[13px] font-medium text-text leading-snug mb-2 line-clamp-2">
        {title}
      </div>

      <div className="flex flex-wrap items-center gap-1 mb-1.5">
        {sourceLabel && (
          <span className="inline-flex items-center px-1.5 h-[18px] text-[10.5px] font-medium rounded bg-surface text-text-muted border border-border">
            {sourceLabel}
          </span>
        )}
        {statusLabel && (
          <span className="inline-flex items-center px-1.5 h-[18px] text-[10.5px] font-medium rounded bg-accent-soft text-accent">
            {statusLabel}
          </span>
        )}
        {budget && (
          <span className="inline-flex items-center px-1.5 h-[18px] text-[10.5px] font-semibold rounded text-success">
            {budget}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-text-muted">
        {dateStr && (
          <span className="inline-flex items-center gap-1">
            <Calendar size={10} strokeWidth={2} />
            {dateLabel ? `${dateLabel} ${dateStr}` : dateStr}
          </span>
        )}
        {deal.reminderTime && (
          <span className="inline-flex items-center gap-1">
            <Clock size={10} strokeWidth={2} /> {deal.reminderTime}
          </span>
        )}
        {deal.contactName && (
          <span className="inline-flex items-center gap-1 truncate max-w-[120px]">
            <User size={10} strokeWidth={2} /> {deal.contactName}
          </span>
        )}
      </div>
    </div>
  )
}
