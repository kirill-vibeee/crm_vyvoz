'use client'

import { Textarea } from '@/components/ui/Input'
import { ArrowDownLeft, ArrowUpRight, Loader2, MessageSquare, Phone, Send, StickyNote } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Message {
  id: string
  text: string
  channel: 'NOTE' | 'TG' | 'AVITO' | 'MAX' | 'CALL'
  direction: 'IN' | 'OUT' | null
  createdAt: string
  author?: { name: string }
}

const CHANNELS = [
  { value: 'NOTE', label: 'Заметка', icon: StickyNote },
  { value: 'TG', label: 'Telegram', icon: MessageSquare },
  { value: 'AVITO', label: 'Avito', icon: MessageSquare },
  { value: 'MAX', label: 'Max', icon: MessageSquare },
  { value: 'CALL', label: 'Звонок', icon: Phone },
]

interface Props {
  dealId: string
}

export function DealChatPane({ dealId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [channel, setChannel] = useState<Message['channel']>('TG')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  function reload() {
    setLoading(true)
    fetch(`/api/deals/${dealId}/messages`)
      .then((r) => r.json())
      .then((d) => setMessages(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload()
  }, [dealId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(direction: 'IN' | 'OUT' | null) {
    if (!text.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/deals/${dealId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), channel, direction }),
      })
      if (res.ok) {
        const m = await res.json()
        setMessages((prev) => [...prev, m])
        setText('')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-surface/60">
      <div className="px-3 py-2 border-b border-border shrink-0">
        <div className="text-[11px] text-text-dim uppercase tracking-wider font-semibold mb-1.5">
          История общения
        </div>
        <div className="flex flex-wrap gap-1">
          {CHANNELS.map((c) => {
            const active = channel === c.value
            const Icon = c.icon
            return (
              <button
                key={c.value}
                onClick={() => setChannel(c.value as any)}
                className={`inline-flex items-center gap-1 px-2 h-6 rounded text-[11px] transition-colors ${
                  active
                    ? 'bg-accent text-white'
                    : 'bg-bg-elevated text-text-muted hover:text-text border border-border'
                }`}
              >
                <Icon size={11} />
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="text-text-muted text-[12px]">Загрузка…</div>
        ) : messages.length === 0 ? (
          <div className="text-text-dim text-[12px] text-center mt-8">
            Истории пока нет.<br />Записывай сообщения и звонки вручную.
          </div>
        ) : (
          messages.map((m) => {
            const Icon = CHANNELS.find((c) => c.value === m.channel)?.icon || StickyNote
            const isOut = m.direction === 'OUT'
            const isIn = m.direction === 'IN'
            const isNote = m.channel === 'NOTE'
            return (
              <div
                key={m.id}
                className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-md px-2.5 py-1.5 ${
                    isNote
                      ? 'bg-warning/10 border border-warning/30 text-text'
                      : isOut
                      ? 'bg-accent text-white'
                      : 'bg-bg-elevated border border-border text-text'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px] opacity-70 mb-0.5">
                    <Icon size={9} />
                    <span>{CHANNELS.find((c) => c.value === m.channel)?.label}</span>
                    {isIn && <ArrowDownLeft size={9} />}
                    {isOut && <ArrowUpRight size={9} />}
                    <span className="ml-auto">
                      {format(new Date(m.createdAt), 'd MMM HH:mm', { locale: ru })}
                    </span>
                  </div>
                  <div className="text-[12.5px] whitespace-pre-wrap leading-relaxed">{m.text}</div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-2 shrink-0 space-y-1.5">
        <Textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            channel === 'NOTE'
              ? 'Заметка по сделке…'
              : channel === 'CALL'
              ? 'Что обсудили по телефону…'
              : 'Текст сообщения…'
          }
          disabled={sending}
        />
        <div className="flex gap-1.5">
          {channel === 'NOTE' ? (
            <button
              onClick={() => send(null)}
              disabled={sending || !text.trim()}
              className="flex-1 inline-flex items-center justify-center gap-1 h-7 rounded bg-warning/15 border border-warning/30 text-warning text-[11.5px] hover:bg-warning/25 disabled:opacity-50"
            >
              {sending ? <Loader2 size={12} className="animate-spin" /> : <StickyNote size={12} />}
              Записать заметку
            </button>
          ) : (
            <>
              <button
                onClick={() => send('IN')}
                disabled={sending || !text.trim()}
                className="flex-1 inline-flex items-center justify-center gap-1 h-7 rounded bg-bg-elevated border border-border text-text-muted text-[11.5px] hover:bg-surface-hover hover:text-text disabled:opacity-50"
              >
                <ArrowDownLeft size={12} />
                Входящее
              </button>
              <button
                onClick={() => send('OUT')}
                disabled={sending || !text.trim()}
                className="flex-1 inline-flex items-center justify-center gap-1 h-7 rounded bg-accent text-white text-[11.5px] hover:bg-accent-hover disabled:opacity-50"
              >
                {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Исходящее
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
