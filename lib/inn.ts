/**
 * Получение данных юр.лица/ИП по ИНН.
 *
 * Используем DaData suggest API — публичный, без авторизации (есть rate limit,
 * для серьёзных нагрузок нужен API ключ — env DADATA_API_KEY).
 *
 * Документация: https://dadata.ru/api/suggest/party/
 */

export interface CounterpartyInfo {
  inn: string
  kpp?: string
  name: string
  shortName?: string
  address?: string
  type: 'LEGAL' | 'INDIVIDUAL'
}

export async function lookupCounterpartyByInn(inn: string): Promise<CounterpartyInfo | null> {
  const cleaned = inn.replace(/\D/g, '')
  if (cleaned.length !== 10 && cleaned.length !== 12) return null

  const apiKey = process.env.DADATA_API_KEY
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (apiKey) headers.Authorization = `Token ${apiKey}`

  try {
    const res = await fetch(
      'https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: cleaned, count: 1 }),
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    const suggestion = data?.suggestions?.[0]
    if (!suggestion) return null

    const d = suggestion.data
    return {
      inn: d.inn,
      kpp: d.kpp || undefined,
      name: d.name?.full_with_opf || d.name?.full || suggestion.value,
      shortName: d.name?.short_with_opf || suggestion.value,
      address: d.address?.unrestricted_value || d.address?.value,
      type: d.type === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'LEGAL',
    }
  } catch {
    return null
  }
}
