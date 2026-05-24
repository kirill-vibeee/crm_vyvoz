'use client'

import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { autoDealTitle } from '@/lib/dealTitle'
import { ALL_STAGES, Deal, DealStageId, SOURCE_OPTIONS, STATUS_OPTIONS } from '@/types'
import { MessageSquare, Settings2, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DealChatPane } from './DealChatPane'
import { DealContactSection } from './DealContactSection'
import { DealFilesSection } from './DealFilesSection'

interface DealDetailPanelProps {
  deal: Deal | null
  onClose: () => void
  onUpdate: (deal: Deal) => void
  onDelete: (id: string) => Promise<void>
}

function formatMoney(n?: number | null) {
  if (n == null) return '—'
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽'
}

function orderDateLabel(stage: DealStageId): string {
  if (stage === 'AGREED_FINDING' || stage === 'IN_PROGRESS') return 'Дата выполнения'
  if (stage === 'AWAITING_DECISION' || stage === 'DEFERRED') return 'Дата дожима'
  return 'Дата заказа'
}

type Tab = 'fields' | 'chat'

export function DealDetailPanel({ deal, onClose, onUpdate, onDelete }: DealDetailPanelProps) {
  const [form, setForm] = useState<Partial<Deal>>({})
  const [saving, setSaving] = useState(false)
  const [mobileTab, setMobileTab] = useState<Tab>('fields')

  useEffect(() => {
    if (deal) {
      setForm(deal)
      setMobileTab('fields')
    }
  }, [deal])

  useEffect(() => {
    if (!deal) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [deal, onClose])

  if (!deal) return null

  function set<K extends keyof Deal>(key: K, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function save() {
    if (!deal) return
    setSaving(true)
    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title || null,
          stage: form.stage,
          status: form.status || null,
          source: form.source || null,
          budgetClient: form.budgetClient ? Number(form.budgetClient) : null,
          budgetContractor: form.budgetContractor ? Number(form.budgetContractor) : null,
          contactName: form.contactName || null,
          contactPhone: form.contactPhone || null,
          contactEmail: form.contactEmail || null,
          contactTelegram: form.contactTelegram || null,
          contractorName: form.contractorName || null,
          contractorPhone: form.contractorPhone || null,
          contractorTgHandle: form.contractorTgHandle || null,
          orderDate: form.orderDate || null,
          reminderDate: form.reminderDate || null,
          reminderTime: form.reminderTime || null,
          notes: form.notes || null,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        onUpdate(updated)
      }
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!confirm('Удалить сделку безвозвратно?')) return
    if (deal) await onDelete(deal.id)
  }

  const budgetClient = Number(form.budgetClient) || 0
  const budgetContractor = Number(form.budgetContractor) || 0
  const profit = budgetClient && budgetContractor ? budgetClient - budgetContractor : 0
  const managerProfit = profit * 0.1
  const stage = (form.stage as DealStageId) || 'NEW'
  const dateLabel = orderDateLabel(stage)
  const previewTitle = autoDealTitle(form as Deal)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative h-full w-full md:w-[820px] bg-bg-elevated md:border-l md:border-border flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.6)] animate-[slideIn_180ms_cubic-bezier(0.22,1,0.36,1)]">
        <header className="flex items-center justify-between h-12 px-4 border-b border-border shrink-0">
          <h2 className="text-[13px] font-semibold text-text truncate">
            {previewTitle}
          </h2>
          <div className="flex items-center gap-1">
            <div className="md:hidden flex items-center gap-1 mr-2">
              <button
                onClick={() => setMobileTab('fields')}
                className={`px-2 h-7 rounded text-[11.5px] ${
                  mobileTab === 'fields' ? 'bg-accent text-white' : 'text-text-muted'
                }`}
              >
                <Settings2 size={12} className="inline mr-1" />
                Поля
              </button>
              <button
                onClick={() => setMobileTab('chat')}
                className={`px-2 h-7 rounded text-[11.5px] ${
                  mobileTab === 'chat' ? 'bg-accent text-white' : 'text-text-muted'
                }`}
              >
                <MessageSquare size={12} className="inline mr-1" />
                Чат
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-text-muted hover:bg-surface hover:text-text transition-colors"
              aria-label="Закрыть"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 flex">
          {/* Поля сделки */}
          <div
            className={`flex-1 min-w-0 overflow-y-auto md:border-r md:border-border ${
              mobileTab === 'fields' ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="p-5 space-y-5">
              <Field label="Заголовок" hint={!form.title ? `Будет автоматически: ${previewTitle}` : undefined}>
                <Input
                  value={form.title || ''}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder={previewTitle}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Стадия">
                  <Select
                    value={form.stage || 'NEW'}
                    onChange={(e) => set('stage', e.target.value as any)}
                    options={ALL_STAGES.map((s) => ({ value: s.id, label: s.label }))}
                  />
                </Field>
                <Field label="Статус">
                  <Select
                    value={form.status || ''}
                    onChange={(e) => set('status', e.target.value || null)}
                    placeholder="—"
                    options={STATUS_OPTIONS}
                  />
                </Field>
              </div>

              <Field label="Источник">
                <Select
                  value={form.source || ''}
                  onChange={(e) => set('source', e.target.value || null)}
                  placeholder="—"
                  options={SOURCE_OPTIONS}
                />
              </Field>

              <DealContactSection
                values={{
                  contactName: form.contactName ?? null,
                  contactPhone: form.contactPhone ?? null,
                  contactEmail: form.contactEmail ?? null,
                  contactTelegram: form.contactTelegram ?? null,
                }}
                onChange={(k, v) => set(k as any, v)}
              />

              <div className="border-t border-border pt-5">
                <div className="text-[11px] text-text-dim uppercase tracking-wider mb-3 font-semibold">
                  Финансы
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Бюджет клиента (₽)">
                    <Input
                      type="number"
                      value={form.budgetClient ?? ''}
                      onChange={(e) => set('budgetClient', e.target.value ? Number(e.target.value) : null)}
                    />
                  </Field>
                  <Field label="Бюджет исполнителя (₽)">
                    <Input
                      type="number"
                      value={form.budgetContractor ?? ''}
                      onChange={(e) => set('budgetContractor', e.target.value ? Number(e.target.value) : null)}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-bg-elevated border border-border rounded p-2.5">
                    <div className="text-[11px] text-text-muted mb-0.5">Прибыль</div>
                    <div className="text-[14px] font-semibold text-success">
                      {formatMoney(profit || null)}
                    </div>
                  </div>
                  <div className="bg-bg-elevated border border-border rounded p-2.5">
                    <div className="text-[11px] text-text-muted mb-0.5">Менеджеру (10%)</div>
                    <div className="text-[14px] font-semibold text-accent">
                      {formatMoney(managerProfit || null)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <div className="text-[11px] text-text-dim uppercase tracking-wider mb-3 font-semibold">
                  Время
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={dateLabel}>
                    <Input
                      type="date"
                      value={form.orderDate ? String(form.orderDate).slice(0, 10) : ''}
                      onChange={(e) =>
                        set(
                          'orderDate',
                          e.target.value ? new Date(e.target.value).toISOString() : null
                        )
                      }
                    />
                  </Field>
                  <Field label="Время">
                    <Input
                      value={form.reminderTime || ''}
                      onChange={(e) => set('reminderTime', e.target.value)}
                      placeholder="14:00"
                    />
                  </Field>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <div className="text-[11px] text-text-dim uppercase tracking-wider mb-3 font-semibold">
                  Исполнитель
                </div>
                <Field label="Имя">
                  <Input
                    value={form.contractorName || ''}
                    onChange={(e) => set('contractorName', e.target.value)}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Field label="Телефон">
                    <Input
                      value={form.contractorPhone || ''}
                      onChange={(e) => set('contractorPhone', e.target.value)}
                      placeholder="+7..."
                    />
                  </Field>
                  <Field label="Telegram">
                    <Input
                      value={form.contractorTgHandle || ''}
                      onChange={(e) => set('contractorTgHandle', e.target.value)}
                      placeholder="@username"
                    />
                  </Field>
                </div>
              </div>

              <DealFilesSection dealId={deal.id} />

              <div className="border-t border-border pt-5">
                <Field label="Заметки">
                  <Textarea
                    rows={4}
                    value={form.notes || ''}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="Внутренние заметки…"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Чат-пейн */}
          <div
            className={`md:w-[320px] md:shrink-0 ${
              mobileTab === 'chat' ? 'flex-1' : 'hidden md:block'
            }`}
          >
            <DealChatPane dealId={deal.id} />
          </div>
        </div>

        <footer className="border-t border-border p-3 shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={remove}
              className="inline-flex items-center gap-1.5 px-2.5 h-7 text-[12px] text-text-muted hover:text-danger transition-colors"
            >
              <Trash2 size={13} /> Удалить
            </button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>Отмена</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? 'Сохранение…' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
