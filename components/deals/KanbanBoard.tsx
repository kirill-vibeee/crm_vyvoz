'use client'

import { DEAL_STAGES } from '@/types'
import { Deal } from '@prisma/client'
import { useEffect, useState } from 'react'
import { CreateDealForm } from './CreateDealForm'
import { DealModal } from './DealModal'

export function KanbanBoard() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchDeals()
  }, [])

  async function fetchDeals() {
    const res = await fetch('/api/deals')
    if (res.ok) {
      setDeals(await res.json())
    }
    setLoading(false)
  }

  async function handleDealStageChange(dealId: string, newStage: string) {
    const res = await fetch(`/api/deals/${dealId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    })

    if (res.ok) {
      setDeals(deals.map((d) => (d.id === dealId ? { ...d, stage: newStage as any } : d)))
    }
  }

  if (loading) {
    return <div className="p-8 text-text-muted">Загрузка...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Сделки</h1>
      <p className="text-text-muted text-sm mb-8">Управление заявками по вывозу мусора</p>

      <CreateDealForm onSuccess={fetchDeals} />

      <div className="grid auto-cols-max gap-6 overflow-x-auto pb-4">
        {DEAL_STAGES.map((stageConfig) => {
          const stageDeal = deals.filter((d) => d.stage === stageConfig.value)
          const stageBudget = stageDeal.reduce((sum, d) => sum + (d.budgetClient || 0), 0)

          return (
            <div
              key={stageConfig.value}
              className="min-w-96 bg-surface border border-border rounded-lg p-4 flex flex-col max-h-[calc(100vh-300px)]"
            >
              <div className={`${stageConfig.color} text-white px-3 py-2 rounded text-sm font-medium mb-3 w-full text-center`}>
                {stageConfig.label}
              </div>

              <div className="text-xs text-text-muted mb-4 flex justify-between">
                <span>{stageDeal.length} сделок</span>
                {stageBudget > 0 && <span className="text-accent font-medium">{stageBudget} ₽</span>}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {stageDeal.map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => {
                      setSelectedDeal(deal)
                      setShowModal(true)
                    }}
                    className="bg-background border border-border rounded p-3 text-sm cursor-pointer hover:border-accent hover:shadow-md transition-all"
                  >
                    <p className="font-medium text-text-primary truncate">{deal.title}</p>
                    {deal.budgetClient && (
                      <p className="text-xs text-accent mt-2 font-medium">{deal.budgetClient} ₽</p>
                    )}
                    {deal.contractorName && (
                      <p className="text-xs text-text-muted mt-1">Исп: {deal.contractorName}</p>
                    )}
                  </div>
                ))}
              </div>

              {stageDeal.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-text-muted text-xs">Нет сделок</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showModal && selectedDeal && (
        <DealModal
          deal={selectedDeal}
          allDeals={deals}
          onClose={() => {
            setShowModal(false)
            setSelectedDeal(null)
          }}
          onUpdate={(updated) => {
            setDeals(deals.map((d) => (d.id === updated.id ? updated : d)))
            setSelectedDeal(updated)
          }}
        />
      )}
    </div>
  )
}
