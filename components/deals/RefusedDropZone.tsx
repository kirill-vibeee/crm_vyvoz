'use client'

import { Deal, REFUSED_STAGE } from '@/types'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { XCircle } from 'lucide-react'
import { useState } from 'react'
import { DealCard } from './DealCard'

interface RefusedDropZoneProps {
  deals: Deal[]
  onCardClick: (deal: Deal) => void
}

export function RefusedDropZone({ deals, onCardClick }: RefusedDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: REFUSED_STAGE.id, data: { stageId: REFUSED_STAGE.id } })
  const [expanded, setExpanded] = useState(false)
  const dealIds = deals.map((d) => d.id)

  return (
    <div
      ref={setNodeRef}
      className={`border-t transition-colors ${
        isOver ? 'border-danger bg-danger/5' : 'border-border bg-surface/40'
      }`}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-4 h-9 text-[12px] text-text-muted hover:text-text transition-colors"
      >
        <XCircle size={13} strokeWidth={2} className="text-danger" />
        <span className="font-medium">Отказ</span>
        <span className="text-text-dim">{deals.length}</span>
        <span className="ml-auto text-[11px] text-text-dim">
          {isOver ? 'Отпусти, чтобы отказать' : expanded ? 'Скрыть' : 'Показать'}
        </span>
      </button>

      {(expanded || isOver) && (
        <div className="px-4 pb-3">
          <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-3 gap-1.5">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} onClick={() => onCardClick(deal)} />
              ))}
            </div>
          </SortableContext>
          {deals.length === 0 && (
            <div className="text-[11px] text-text-dim text-center py-2">
              Перетащи сюда сделку, чтобы отказать
            </div>
          )}
        </div>
      )}
    </div>
  )
}
