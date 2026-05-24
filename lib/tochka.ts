/**
 * Точка-банк API wrapper (Tochka Open API v2).
 *
 * Базовый URL: https://enter.tochka.com/uapi
 * Авторизация: Bearer JWT
 *
 * ВАЖНО: customer_code в JWT-payload может НЕ совпадать с реальным customerCode
 * из API. Реальный код берётся из /open-banking/v1.0/accounts. Не используем
 * env var TOCHKA_CUSTOMER_CODE — всегда подтягиваем из API.
 *
 * Проверенные endpoints:
 *  GET  /open-banking/v1.0/accounts                          — список счетов клиента
 *  POST /invoice/v1.0/bills                                  — создание счёта
 *  GET  /invoice/v1.0/bills/{customerCode}/{documentId}/file — PDF счёта
 *
 * GET /invoice/v1.0/bills/{customerCode} возвращает 501 Not Implemented — следующий
 * номер счёта определяем по локальной БД.
 */

const TOCHKA_BASE = 'https://enter.tochka.com/uapi'

function getToken(): string | null {
  return process.env.TOCHKA_JWT_TOKEN || null
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
      console.error(`[tochka] ${path} → ${res.status}: ${text.slice(0, 500)}`)
      return null
    }
    return await res.json()
  } catch (err) {
    console.error(`[tochka] ${path} error:`, err)
    return null
  }
}

interface TochkaAccountResolved {
  customerCode: string
  accountId: string
}

let cachedAccount: TochkaAccountResolved | null = null

export async function resolveAccount(): Promise<TochkaAccountResolved | null> {
  if (cachedAccount) return cachedAccount
  const data = await tochkaFetch('/open-banking/v1.0/accounts')
  const acc = data?.Data?.Account?.[0]
  if (!acc) return null
  cachedAccount = { customerCode: acc.customerCode, accountId: acc.accountId }
  return cachedAccount
}

export async function getCustomerCode(): Promise<string | null> {
  const acc = await resolveAccount()
  return acc?.customerCode || null
}

// Маппинг типа контрагента (DaData → Точка)
export type DaDataType = 'LEGAL' | 'INDIVIDUAL'
function tochkaType(t: DaDataType): 'company' | 'ip' {
  return t === 'INDIVIDUAL' ? 'ip' : 'company'
}

// Маппинг ставки НДС (UI → Точка)
export type VatKind = 'none' | 'nds_0' | 'nds_5' | 'nds_7' | 'nds_10' | 'nds_22'
function tochkaNds(v: VatKind): string {
  if (v === 'none') return 'without_nds'
  return v
}

export interface TochkaInvoicePayload {
  number: number
  date: string                       // YYYY-MM-DD
  counterpartyInn: string
  counterpartyName: string
  counterpartyType: DaDataType
  item: {
    name: string
    unitCode: string                 // "услуга." | "шт." | ...
    quantity: number
    price: number
    vat: VatKind
  }
}

export interface TochkaCreateResult {
  documentId: string
  customerCode: string
}

export async function createTochkaInvoice(
  payload: TochkaInvoicePayload
): Promise<TochkaCreateResult | null> {
  const account = await resolveAccount()
  if (!account) {
    console.error('[tochka] cannot resolve account')
    return null
  }

  const total = +(payload.item.quantity * payload.item.price).toFixed(2)
  const body = {
    Data: {
      customerCode: account.customerCode,
      accountId: account.accountId,
      Content: {
        Invoice: {
          number: String(payload.number),
          date: payload.date,
          totalAmount: total,
          Positions: [
            {
              name: payload.item.name,
              unitCode: payload.item.unitCode,
              quantity: payload.item.quantity,
              price: payload.item.price,
              totalAmount: total,
              ndsKind: tochkaNds(payload.item.vat),
            },
          ],
        },
      },
      SecondSide: {
        taxCode: payload.counterpartyInn,
        name: payload.counterpartyName,
        type: tochkaType(payload.counterpartyType),
      },
    },
  }

  const result = await tochkaFetch('/invoice/v1.0/bills', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const documentId = result?.Data?.documentId
  if (!documentId) return null

  return { documentId, customerCode: account.customerCode }
}

export function buildPdfUrl(customerCode: string, documentId: string): string {
  return `${TOCHKA_BASE}/invoice/v1.0/bills/${customerCode}/${documentId}/file`
}
