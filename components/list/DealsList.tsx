'use client'

import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { MobileMenuButton } from '@/components/layout/MobileMenuButton'
import { DealDetailPanel } from '@/components/deals/DealDetailPanel'
import { autoDealTitle } from '@/lib/dealTitle'
import { formatMoney } from '@/lib/money'
import { ALL_STAGES, Deal, SOURCE_OPTIONS } from '@/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowDown, ArrowUp, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

function fmtMoney(n?: number | null) {
  return formatMoney(n)
}

type SortKey = 'orderDate' | 'createdAt' | 'updatedAt' | 'completedAt' | 'budget' | 'stage'

const SORT_PRESETS: { value: SortKey; label: string; defaultAsc: boolean }[] = [
  { value: 'createdAt',   label: 'Дата создания',  defaultAsc: false },
  { value: 'updatedAt',   label: 'Последнее изменение', defaultAsc: false },
  { value: 'orderDate',   label: 'Дата заказа',    defaultAsc: false },
  { value: 'completedAt', label: 'Дата закрытия',  defaultAsc: false },
  { value: 'budget',      label: 'Бюджет',         defaultAsc: false },
  { value: 'stage',       label: 'Стадия',         defaultAsc: true },
]

export function DealsList() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('ALL')
  const [sourceFilter, setSourceFilter] = useState<string>('ALL')
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortAsc, setSortAsc] = useState(false)

  function reload() {
    setLoading(true)
    fetch('/api/deals')
      .then((r) => r.json())
      .then((d) => setDeals(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload()
  }, [])

  function getSortValue(d: Deal, key: SortKey): number | string {
    switch (key) {
      case 'createdAt':   return new Date(d.createdAt).getTime()
      case 'updatedAt':   return new Date(d.updatedAt).getTime()
      case 'orderDate':   return d.orderDate ? new Date(d.orderDate).getTime() : 0
      case 'completedAt': return d.completedAt ? new Date(d.completedAt).getTime() : 0
      case 'budget':      return d.budgetClient || 0
      case 'stage':       return d.stage as string
    }
  }

  const filtered = useMemo(() => {
    let list = [...deals]
    if (stageFilter !== 'ALL') list = list.filter((d) => d.stage === stageFilter)
    if (sourceFilter !== 'ALL') list = list.filter((d) => d.source === sourceFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (d) =>
          autoDealTitle(d).toLowerCase().includes(q) ||
          (d.contactName || '').toLowerCase().includes(q) ||
          (d.contactPhone || '').toLowerCase().includes(q) ||
          (d.address || '').toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      const av = getSortValue(a, sortKey)
      const bv = getSortValue(b, sortKey)
      let cmp = 0
      if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
      else cmp = String(av).localeCompare(String(bv))
      return sortAsc ? cmp : -cmp
    })
    return list
  }, [deals, stageFilter, sourceFilter, search, sortKey, sortAsc])

  function setSort(key: SortKey, ascByDefault = false) {
    if (sortKey === key) setSortAsc((v) => !v)
    else {
      setSortKey(key)
      setSortAsc(ascByDefault)
    }
  }

  function stageTone(stageId: string): 'muted' | 'accent' | 'warning' | 'success' | 'danger' | 'default' {
    if (stageId === 'COMPLETED') return 'success'
    if (stageId === 'REFUSED') return 'danger'
    if (stageId === 'NEW') return 'muted'
    if (stageId === 'AWAITING_DECISION') return 'warning'
    return 'accent'
  }

  return (
    <div className="h-full flex flex-col">
      <header className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          <MobileMenuButton />
          <h1 className="text-[13px] font-semibold text-text">Все сделки</h1>
        </div>
        <div className="text-[12px] text-text-muted">{filtered.length} из {deals.length}</div>
      </header>

      <div className="border-b border-border p-3 shrink-0 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-md">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию, контакту, адресу..."
            className="pl-8"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="appearance-none bg-bg-elevated border border-border rounded px-3 h-8 text-[12px] text-text"
        >
          <option value="ALL">Все стадии</option>
          {ALL_STAGES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="appearance-none bg-bg-elevated border border-border rounded px-3 h-8 text-[12px] text-text"
        >
          <option value="ALL">Все источники</option>
          {SOURCE_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[11px] text-text-muted">Сортировка:</span>
          <select
            value={sortKey}
            onChange={(e) => setSort(e.target.value as SortKey, SORT_PRESETS.find((p) => p.value === e.target.value)?.defaultAsc || false)}
            className="appearance-none bg-bg-elevated border border-border rounded px-2 h-8 text-[12px] text-text"
          >
            {SORT_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <button
            onClick={() => setSortAsc((v) => !v)}
            className="w-8 h-8 inline-flex items-center justify-center rounded border border-border text-text-muted hover:text-text hover:bg-bg-elevated"
            title={sortAsc ? 'По возрастанию' : 'По убыванию'}
          >
            {sortAsc ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-text-muted text-sm">Загрузка…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">Сделок не найдено</div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-bg z-10">
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-text-dim">
                <th className="text-left px-4 py-2.5 font-medium">Название</th>
                <th className="text-left px-4 py-2.5 font-medium">Стадия</th>
                <th className="text-right px-4 py-2.5 font-medium">Бюджет</th>
                <th className="text-left px-4 py-2.5 font-medium">Дата заказа</th>
                <th className="text-left px-4 py-2.5 font-medium">Дата закрытия</th>
                <th className="text-left px-4 py-2.5 font-medium">Источник</th>
                <th className="text-left px-4 py-2.5 font-medium">Контакт</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const stage = ALL_STAGES.find((s) => s.id === d.stage)
                const source = SOURCE_OPTIONS.find((s) => s.value === d.source)
                return (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDeal(d)}
                    className="border-b border-border hover:bg-bg-elevated cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5 text-[12.5px] text-text">{autoDealTitle(d)}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={stageTone(d.stage)}>{stage?.short || d.stage}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] text-text text-right font-medium">
                      {fmtMoney(d.budgetClient)}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-text-muted">
                      {d.orderDate ? format(new Date(d.orderDate), 'd MMM yyyy', { locale: ru }) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-text-muted">
                      {d.completedAt ? format(new Date(d.completedAt), 'd MMM yyyy', { locale: ru }) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-text-muted">
                      {source?.label || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-text-muted">
                      {d.contactName || d.contactPhone || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <DealDetailPanel
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onUpdate={(u) => {
          setDeals((prev) => prev.map((d) => (d.id === u.id ? u : d)))
          setSelectedDeal(u)
        }}
        onDelete={async (id) => {
          setDeals((prev) => prev.filter((d) => d.id !== id))
          setSelectedDeal(null)
          await fetch(`/api/deals/${id}`, { method: 'DELETE' })
        }}
      />
    </div>
  )
}
