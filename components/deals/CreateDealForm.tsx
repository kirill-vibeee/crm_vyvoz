'use client'

import { Source } from '@prisma/client'
import { FormEvent, useState } from 'react'

interface CreateDealFormProps {
  onSuccess?: () => void
}

export function CreateDealForm({ onSuccess }: CreateDealFormProps) {
  const [title, setTitle] = useState('')
  const [source, setSource] = useState<Source>('AVITO')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, source }),
      })

      if (res.ok) {
        setTitle('')
        setSource('AVITO')
        onSuccess?.()
      } else {
        setError('Ошибка при создании сделки')
      }
    } catch (err) {
      setError('Ошибка сети')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Новая сделка</h2>
      {error && <p className="text-danger text-sm mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Описание сделки"
          required
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
        />

        <select
          value={source}
          onChange={(e) => setSource(e.target.value as Source)}
          className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent"
        >
          <option value="AVITO">Авито</option>
          <option value="YANDEX_DIRECT">Яндекс.Директ</option>
          <option value="YANDEX_MAPS">Яндекс.Карты</option>
          <option value="WEBSITE">Сайт</option>
          <option value="REFERRAL">Рекомендация</option>
          <option value="OTHER">Другое</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Создание...' : 'Создать'}
        </button>
      </form>
    </div>
  )
}
