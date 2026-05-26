'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MobileMenuButton } from '@/components/layout/MobileMenuButton'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { formatMoney } from '@/lib/money'
import { AlertCircle, CheckCircle2, Download, FileText, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { InvoiceForm } from './InvoiceForm'

interface Invoice {
  id: string
  number: number
  date: string
  counterpartyInn: string
  counterpartyName: string
  counterpartyKpp?: string | null
  counterpartyAddress?: string | null
  serviceName: string
  unit: string
  quantity: number
  price: number
  withVat: boolean
  total: number
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED'
  tochkaId?: string | null
}

interface IntegrationStatus {
  tochka: { ok: boolean; hasToken: boolean; customerCode: string | null; accountId: string | null; error: string | null }
  dadata: { ok: boolean; hasOwnKey: boolean; error: string | null }
}

const STATUS_LABEL: Record<Invoice['status'], { label: string; tone: 'muted' | 'accent' | 'success' | 'danger' }> = {
  DRAFT: { label: 'Черновик', tone: 'muted' },
  SENT: { label: 'Отправлен', tone: 'accent' },
  PAID: { label: 'Оплачен', tone: 'success' },
  CANCELLED: { label: 'Отменён', tone: 'danger' },
}

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [statusOpen, setStatusOpen] = useState(false)
  const [toast, setToast] = useState<{ text: string; tone: 'success' | 'warning' } | null>(null)

  function reload() {
    setLoading(true)
    fetch('/api/invoices')
      .then((r) => r.json())
      .then((d) => setInvoices(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }

  function reloadStatus() {
    fetch('/api/integrations/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null))
  }

  useEffect(() => {
    reload()
    reloadStatus()
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4500)
    return () => clearTimeout(t)
  }, [toast])

  function handleCreated(info: { tochkaSent: boolean; number: number }) {
    reload()
    setToast(
      info.tochkaSent
        ? { text: `Счёт №${info.number} ${editing ? 'обновлён' : 'создан'} и отправлен в Точка-банк`, tone: 'success' }
        : { text: `Счёт №${info.number} сохранён локально. Точка не приняла — проверь подключение`, tone: 'warning' }
    )
    setEditing(null)
  }

  async function deleteInvoice(inv: Invoice) {
    if (!confirm(`Удалить счёт №${inv.number}?${inv.tochkaId ? '\nОн также будет удалён в Точка-банке.' : ''}`)) return
    const res = await fetch(`/api/invoices/${inv.id}`, { method: 'DELETE' })
    if (res.ok) {
      setInvoices((prev) => prev.filter((x) => x.id !== inv.id))
      setToast({ text: `Счёт №${inv.number} удалён`, tone: 'success' })
    } else {
      setToast({ text: 'Не удалось удалить', tone: 'warning' })
    }
  }

  const allOk = status?.tochka.ok && status?.dadata.ok
  const anyError = status && (!status.tochka.ok || !status.dadata.ok)

  return (
    <div className="h-full flex flex-col">
      <header className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          <MobileMenuButton />
          <h1 className="text-[13px] font-semibold text-text">Счета</h1>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <button
              onClick={() => setStatusOpen((v) => !v)}
              className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded text-[12px] border transition-colors ${
                allOk
                  ? 'bg-success/10 text-success border-success/30 hover:bg-success/15'
                  : 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/15'
              }`}
            >
              {allOk ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              {allOk ? 'Интеграции активны' : 'Проблема с интеграцией'}
            </button>
          )}
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={14} strokeWidth={2.2} />
            Новый счёт
          </Button>
        </div>
      </header>

      {statusOpen && status && (
        <div className="bg-bg-elevated border-b border-border p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {status.tochka.ok ? (
                <CheckCircle2 size={16} className="text-success" />
              ) : (
                <AlertCircle size={16} className="text-warning" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-text">Точка-банк</div>
              {status.tochka.ok ? (
                <div className="text-[12px] text-text-muted mt-0.5">
                  customer_code: <span className="font-mono">{status.tochka.customerCode}</span>{' '}
                  · accountId: <span className="font-mono">{status.tochka.accountId?.slice(0, 12)}…</span>
                </div>
              ) : (
                <div className="text-[12px] text-warning mt-0.5">{status.tochka.error}</div>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {status.dadata.ok ? (
                <CheckCircle2 size={16} className="text-success" />
              ) : (
                <AlertCircle size={16} className="text-warning" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-text">DaData (поиск по ИНН)</div>
              {status.dadata.ok ? (
                <div className="text-[12px] text-text-muted mt-0.5">
                  {status.dadata.hasOwnKey ? 'используется ваш ключ' : 'используется публичный демо-ключ (rate-limit)'}
                </div>
              ) : (
                <div className="text-[12px] text-warning mt-0.5">{status.dadata.error}</div>
              )}
            </div>
          </div>
          <button
            onClick={reloadStatus}
            className="inline-flex items-center gap-1.5 text-[11.5px] text-text-muted hover:text-text"
          >
            <RefreshCw size={11} /> Проверить ещё раз
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-text-muted text-sm">Загрузка…</div>
        ) : invoices.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <FileText size={32} className="text-text-dim mb-3" strokeWidth={1.5} />
            <div className="text-text-muted text-sm mb-1">Счетов пока нет</div>
            <div className="text-text-dim text-xs mb-4">Создай первый счёт через кнопку выше</div>
            <Button onClick={() => setShowForm(true)}>
              <Plus size={14} strokeWidth={2.2} />
              Создать счёт
            </Button>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wider text-text-dim">
                  <th className="text-left px-4 py-2.5 font-medium">№</th>
                  <th className="text-left px-4 py-2.5 font-medium">Дата</th>
                  <th className="text-left px-4 py-2.5 font-medium">Контрагент</th>
                  <th className="text-right px-4 py-2.5 font-medium">Сумма</th>
                  <th className="text-left px-4 py-2.5 font-medium">Статус</th>
                  <th className="text-right px-4 py-2.5 font-medium w-20">PDF</th>
                  <th className="text-right px-4 py-2.5 font-medium w-24">Действия</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const st = STATUS_LABEL[inv.status]
                  return (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-bg-elevated transition-colors">
                      <td className="px-4 py-3 text-[13px] font-medium text-text">№{inv.number}</td>
                      <td className="px-4 py-3 text-[12.5px] text-text-muted">
                        {format(new Date(inv.date), 'd MMM yyyy', { locale: ru })}
                      </td>
                      <td className="px-4 py-3 text-[12.5px] text-text">{inv.counterpartyName}</td>
                      <td className="px-4 py-3 text-[13px] text-right text-text font-medium">
                        {formatMoney(inv.total)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {inv.tochkaId ? (
                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-text-muted hover:text-accent text-[12px]"
                          >
                            <Download size={12} /> PDF
                          </a>
                        ) : (
                          <span className="text-text-dim text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setEditing(inv)}
                            className="w-6 h-6 inline-flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-bg-elevated"
                            title="Редактировать"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => deleteInvoice(inv)}
                            className="w-6 h-6 inline-flex items-center justify-center rounded text-text-muted hover:text-danger hover:bg-danger/10"
                            title="Удалить"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {anyError && (
          <div className="mt-4 bg-warning/5 border border-warning/30 rounded p-3 text-[12px] text-warning">
            Интеграции не настроены полностью — счета сохраняются локально, но не попадут в Точка-банк.
            Нажми "Проблема с интеграцией" выше чтобы посмотреть детали.
          </div>
        )}
      </div>

      <InvoiceForm
        open={showForm || !!editing}
        onClose={() => {
          setShowForm(false)
          setEditing(null)
        }}
        onCreated={handleCreated}
        initial={editing}
      />

      {toast && (
        <div
          className={`fixed bottom-4 right-4 max-w-md rounded border px-4 py-3 text-[13px] shadow-lg ${
            toast.tone === 'success'
              ? 'bg-success/10 border-success/40 text-success'
              : 'bg-warning/10 border-warning/40 text-warning'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  )
}
