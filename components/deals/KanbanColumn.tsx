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

function fmtMoney(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'М ₽'
  if (n >= 1_000) return Math.round(n / 1000) + 'К ₽'
  return n + ' ₽'
}

export function KanbanColumn({ stage, deals, onCardClick, onCreate }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id, data: { stageId: stage.id } })
  const totalBudget = deals.reduce((sum, d) => sum + (d.budgetClient || 0), 0)
  const dealIds = deals.map((d) => d.id)

  return (
    <div className="shrink-0 flex flex-col h-full snap-start min-w-[88vw] md:min-w-0 md:w-72">
      <div className="px-1 mb-2 flex items-center gap-2 h-7">
        <span className={`w-1.5 h-1.5 rounded-full ${stage.dot} shrink-0`} />
        <span className="font-mono uppercase tracking-wider text-[11px] font-semibold text-text">
          {stage.label}
        </span>
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10.5px] rounded-full bg-bg-elevated border border-border text-text-muted font-medium">
          {deals.length}
        </span>
        {totalBudget > 0 && (
          <span className="text-[10.5px] text-text-dim ml-auto font-mono">
            {fmtMoney(totalBudget)}
          </span>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-0 overflow-y-auto rounded-md transition-colors p-1 space-y-1.5 ${
          isOver ? 'bg-accent-soft border border-accent/50' : 'bg-surface/40 border border-border/50'
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
