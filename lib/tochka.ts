/**
 * Точка-банк API wrapper (Tochka Open API v2).
 *
 * Базовый URL: https://enter.tochka.com/uapi
 * Авторизация: Bearer JWT
 *
 * Документация: https://developers.tochka.com/docs/tochka-api/
 *
 * Используемые endpoints:
 * - GET  /open-banking/v1.0/accounts                            — список счетов клиента
 * - GET  /invoice/v1.0/bills/{customerCode}                     — список выставленных счетов
 * - POST /invoice/v1.0/bills                                    — создание счёта на оплату
 * - GET  /invoice/v1.0/bills/{customerCode}/{documentId}/file   — PDF счёта
 */

const TOCHKA_BASE = 'https://enter.tochka.com/uapi'

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

function authHeaders(): Record<string, string> | null {
  const token = getToken()
  if (!token) return null
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

async function tochkaFetch(path: string, init?: RequestInit): Promise<any | null> {
  const headers = authHeaders()
  if (!headers) return null
  try {
    const res = await fetch(`${TOCHKA_BASE}${path}`, {
      ...init,
      headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`[tochka] ${path} → ${res.status}: ${text.slice(0, 300)}`)
      return null
    }
    return await res.json()
  } catch (err) {
    console.error(`[tochka] ${path} error:`, err)
    return null
  }
}

export interface TochkaAccount {
  accountId: string
  accountCode?: string
  accountName?: string
  currency?: string
}

export async function getAccountId(): Promise<string | null> {
  if (process.env.TOCHKA_ACCOUNT_ID) return process.env.TOCHKA_ACCOUNT_ID

  const data = await tochkaFetch('/open-banking/v1.0/accounts')
  const account = data?.Data?.Account?.[0]
  return account?.accountId || null
}

export interface TochkaInvoiceItem {
  serviceName: string
  unit: string
  quantity: number
  price: number
  withVat: boolean
}

export interface TochkaInvoicePayload {
  number: number
  date: string
  counterpartyInn: string
  counterpartyName: string
  counterpartyKpp?: string | null
  item: TochkaInvoiceItem
}

export interface TochkaCreateResult {
  documentId: string
  status: 'sent'
}

export async function createTochkaInvoice(
  payload: TochkaInvoicePayload
): Promise<TochkaCreateResult | null> {
  const customerCode = getCustomerCode()
  if (!customerCode) return null

  const accountId = await getAccountId()
  if (!accountId) {
    console.error('[tochka] cannot determine accountId')
    return null
  }

  const nds = payload.item.withVat ? 'nds20' : 'nds_not_charged'
  const amount = payload.item.quantity * payload.item.price

  const body = {
    Data: {
      customerCode,
      accountId,
      Content: {
        invoiceNumber: String(payload.number),
        invoiceDate: payload.date,
        items: [
          {
            name: payload.item.serviceName,
            unit: payload.item.unit,
            quantity: payload.item.quantity,
            price: payload.item.price,
            nds,
          },
        ],
      },
      SecondSide: {
        inn: payload.counterpartyInn,
        name: payload.counterpartyName,
        ...(payload.counterpartyKpp ? { kpp: payload.counterpartyKpp } : {}),
      },
    },
  }

  const result = await tochkaFetch('/invoice/v1.0/bills', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const documentId = result?.Data?.documentId
  if (!documentId) return null

  return { documentId, status: 'sent' }
}

export interface TochkaBillSummary {
  documentId: string
  invoiceNumber?: string
  invoiceDate?: string
  amount?: number
}

export async function listTochkaInvoices(): Promise<TochkaBillSummary[] | null> {
  const customerCode = getCustomerCode()
  if (!customerCode) return null

  const data = await tochkaFetch(`/invoice/v1.0/bills/${customerCode}`)
  const bills = data?.Data?.Bill || data?.Data?.bills || data?.Data
  if (!Array.isArray(bills)) return null

  return bills.map((b: any) => ({
    documentId: b.documentId,
    invoiceNumber: b.Content?.invoiceNumber || b.invoiceNumber,
    invoiceDate: b.Content?.invoiceDate || b.invoiceDate,
    amount: b.Content?.totalAmount || b.amount,
  }))
}

export async function getNextTochkaInvoiceNumber(): Promise<number | null> {
  const bills = await listTochkaInvoices()
  if (!bills) return null
  const numbers = bills
    .map((b) => Number(b.invoiceNumber))
    .filter((n) => !isNaN(n) && n > 0)
  if (numbers.length === 0) return 1
  return Math.max(...numbers) + 1
}

export function getInvoicePdfUrl(documentId: string): string | null {
  const customerCode = getCustomerCode()
  const token = getToken()
  if (!customerCode || !token) return null
  return `${TOCHKA_BASE}/invoice/v1.0/bills/${customerCode}/${documentId}/file`
}
