'use client'

import { Deal, DealStageId, PIPELINE_STAGES, REFUSED_STAGE } from '@/types'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useEffect, useMemo, useState } from 'react'
import { DealCard } from './DealCard'
import { DealDetailPanel } from './DealDetailPanel'
import { KanbanColumn } from './KanbanColumn'
import { RefusedDropZone } from './RefusedDropZone'

export function KanbanBoard() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  useEffect(() => {
    fetch('/api/deals')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setDeals(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const dealsByStage = useMemo(() => {
    const map: Record<string, Deal[]> = {}
    for (const stage of [...PIPELINE_STAGES, REFUSED_STAGE]) {
      map[stage.id] = []
    }
    for (const deal of deals) {
      const list = map[deal.stage as DealStageId]
      if (list) list.push(deal)
    }
    return map
  }, [deals])

  async function handleCreate(title: string) {
    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, stage: 'NEW' }),
    })
    if (res.ok) {
      const deal = await res.json()
      setDeals((prev) => [deal, ...prev])
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const deal = deals.find((d) => d.id === event.active.id)
    setActiveDeal(deal || null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDeal(null)
    const { active, over } = event
    if (!over) return

    const dragged = deals.find((d) => d.id === active.id)
    if (!dragged) return

    let targetStage = over.data?.current?.stageId as DealStageId | undefined
    if (!targetStage) {
      const overDeal = deals.find((d) => d.id === over.id)
      if (overDeal) targetStage = overDeal.stage as DealStageId
    }
    if (!targetStage || targetStage === dragged.stage) return

    const originalStage = dragged.stage
    setDeals((prev) =>
      prev.map((d) => (d.id === dragged.id ? { ...d, stage: targetStage! } : d))
    )

    try {
      const res = await fetch(`/api/deals/${dragged.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: targetStage }),
      })
      if (!res.ok) throw new Error('failed')
    } catch {
      setDeals((prev) =>
        prev.map((d) => (d.id === dragged.id ? { ...d, stage: originalStage } : d))
      )
    }
  }

  function handleUpdate(updated: Deal) {
    setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    setSelectedDeal(updated)
  }

  async function handleDelete(id: string) {
    setDeals((prev) => prev.filter((d) => d.id !== id))
    setSelectedDeal(null)
    await fetch(`/api/deals/${id}`, { method: 'DELETE' })
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted text-sm">
        Загрузка…
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-3 h-full px-4 pt-4 pb-2 min-h-0">
            {PIPELINE_STAGES.map((stage) => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                deals={dealsByStage[stage.id] || []}
                onCardClick={setSelectedDeal}
                onCreate={stage.id === 'NEW' ? handleCreate : undefined}
              />
            ))}
          </div>
        </div>

        <RefusedDropZone
          deals={dealsByStage[REFUSED_STAGE.id] || []}
          onCardClick={setSelectedDeal}
        />

        <DragOverlay>
          {activeDeal && (
            <div className="rotate-2 opacity-95 cursor-grabbing">
              <DealCard deal={activeDeal} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <DealDetailPanel
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  )
}
