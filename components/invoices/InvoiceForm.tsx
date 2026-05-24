'use client'

import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SlidePanel } from '@/components/ui/SlidePanel'
import { Loader2, Search, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'

interface InvoiceFormProps {
  open: boolean
  onClose: () => void
  onCreated: (info: { tochkaSent: boolean; number: number }) => void
}

interface Counterparty {
  inn: string
  kpp?: string
  name: string
  address?: string
  source: 'auto' | 'manual'
}

export function InvoiceForm({ open, onClose, onCreated }: InvoiceFormProps) {
  const [number, setNumber] = useState<number | ''>('')
  const [numberSource, setNumberSource] = useState<'tochka' | 'local' | null>(null)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  const [inn, setInn] = useState('')
  const [counterparty, setCounterparty] = useState<Counterparty | null>(null)
  const [innLoading, setInnLoading] = useState(false)
  const [innNotice, setInnNotice] = useState('')
  const [manualEditing, setManualEditing] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualKpp, setManualKpp] = useState('')
  const [manualAddress, setManualAddress] = useState('')

  const [serviceName, setServiceName] = useState('Услуги по уборке территории')
  const [unit, setUnit] = useState('Услуга')
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState<number | ''>('')
  const [vat, setVat] = useState<'none' | 'vat20'>('none')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch('/api/invoices/next-number')
      .then((r) => r.json())
      .then((d) => {
        setNumber(d.next)
        setNumberSource(d.source)
      })
      .catch(() => {
        setNumber(1)
        setNumberSource(null)
      })
  }, [open])

  function resetCounterparty() {
    setCounterparty(null)
    setManualEditing(false)
    setManualName('')
    setManualKpp('')
    setManualAddress('')
    setInnNotice('')
  }

  async function lookupInn() {
    const cleaned = inn.replace(/\D/g, '')
    if (cleaned.length !== 10 && cleaned.length !== 12) {
      setInnNotice('ИНН должен содержать 10 или 12 цифр')
      return
    }
    setInnLoading(true)
    setInnNotice('')
    setCounterparty(null)
    try {
      const res = await fetch(`/api/counterparties/${cleaned}`)
      if (!res.ok) {
        setInnNotice('Не найдено автоматически — введи данные вручную')
        setManualEditing(true)
        return
      }
      const data = await res.json()
      setCounterparty({
        inn: data.inn,
        kpp: data.kpp,
        name: data.name,
        address: data.address,
        source: 'auto',
      })
    } catch {
      setInnNotice('Ошибка поиска — введи данные вручную')
      setManualEditing(true)
    } finally {
      setInnLoading(false)
    }
  }

  function confirmManual() {
    const cleaned = inn.replace(/\D/g, '')
    if (!manualName.trim() || !cleaned) {
      setInnNotice('Заполни ИНН и название')
      return
    }
    setCounterparty({
      inn: cleaned,
      kpp: manualKpp || undefined,
      name: manualName.trim(),
      address: manualAddress || undefined,
      source: 'manual',
    })
    setManualEditing(false)
  }

  async function submit() {
    if (!counterparty || !price || !number) return
    setSaving(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number,
          date,
          counterpartyInn: counterparty.inn,
          counterpartyName: counterparty.name,
          counterpartyKpp: counterparty.kpp,
          counterpartyAddress: counterparty.address,
          serviceName,
          unit,
          quantity,
          price: Number(price),
          withVat: vat === 'vat20',
        }),
      })
      if (res.ok) {
        const created = await res.json()
        onCreated({ tochkaSent: !!created.tochkaSent, number: created.number })
        onClose()
        resetAll()
      }
    } finally {
      setSaving(false)
    }
  }

  function resetAll() {
    setInn('')
    resetCounterparty()
    setPrice('')
    setQuantity(1)
    setVat('none')
  }

  const total = Number(price) * quantity || 0

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title="Новый счёт"
      width={520}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button onClick={submit} disabled={saving || !counterparty || !price}>
            {saving ? 'Сохранение…' : 'Создать счёт'}
          </Button>
        </div>
      }
    >
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Номер счёта"
            hint={
              numberSource === 'tochka'
                ? 'из документооборота Точки'
                : numberSource === 'local'
                ? 'из локальной БД (Точка недоступна)'
                : undefined
            }
          >
            <Input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value ? Number(e.target.value) : '')}
            />
          </Field>
          <Field label="Дата">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>

        <div className="border-t border-border pt-5">
          <div className="text-[11px] text-text-dim uppercase tracking-wider mb-3 font-semibold">
            Контрагент
          </div>
          <Field label="ИНН" hint={innNotice || 'Введи ИНН и нажми поиск'}>
            <div className="flex gap-2">
              <Input
                value={inn}
                onChange={(e) => {
                  setInn(e.target.value)
                  resetCounterparty()
                }}
                onKeyDown={(e) => e.key === 'Enter' && lookupInn()}
                placeholder="10 или 12 цифр"
              />
              <Button variant="secondary" onClick={lookupInn} disabled={innLoading} type="button">
                {innLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              </Button>
            </div>
          </Field>

          {counterparty && (
            <div className="mt-3 bg-bg-elevated border border-border rounded p-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13px] text-text font-medium leading-snug">{counterparty.name}</div>
                <button
                  onClick={() => {
                    setManualName(counterparty.name)
                    setManualKpp(counterparty.kpp || '')
                    setManualAddress(counterparty.address || '')
                    setManualEditing(true)
                    setCounterparty(null)
                  }}
                  className="text-text-muted hover:text-text shrink-0"
                  title="Редактировать"
                >
                  <Pencil size={12} />
                </button>
              </div>
              <div className="text-[11.5px] text-text-muted">ИНН: {counterparty.inn}</div>
              {counterparty.kpp && (
                <div className="text-[11.5px] text-text-muted">КПП: {counterparty.kpp}</div>
              )}
              {counterparty.address && (
                <div className="text-[11.5px] text-text-muted">{counterparty.address}</div>
              )}
              {counterparty.source === 'manual' && (
                <div className="text-[10.5px] text-warning mt-1">введено вручную</div>
              )}
            </div>
          )}

          {manualEditing && (
            <div className="mt-3 bg-bg-elevated border border-warning/30 rounded p-3 space-y-2">
              <Field label="Наименование">
                <Input
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder='ООО "..."'
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="КПП (опционально)">
                  <Input value={manualKpp} onChange={(e) => setManualKpp(e.target.value)} />
                </Field>
                <Field label="Адрес (опционально)">
                  <Input value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} />
                </Field>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={() => setManualEditing(false)}>
                  Отмена
                </Button>
                <Button size="sm" onClick={confirmManual}>Подтвердить</Button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-5">
          <div className="text-[11px] text-text-dim uppercase tracking-wider mb-3 font-semibold">
            Услуга
          </div>
          <Field label="Название">
            <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <Field label="Единица">
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
            </Field>
            <Field label="Кол-во">
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              />
            </Field>
            <Field label="Цена (₽)">
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
              />
            </Field>
          </div>
          <Field label="НДС" className="mt-3">
            <Select
              value={vat}
              onChange={(e) => setVat(e.target.value as any)}
              options={[
                { value: 'none', label: 'Без НДС' },
                { value: 'vat20', label: 'НДС 20%' },
              ]}
            />
          </Field>
        </div>

        <div className="border-t border-border pt-5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-text-muted">Итого</span>
            <span className="text-[18px] font-semibold text-text">
              {new Intl.NumberFormat('ru-RU').format(total)} ₽
            </span>
          </div>
        </div>
      </div>
    </SlidePanel>
  )
}
