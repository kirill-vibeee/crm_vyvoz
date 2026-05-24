'use client'

import { Plus } from 'lucide-react'
import { FormEvent, useState } from 'react'

interface DealQuickCreateProps {
  onCreate: (title: string) => Promise<void>
}

export function DealQuickCreate({ onCreate }: DealQuickCreateProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      await onCreate(title.trim())
      setTitle('')
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-2.5 h-8 rounded text-[12px] text-text-muted hover:bg-surface hover:text-text transition-colors"
      >
        <Plus size={14} strokeWidth={2} />
        Добавить сделку
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-elevated border border-accent rounded-md p-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false)
            setTitle('')
          }
        }}
        placeholder="Название сделки..."
        disabled={loading}
        className="w-full bg-transparent text-[13px] text-text placeholder:text-text-dim outline-none"
      />
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setTitle('')
          }}
          className="text-[11.5px] text-text-muted hover:text-text"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="px-2.5 h-6 text-[11.5px] font-medium rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? 'Создание...' : 'Создать'}
        </button>
      </div>
    </form>
  )
}
