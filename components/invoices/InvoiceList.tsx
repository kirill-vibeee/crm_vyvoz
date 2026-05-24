'use client'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, FileText, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { InvoiceForm } from './InvoiceForm'

interface Invoice {
  id: string
  number: number
  date: string
  counterpartyName: string
  total: number
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED'
  pdfUrl?: string | null
}

const STATUS_LABEL: Record<Invoice['status'], { label: string; tone: 'muted' | 'accent' | 'success' | 'danger' }> = {
  DRAFT: { label: 'Черновик', tone: 'muted' },
  SENT: { label: 'Отправлен', tone: 'accent' },
  PAID: { label: 'Оплачен', tone: 'success' },
  CANCELLED: { label: 'Отменён', tone: 'danger' },
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽'
}

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [toast, setToast] = useState<{ text: string; tone: 'success' | 'warning' } | null>(null)

  function reload() {
    setLoading(true)
    fetch('/api/invoices')
      .then((r) => r.json())
      .then((d) => setInvoices(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload()
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
        ? { text: `Счёт №${info.number} создан и отправлен в Точка-банк`, tone: 'success' }
        : {
            text: `Счёт №${info.number} сохранён локально (Точка недоступна — проверь TOCHKA_JWT_TOKEN)`,
            tone: 'warning',
          }
    )
  }

  return (
    <div className="h-full flex flex-col">
      <header className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
        <h1 className="text-[13px] font-semibold text-text">Счета</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={14} strokeWidth={2.2} />
          Новый счёт
        </Button>
      </header>

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
                  <th className="text-right px-4 py-2.5 font-medium w-12"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const status = STATUS_LABEL[inv.status]
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
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {inv.pdfUrl && (
                          <a
                            href={inv.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-text-muted hover:text-accent"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InvoiceForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={handleCreated}
      />

      {toast && (
        <div
          className={`fixed bottom-4 right-4 max-w-md rounded border px-4 py-3 text-[13px] shadow-lg animate-[fadeIn_120ms] ${
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
