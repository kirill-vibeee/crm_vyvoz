'use client'

import { Deal, StageConfig } from '@/types'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DealCard } from './DealCard'
import { DealQuickCreate } from './DealQuickCreate'

interface KanbanColumnProps {
  stage: StageConfig
  deals: Deal[]
  onCardClick: (deal: Deal) => void
  onCreate?: (title: string) => Promise<void>
}

function formatMoney(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'М ₽'
  if (n >= 1_000) return Math.round(n / 1000) + 'К ₽'
  return n + ' ₽'
}

export function KanbanColumn({ stage, deals, onCardClick, onCreate }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id, data: { stageId: stage.id } })

  const totalBudget = deals.reduce((sum, d) => sum + (d.budgetClient || 0), 0)
  const dealIds = deals.map((d) => d.id)

  return (
    <div className="w-72 shrink-0 flex flex-col h-full">
      <div className="px-1 mb-2 flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
        <span className="text-[12px] font-semibold text-text">{stage.label}</span>
        <span className="text-[11px] text-text-dim">{deals.length}</span>
        {totalBudget > 0 && (
          <span className="text-[11px] text-text-muted ml-auto">{formatMoney(totalBudget)}</span>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-0 overflow-y-auto rounded-md border border-dashed transition-colors p-1.5 space-y-1.5 ${
          isOver ? 'border-accent bg-accent-soft/30' : 'border-transparent'
        }`}
      >
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onClick={() => onCardClick(deal)} />
          ))}
        </SortableContext>

        {onCreate && <DealQuickCreate onCreate={onCreate} />}

        {deals.length === 0 && !onCreate && (
          <div className="h-16 flex items-center justify-center text-[11px] text-text-dim">
            Пусто
          </div>
        )}
      </div>
    </div>
  )
}
