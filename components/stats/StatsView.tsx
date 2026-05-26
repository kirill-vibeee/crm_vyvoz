'use client'

import { MobileMenuButton } from '@/components/layout/MobileMenuButton'
import { formatMoney } from '@/lib/money'
import { SOURCE_OPTIONS } from '@/types'
import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface StatsData {
  totals: {
    revenue: number
    contractorPayouts: number
    profit: number
    managerProfit: number
    dealsTotal: number
    dealsCompleted: number
    conversion: number
  }
  bySource: { source: string; count: number; revenue: number }[]
  byMonth: { month: string; revenue: number; profit: number }[]
}

const PIE_COLORS = ['#5E6AD2', '#4CB782', '#F2C94C', '#BB6BD9', '#56CCF2']

function fmtMoney(n: number): string {
  return formatMoney(n)
}

const PERIODS = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'year', label: 'Год' },
  { value: 'all', label: 'Всё время' },
]

function rangeFor(period: string): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString()
  const from = new Date(now)
  switch (period) {
    case 'week':    from.setDate(now.getDate() - 7); break
    case 'month':   from.setMonth(now.getMonth() - 1); break
    case 'quarter': from.setMonth(now.getMonth() - 3); break
    case 'year':    from.setFullYear(now.getFullYear() - 1); break
    default:        from.setFullYear(2000); break
  }
  return { from: from.toISOString(), to }
}

export function StatsView() {
  const [period, setPeriod] = useState('month')
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { from, to } = rangeFor(period)
    setLoading(true)
    fetch(`/api/stats?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [period])

  const sourceChartData = useMemo(
    () =>
      (data?.bySource || []).map((s) => ({
        name: SOURCE_OPTIONS.find((o) => o.value === s.source)?.label || s.source,
        value: s.revenue,
        count: s.count,
      })),
    [data]
  )

  return (
    <div className="h-full flex flex-col">
      <header className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          <MobileMenuButton />
          <h1 className="text-[13px] font-semibold text-text">Статистика</h1>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-2.5 h-7 rounded text-[11.5px] transition-colors ${
                period === p.value
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:bg-surface-hover hover:text-text'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-text-muted text-sm">Загрузка…</div>
        ) : !data ? (
          <div className="text-text-muted text-sm">Не удалось загрузить</div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Выручка" value={fmtMoney(data.totals.revenue)} tone="default" />
              <StatCard label="Выплаты исп." value={fmtMoney(data.totals.contractorPayouts)} tone="muted" />
              <StatCard label="Прибыль" value={fmtMoney(data.totals.profit)} tone="success" />
              <StatCard label="Менеджеру (10%)" value={fmtMoney(data.totals.managerProfit)} tone="accent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatCard
                label="Закрыто сделок"
                value={String(data.totals.dealsCompleted)}
                hint={`из ${data.totals.dealsTotal} всего`}
              />
              <StatCard
                label="Конверсия"
                value={`${data.totals.conversion}%`}
                tone="accent"
              />
              <StatCard
                label="Средний чек"
                value={fmtMoney(
                  data.totals.dealsCompleted > 0
                    ? Math.round(data.totals.revenue / data.totals.dealsCompleted)
                    : 0
                )}
              />
            </div>

            {/* Revenue chart */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="text-[11px] text-text-dim uppercase tracking-wider mb-3 font-semibold">
                Выручка и прибыль по месяцам
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={data.byMonth} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#23262D" />
                    <XAxis dataKey="month" stroke="#8A8F98" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#8A8F98" tick={{ fontSize: 11 }} tickFormatter={(v) => fmtMoney(v)} />
                    <Tooltip
                      contentStyle={{
                        background: '#101113',
                        border: '1px solid #23262D',
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                      formatter={(v: any) => fmtMoney(Number(v))}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="revenue" stroke="#5E6AD2" strokeWidth={2} name="Выручка" />
                    <Line type="monotone" dataKey="profit" stroke="#4CB782" strokeWidth={2} name="Прибыль" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie by source */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="text-[11px] text-text-dim uppercase tracking-wider mb-3 font-semibold">
                Выручка по источникам
              </div>
              {sourceChartData.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-[12px] text-text-dim">
                  Нет данных
                </div>
              ) : (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={sourceChartData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        label={({ name }) => name}
                      >
                        {sourceChartData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#101113',
                          border: '1px solid #23262D',
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                        formatter={(v: any) => fmtMoney(Number(v))}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: string
  hint?: string
  tone?: 'default' | 'muted' | 'success' | 'accent'
}) {
  const toneClass = {
    default: 'text-text',
    muted: 'text-text-muted',
    success: 'text-success',
    accent: 'text-accent',
  }[tone]
  return (
    <div className="bg-surface border border-border rounded-lg p-3">
      <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1.5 font-semibold">
        {label}
      </div>
      <div className={`text-[18px] font-semibold ${toneClass}`}>{value}</div>
      {hint && <div className="text-[10.5px] text-text-dim mt-0.5">{hint}</div>}
    </div>
  )
}
