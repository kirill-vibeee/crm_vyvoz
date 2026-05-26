'use client'

import { Button } from '@/components/ui/Button'
import { MobileMenuButton } from '@/components/layout/MobileMenuButton'
import { CheckCircle2, Download, Loader2, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DealsHeaderProps {
  onSyncDone: () => void
}

export function DealsHeader({ onSyncDone }: DealsHeaderProps) {
  const [amoOk, setAmoOk] = useState<boolean | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<{ text: string; tone: 'success' | 'warning' } | null>(null)

  useEffect(() => {
    fetch('/api/integrations/status')
      .then((r) => r.json())
      .then((d) => setAmoOk(d?.amo?.ok ?? false))
      .catch(() => setAmoOk(false))
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  async function sync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/integrations/amo/sync', { method: 'POST' })
      const data = await res.json()
      if (data.error) {
        setToast({ text: data.error, tone: 'warning' })
      } else {
        setToast({
          text: `Импортировано: ${data.imported} · Обновлено: ${data.updated} · Всего в Amo: ${data.total}`,
          tone: 'success',
        })
        onSyncDone()
      }
    } catch {
      setToast({ text: 'Ошибка синхронизации', tone: 'warning' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <>
      <header className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          <MobileMenuButton />
          <h1 className="text-[13px] font-semibold text-text">Сделки</h1>
        </div>
        <div className="flex items-center gap-2">
          {amoOk === true ? (
            <Button size="sm" variant="secondary" onClick={sync} disabled={syncing}>
              {syncing ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {syncing ? 'Синхронизация...' : 'Импорт из Amo'}
            </Button>
          ) : amoOk === false ? (
            <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded text-[11.5px] text-text-dim border border-border">
              Amo не подключён
            </span>
          ) : null}
        </div>
      </header>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 max-w-md rounded border px-4 py-3 text-[13px] shadow-lg z-50 ${
            toast.tone === 'success'
              ? 'bg-success/10 border-success/40 text-success'
              : 'bg-warning/10 border-warning/40 text-warning'
          }`}
        >
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            <div>{toast.text}</div>
          </div>
        </div>
      )}
    </>
  )
}
