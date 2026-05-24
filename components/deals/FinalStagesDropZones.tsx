'use client'

import { COMPLETED_STAGE, Deal, REFUSED_STAGE } from '@/types'
import { useDroppable } from '@dnd-kit/core'
import { CheckCircle2, XCircle } from 'lucide-react'

interface ZoneProps {
  stageId: 'COMPLETED' | 'REFUSED'
  label: string
  icon: typeof CheckCircle2
  count: number
  tone: 'success' | 'danger'
  isDragging: boolean
}

function Zone({ stageId, label, icon: Icon, count, tone, isDragging }: ZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId, data: { stageId } })

  const toneClasses =
    tone === 'success'
      ? {
          base: 'border-success/30 text-success bg-success/5',
          over: 'border-success bg-success/15 ring-2 ring-success/40',
        }
      : {
          base: 'border-danger/30 text-danger bg-danger/5',
          over: 'border-danger bg-danger/15 ring-2 ring-danger/40',
        }

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 border border-dashed rounded-md transition-all ${
        isOver ? toneClasses.over : toneClasses.base
      } ${isDragging ? 'min-h-24' : 'h-9'}`}
    >
      <div className="h-full flex items-center justify-center gap-2 px-3">
        <Icon size={isDragging ? 18 : 14} strokeWidth={2} />
        <span className={`font-mono uppercase tracking-wider ${isDragging ? 'text-[12px]' : 'text-[11px]'} font-semibold`}>
          {label}
        </span>
        <span className="text-[11px] opacity-60">· {count}</span>
        {isDragging && (
          <span className="text-[11px] opacity-70 ml-2">отпусти здесь</span>
        )}
      </div>
    </div>
  )
}

interface FinalStagesDropZonesProps {
  completedDeals: Deal[]
  refusedDeals: Deal[]
  isDragging: boolean
}

export function FinalStagesDropZones({ completedDeals, refusedDeals, isDragging }: FinalStagesDropZonesProps) {
  return (
    <div className="px-4 pb-3 shrink-0">
      <div className="flex gap-2">
        <Zone
          stageId="COMPLETED"
          label={COMPLETED_STAGE.label}
          icon={CheckCircle2}
          count={completedDeals.length}
          tone="success"
          isDragging={isDragging}
        />
        <Zone
          stageId="REFUSED"
          label={REFUSED_STAGE.label}
          icon={XCircle}
          count={refusedDeals.length}
          tone="danger"
          isDragging={isDragging}
        />
      </div>
    </div>
  )
}
