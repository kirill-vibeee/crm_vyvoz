'use client'

import { Deal, SOURCE_OPTIONS } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MapPin, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface DealCardProps {
  deal: Deal
  onClick: () => void
  isDragging?: boolean
}

function formatMoney(n?: number | null) {
  if (n == null) return null
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽'
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

  const sourceLabel = deal.source ? SOURCE_OPTIONS.find((s) => s.value === deal.source)?.label : null
  const budget = formatMoney(deal.budgetClient)
  const orderDate = deal.orderDate ? format(new Date(deal.orderDate), 'd MMM', { locale: ru }) : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-bg-elevated border border-border rounded-md p-3 cursor-grab active:cursor-grabbing hover:border-border-hover transition-colors group"
    >
      <div className="text-[13px] font-medium text-text leading-snug mb-2 line-clamp-2">
        {deal.title}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {sourceLabel && (
          <span className="inline-flex items-center px-1.5 h-5 text-[10.5px] font-medium rounded bg-surface text-text-muted border border-border">
            {sourceLabel}
          </span>
        )}
        {budget && (
          <span className="inline-flex items-center px-1.5 h-5 text-[10.5px] font-medium rounded bg-accent-soft text-accent">
            {budget}
          </span>
        )}
      </div>

      <div className="space-y-1 text-[11.5px] text-text-muted">
        {deal.address && (
          <div className="flex items-center gap-1.5">
            <MapPin size={11} strokeWidth={2} />
            <span className="truncate">{deal.address}</span>
          </div>
        )}
        {deal.contractorName && (
          <div className="flex items-center gap-1.5">
            <User size={11} strokeWidth={2} />
            <span className="truncate">{deal.contractorName}</span>
          </div>
        )}
        {orderDate && (
          <div className="flex items-center gap-1.5">
            <Calendar size={11} strokeWidth={2} />
            <span>{orderDate}</span>
          </div>
        )}
      </div>
    </div>
  )
}
