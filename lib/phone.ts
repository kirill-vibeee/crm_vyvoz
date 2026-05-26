/**
 * Стандартизация телефонных номеров.
 *
 * Правила:
 *  - Все нецифры (пробелы, скобки, дефисы, +) удаляются
 *  - 8 в начале (11 цифр) → +7
 *  - 7 в начале (11 цифр) → +7
 *  - 9 в начале (10 цифр) → +7 (мобильный без кода страны)
 *  - 10 цифр любых → +7 (предполагаем РФ)
 *  - Остальное возвращаем как +<цифры>
 *
 * Примеры:
 *   "+7 (911) 123-45-67" → "+79111234567"
 *   "8 911 123 45 67"    → "+79111234567"
 *   "9111234567"         → "+79111234567"
 *   ""                   → ""
 */

export function normalizePhone(input: string | null | undefined): string {
  if (!input) return ''
  const digits = String(input).replace(/\D/g, '')
  if (!digits) return ''

  if (digits.length === 11 && (digits[0] === '8' || digits[0] === '7')) {
    return '+7' + digits.slice(1)
  }
  if (digits.length === 10) {
    return '+7' + digits
  }
  // Иной формат — оставляем как есть с плюсом
  return '+' + digits
}

/**
 * Форматирование для отображения: "+7 (911) 123-45-67"
 */
export function formatPhoneRU(phone: string | null | undefined): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length !== 11) return phone
  return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
}
