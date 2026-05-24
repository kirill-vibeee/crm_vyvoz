'use client'

import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SlidePanel } from '@/components/ui/SlidePanel'
import { Loader2, Search, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ExistingInvoice {
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
}

interface InvoiceFormProps {
  open: boolean
  onClose: () => void
  onCreated: (info: { tochkaSent: boolean; number: number }) => void
  initial?: ExistingInvoice | null
}

interface Counterparty {
  inn: string
  kpp?: string
  name: string
  address?: string
  type: 'LEGAL' | 'INDIVIDUAL'
  source: 'auto' | 'manual'
}

const UNIT_OPTIONS = [
  { value: 'услуга.', label: 'Услуга' },
  { value: 'шт.', label: 'Штука' },
  { value: 'упак.', label: 'Упаковка' },
  { value: 'компл.', label: 'Комплект' },
  { value: 'кг.', label: 'Килограмм' },
  { value: 'м3.', label: 'Кубометр' },
  { value: 'ч.', label: 'Час' },
  { value: 'сут.', label: 'Сутки' },
]

const VAT_OPTIONS = [
  { value: 'none', label: 'Без НДС' },
  { value: 'nds_22', label: 'НДС 22%' },
  { value: 'nds_10', label: 'НДС 10%' },
  { value: 'nds_7', label: 'НДС 7%' },
  { value: 'nds_5', label: 'НДС 5%' },
  { value: 'nds_0', label: 'НДС 0%' },
]

export function InvoiceForm({ open, onClose, onCreated, initial }: InvoiceFormProps) {
  const isEdit = !!initial
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
  const [unit, setUnit] = useState('услуга.')
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState<number | ''>('')
  const [vat, setVat] = useState<'none' | 'nds_22' | 'nds_10' | 'nds_7' | 'nds_5' | 'nds_0'>('none')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      // edit mode
      setNumber(initial.number)
      setDate(initial.date.slice(0, 10))
      setInn(initial.counterpartyInn)
      setCounterparty({
        inn: initial.counterpartyInn,
        kpp: initial.counterpartyKpp || undefined,
        name: initial.counterpartyName,
        address: initial.counterpartyAddress || undefined,
        type: initial.counterpartyInn.length === 12 ? 'INDIVIDUAL' : 'LEGAL',
        source: 'manual',
      })
      setServiceName(initial.serviceName)
      setUnit(initial.unit)
      setQuantity(initial.quantity)
      setPrice(initial.price)
      setVat(initial.withVat ? 'nds_22' : 'none')
      return
    }
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
  }, [open, initial])

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
        type: data.type === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'LEGAL',
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
    // ИП = ИНН 12 цифр, ООО = 10 цифр
    const type: 'LEGAL' | 'INDIVIDUAL' = cleaned.length === 12 ? 'INDIVIDUAL' : 'LEGAL'
    setCounterparty({
      inn: cleaned,
      kpp: manualKpp || undefined,
      name: manualName.trim(),
      address: manualAddress || undefined,
      type,
      source: 'manual',
    })
    setManualEditing(false)
  }

  async function submit() {
    if (!counterparty || !price || !number) return
    setSaving(true)
    try {
      const url = isEdit ? `/api/invoices/${initial!.id}` : '/api/invoices'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number,
          date,
          counterpartyInn: counterparty.inn,
          counterpartyName: counterparty.name,
          counterpartyKpp: counterparty.kpp,
          counterpartyAddress: counterparty.address,
          counterpartyType: counterparty.type,
          serviceName,
          unit,
          quantity,
          price: Number(price),
          vat,
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
      title={isEdit ? `Счёт №${initial!.number}` : 'Новый счёт'}
      width={520}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button onClick={submit} disabled={saving || !counterparty || !price}>
            {saving ? 'Сохранение…' : isEdit ? 'Обновить счёт' : 'Создать счёт'}
          </Button>
        </div>
      }
    >
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Номер счёта" hint="следующий по порядку, можно изменить">
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
              <Select value={unit} onChange={(e) => setUnit(e.target.value)} options={UNIT_OPTIONS} />
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
            <Select value={vat} onChange={(e) => setVat(e.target.value as any)} options={VAT_OPTIONS} />
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
