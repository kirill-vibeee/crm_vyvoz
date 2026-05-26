/**
 * Формат денег — всегда полное число с разделителями тысяч.
 * Никаких "3КР" или "1.5М".
 *
 * Примеры:
 *   3000     → "3 000 ₽"
 *   1500000  → "1 500 000 ₽"
 *   1234.5   → "1 234,5 ₽"
 */

export function formatMoney(n: number | null | undefined): string {
  if (n == null || isNaN(Number(n))) return '—'
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
  }).format(Number(n)) + ' ₽'
}

/**
 * Краткая запись для очень узких мест (хедер колонки Канбана и т.п.).
 * Используем только если форма очень узкая.
 */
export function formatMoneyShort(n: number | null | undefined): string {
  if (n == null || isNaN(Number(n))) return '—'
  const num = Number(n)
  if (num >= 1_000_000) {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(num / 1_000_000) + 'М ₽'
  }
  return new Intl.NumberFormat('ru-RU').format(num) + ' ₽'
}
