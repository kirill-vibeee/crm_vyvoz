'use client'

import { Input } from '@/components/ui/Input'
import { MobileMenuButton } from '@/components/layout/MobileMenuButton'
import { formatMoney } from '@/lib/money'
import { formatPhoneRU } from '@/lib/phone'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { MessageSquare, Phone, Search, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface Contact {
  phone: string
  name: string
  email?: string
  telegram?: string
  dealCount: number
  totalBudget: number
  lastDealAt: string
  dealIds: string[]
}

export function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/contacts')
      .then((r) => r.json())
      .then((d) => setContacts(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search) return contacts
    const q = search.toLowerCase()
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.telegram || '').toLowerCase().includes(q)
    )
  }, [contacts, search])

  return (
    <div className="h-full flex flex-col">
      <header className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-1">
          <MobileMenuButton />
          <h1 className="text-[13px] font-semibold text-text">Контакты</h1>
        </div>
        <div className="text-[12px] text-text-muted">{filtered.length}</div>
      </header>

      <div className="border-b border-border p-3 shrink-0">
        <div className="relative max-w-md">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, телефону, telegram..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-text-muted text-sm">Загрузка…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">
            Контактов пока нет. Они появятся когда заполнишь поле «Контакт клиента» в сделках.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((c, i) => (
              <div key={i} className="px-4 py-3 hover:bg-bg-elevated transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                    <User size={16} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="text-[13px] font-medium text-text truncate">{c.name}</div>
                      <div className="text-[11px] text-text-dim whitespace-nowrap">
                        {format(new Date(c.lastDealAt), 'd MMM yyyy', { locale: ru })}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[12px] text-text-muted">
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="inline-flex items-center gap-1 hover:text-accent"
                        >
                          <Phone size={11} /> {formatPhoneRU(c.phone)}
                        </a>
                      )}
                      {c.telegram && (
                        <a
                          href={`https://t.me/${c.telegram.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:text-accent"
                        >
                          <MessageSquare size={11} /> {c.telegram}
                        </a>
                      )}
                    </div>
                    <div className="flex gap-3 mt-1.5 text-[11px] text-text-dim">
                      <span>{c.dealCount} {c.dealCount === 1 ? 'сделка' : 'сделок'}</span>
                      <span>·</span>
                      <span>{formatMoney(c.totalBudget)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
