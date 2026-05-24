/**
 * Точка-банк JWT API wrapper.
 *
 * JWT payload содержит customer_code. Конкретные endpoints для счетов
 * могут отличаться в зависимости от подключённых продуктов аккаунта.
 *
 * Текущая реализация:
 * - createInvoice: пытается отправить счёт в Точку. Если API недоступен — возвращает null.
 * - При ошибке счёт всё равно сохраняется локально (см. app/api/invoices/route.ts).
 *
 * Документация: https://enter.tochka.com/doc/v2/
 */

const TOCHKA_BASE = 'https://enter.tochka.com'

function getToken(): string | null {
  return process.env.TOCHKA_JWT_TOKEN || null
}

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const json = Buffer.from(parts[1], 'base64').toString('utf-8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function getCustomerCode(): string | null {
  if (process.env.TOCHKA_CUSTOMER_CODE) return process.env.TOCHKA_CUSTOMER_CODE
  const token = getToken()
  if (!token) return null
  const payload = decodeJwtPayload(token)
  return payload?.customer_code || null
}

export interface TochkaInvoicePayload {
  number: number
  date: string
  counterpartyInn: string
  counterpartyName: string
  serviceName: string
  unit: string
  quantity: number
  price: number
  withVat: boolean
}

export async function createTochkaInvoice(
  payload: TochkaInvoicePayload
): Promise<{ id?: string; pdfUrl?: string } | null> {
  const token = getToken()
  const customerCode = getCustomerCode()
  if (!token || !customerCode) return null

  const total = payload.quantity * payload.price
  const body = {
    Data: {
      Document: {
        documentDate: payload.date,
        documentNumber: String(payload.number),
        counterpartyInn: payload.counterpartyInn,
        counterpartyName: payload.counterpartyName,
        items: [
          {
            itemName: payload.serviceName,
            unitName: payload.unit,
            quantity: payload.quantity,
            price: payload.price,
            withVat: payload.withVat,
            totalAmount: total,
          },
        ],
        totalAmount: total,
      },
    },
  }

  try {
    const res = await fetch(`${TOCHKA_BASE}/uapi/invoice/v1.0/${customerCode}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      id: data?.Data?.documentId || data?.Data?.invoiceId,
      pdfUrl: data?.Data?.pdfUrl || data?.Data?.fileUrl,
    }
  } catch {
    return null
  }
}
