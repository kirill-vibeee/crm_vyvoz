'use client'

import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SlidePanel } from '@/components/ui/SlidePanel'
import { ALL_STAGES, Deal, SOURCE_OPTIONS, STATUS_OPTIONS } from '@/types'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

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

export function DealDetailPanel({ deal, onClose, onUpdate, onDelete }: DealDetailPanelProps) {
  const [form, setForm] = useState<Partial<Deal>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (deal) setForm(deal)
  }, [deal])

  if (!deal) return null

  function set<K extends keyof Deal>(key: K, value: Deal[K] | string | null) {
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
          title: form.title,
          stage: form.stage,
          status: form.status || null,
          source: form.source || null,
          budgetClient: form.budgetClient ? Number(form.budgetClient) : null,
          budgetContractor: form.budgetContractor ? Number(form.budgetContractor) : null,
          address: form.address || null,
          city: form.city || 'SPB',
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
    if (!confirm('Удалить сделку?')) return
    if (deal) await onDelete(deal.id)
  }

  const budgetClient = Number(form.budgetClient) || 0
  const budgetContractor = Number(form.budgetContractor) || 0
  const profit = budgetClient && budgetContractor ? budgetClient - budgetContractor : 0
  const managerProfit = profit * 0.1

  return (
    <SlidePanel
      open={!!deal}
      onClose={onClose}
      title="Сделка"
      width={520}
      footer={
        <div className="flex items-center justify-between">
          <button
            onClick={remove}
            className="inline-flex items-center gap-1.5 px-2.5 h-7 text-[12px] text-text-muted hover:text-danger transition-colors"
          >
            <Trash2 size={13} /> Удалить
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Отмена</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить'}</Button>
          </div>
        </div>
      }
    >
      <div className="p-5 space-y-5">
        <Field label="Заголовок">
          <Input value={form.title || ''} onChange={(e) => set('title', e.target.value)} />
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
              onChange={(e) => set('status', (e.target.value || null) as any)}
              placeholder="—"
              options={STATUS_OPTIONS}
            />
          </Field>
        </div>

        <Field label="Источник">
          <Select
            value={form.source || ''}
            onChange={(e) => set('source', (e.target.value || null) as any)}
            placeholder="—"
            options={SOURCE_OPTIONS}
          />
        </Field>

        <div className="border-t border-border pt-5">
          <div className="text-[11px] text-text-dim uppercase tracking-wider mb-3 font-semibold">
            Финансы
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Бюджет клиента (₽)">
              <Input
                type="number"
                value={form.budgetClient ?? ''}
                onChange={(e) => set('budgetClient', e.target.value ? (Number(e.target.value) as any) : null)}
              />
            </Field>
            <Field label="Бюджет исполнителя (₽)">
              <Input
                type="number"
                value={form.budgetContractor ?? ''}
                onChange={(e) => set('budgetContractor', e.target.value ? (Number(e.target.value) as any) : null)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-bg-elevated border border-border rounded p-2.5">
              <div className="text-[11px] text-text-muted mb-0.5">Прибыль</div>
              <div className="text-[14px] font-semibold text-success">{formatMoney(profit || null)}</div>
            </div>
            <div className="bg-bg-elevated border border-border rounded p-2.5">
              <div className="text-[11px] text-text-muted mb-0.5">Менеджеру (10%)</div>
              <div className="text-[14px] font-semibold text-accent">{formatMoney(managerProfit || null)}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <div className="text-[11px] text-text-dim uppercase tracking-wider mb-3 font-semibold">
            Адрес и время
          </div>
          <Field label="Адрес">
            <Input
              value={form.address || ''}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Улица, дом, кв."
            />
          </Field>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Город">
              <Select
                value={form.city || 'SPB'}
                onChange={(e) => set('city', e.target.value)}
                options={[
                  { value: 'SPB', label: 'Санкт-Петербург' },
                  { value: 'MSK', label: 'Москва' },
                ]}
              />
            </Field>
            <Field label="Время напоминания">
              <Input
                value={form.reminderTime || ''}
                onChange={(e) => set('reminderTime', e.target.value)}
                placeholder="14:00"
              />
            </Field>
          </div>
          <Field label="Дата заказа" className="mt-3">
            <Input
              type="date"
              value={form.orderDate ? String(form.orderDate).slice(0, 10) : ''}
              onChange={(e) => set('orderDate', (e.target.value ? new Date(e.target.value).toISOString() : null) as any)}
            />
          </Field>
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

        <div className="border-t border-border pt-5">
          <Field label="Заметки">
            <Textarea
              rows={5}
              value={form.notes || ''}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Внутренние заметки по сделке…"
            />
          </Field>
        </div>
      </div>
    </SlidePanel>
  )
}
