'use client'

import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SlidePanel } from '@/components/ui/SlidePanel'
import { Loader2, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

interface InvoiceFormProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

interface Counterparty {
  inn: string
  kpp?: string
  name: string
  shortName?: string
  address?: string
}

export function InvoiceForm({ open, onClose, onCreated }: InvoiceFormProps) {
  const [number, setNumber] = useState<number | ''>('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [inn, setInn] = useState('')
  const [counterparty, setCounterparty] = useState<Counterparty | null>(null)
  const [innLoading, setInnLoading] = useState(false)
  const [innError, setInnError] = useState('')
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
      .then((d) => setNumber(d.next))
      .catch(() => setNumber(1))
  }, [open])

  async function lookupInn() {
    const cleaned = inn.replace(/\D/g, '')
    if (cleaned.length !== 10 && cleaned.length !== 12) {
      setInnError('ИНН должен содержать 10 или 12 цифр')
      return
    }
    setInnLoading(true)
    setInnError('')
    setCounterparty(null)
    try {
      const res = await fetch(`/api/counterparties/${cleaned}`)
      if (!res.ok) {
        setInnError('Контрагент не найден')
        return
      }
      const data = await res.json()
      setCounterparty(data)
    } catch {
      setInnError('Ошибка при поиске')
    } finally {
      setInnLoading(false)
    }
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
        onCreated()
        onClose()
        resetForm()
      }
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setInn('')
    setCounterparty(null)
    setInnError('')
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
          <Field label="Номер счёта">
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
          <Field label="ИНН" hint={innError || 'Введи ИНН и нажми кнопку поиска'}>
            <div className="flex gap-2">
              <Input
                value={inn}
                onChange={(e) => setInn(e.target.value)}
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
              <div className="text-[13px] text-text font-medium">{counterparty.name}</div>
              {counterparty.kpp && (
                <div className="text-[11.5px] text-text-muted">КПП: {counterparty.kpp}</div>
              )}
              {counterparty.address && (
                <div className="text-[11.5px] text-text-muted">{counterparty.address}</div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border pt-5">
          <div className="text-[11px] text-text-dim uppercase tracking-wider mb-3 font-semibold">
            Услуга
          </div>
          <Field label="Название услуги">
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
