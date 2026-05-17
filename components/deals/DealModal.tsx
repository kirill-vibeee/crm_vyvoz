'use client'

import { DEAL_STAGES } from '@/types'
import { Deal, DealStatus, Source, User } from '@prisma/client'
import { useState } from 'react'

interface DealModalProps {
  deal: Deal
  allDeals: Deal[]
  onClose: () => void
  onUpdate: (deal: Deal) => void
}

export function DealModal({ deal, allDeals, onClose, onUpdate }: DealModalProps) {
  const [title, setTitle] = useState(deal.title)
  const [stage, setStage] = useState(deal.stage)
  const [status, setStatus] = useState<DealStatus | undefined>(deal.status || undefined)
  const [source, setSource] = useState<Source | undefined>(deal.source || undefined)
  const [budgetClient, setBudgetClient] = useState(deal.budgetClient || '')
  const [budgetContractor, setBudgetContractor] = useState(deal.budgetContractor || '')
  const [address, setAddress] = useState(deal.address || '')
  const [contractorName, setContractorName] = useState(deal.contractorName || '')
  const [contractorPhone, setContractorPhone] = useState(deal.contractorPhone || '')
  const [reminderDate, setReminderDate] = useState(deal.reminderDate ? deal.reminderDate.toISOString().split('T')[0] : '')
  const [reminderTime, setReminderTime] = useState(deal.reminderTime || '')
  const [notes, setNotes] = useState(deal.notes || '')
  const [loading, setLoading] = useState(false)

  const profit = budgetClient && budgetContractor ? Number(budgetClient) - Number(budgetContractor) : 0
  const managerProfit = profit ? profit * 0.1 : 0

  async function handleSave() {
    setLoading(true)

    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          stage,
          status,
          source,
          budgetClient: budgetClient ? Number(budgetClient) : null,
          budgetContractor: budgetContractor ? Number(budgetContractor) : null,
          address,
          contractorName,
          contractorPhone,
          reminderDate: reminderDate ? new Date(reminderDate) : null,
          reminderTime,
          notes,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        onUpdate(updated)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-lg p-6 max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold text-text-primary bg-transparent border-b border-border pb-2 w-full focus:outline-none focus:border-accent"
            />
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-2xl ml-4"
          >
            ✕
          </button>
        </div>

        {/* Main fields grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-text-muted mb-1">Стадия</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-accent text-sm"
            >
              {DEAL_STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">Статус</label>
            <select
              value={status || ''}
              onChange={(e) => setStatus(e.target.value as DealStatus | '')}
              className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-accent text-sm"
            >
              <option value="">Не выбран</option>
              <option value="WAITING_ANSWER">Ждем ответ</option>
              <option value="AGREED">Согласовано</option>
              <option value="CALL">Позвонить</option>
              <option value="CLARIFY">Уточнить</option>
              <option value="WRITE">Написать</option>
              <option value="WAITING_PHOTO">Ждем фото</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">Источник</label>
            <select
              value={source || ''}
              onChange={(e) => setSource(e.target.value as Source | '')}
              className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-accent text-sm"
            >
              <option value="">Не выбран</option>
              <option value="AVITO">Авито</option>
              <option value="YANDEX_DIRECT">Яндекс.Директ</option>
              <option value="YANDEX_MAPS">Яндекс.Карты</option>
              <option value="WEBSITE">Сайт</option>
              <option value="REFERRAL">Рекомендация</option>
              <option value="OTHER">Другое</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">Адрес</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Адрес работы"
              className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent text-sm"
            />
          </div>
        </div>

        {/* Financials */}
        <div className="bg-background border border-border rounded p-4 mb-6">
          <h3 className="font-medium text-text-primary mb-3">Финансы</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Бюджет клиента (₽)</label>
              <input
                type="number"
                value={budgetClient}
                onChange={(e) => setBudgetClient(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-accent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-1">Сумма исполнителю (₽)</label>
              <input
                type="number"
                value={budgetContractor}
                onChange={(e) => setBudgetContractor(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-accent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-1">Прибыль (авто)</label>
              <div className="bg-surface border border-border rounded px-3 py-2 text-accent font-medium text-sm">
                {profit} ₽
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-1">Прибыль менеджера (10%)</label>
              <div className="bg-surface border border-border rounded px-3 py-2 text-accent font-medium text-sm">
                {managerProfit.toFixed(0)} ₽
              </div>
            </div>
          </div>
        </div>

        {/* Contractor info */}
        <div className="bg-background border border-border rounded p-4 mb-6">
          <h3 className="font-medium text-text-primary mb-3">Исполнитель</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
              placeholder="Имя исполнителя"
              className="col-span-2 bg-background border border-border rounded px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent text-sm"
            />

            <input
              type="tel"
              value={contractorPhone}
              onChange={(e) => setContractorPhone(e.target.value)}
              placeholder="Телефон"
              className="bg-background border border-border rounded px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent text-sm"
            />

            <div>
              <label className="block text-sm text-text-muted mb-1">Дата выполнения</label>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-accent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-1">Время</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-accent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm text-text-muted mb-1">Заметки</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Дополнительная информация..."
            rows={3}
            className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-primary hover:bg-background/50 rounded transition-colors text-sm"
          >
            Закрыть
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-accent hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
