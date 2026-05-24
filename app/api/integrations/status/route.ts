import { resolveAccount } from '@/lib/tochka'
import { lookupCounterpartyByInn } from '@/lib/inn'
import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.TOCHKA_JWT_TOKEN

  let tochkaOk = false
  let tochkaError: string | null = null
  let customerCode: string | null = null
  let accountId: string | null = null

  if (!token) {
    tochkaError = 'TOCHKA_JWT_TOKEN не установлен в Railway Variables'
  } else {
    try {
      const acc = await resolveAccount()
      if (acc) {
        tochkaOk = true
        customerCode = acc.customerCode
        accountId = acc.accountId
      } else {
        tochkaError = 'JWT не вернул accounts — проверь срок действия токена'
      }
    } catch (err: any) {
      tochkaError = `Ошибка: ${err?.message || err}`
    }
  }

  let dadataOk = false
  let dadataError: string | null = null
  try {
    const test = await lookupCounterpartyByInn('7707083893')
    if (test) {
      dadataOk = true
    } else {
      dadataError = 'DaData не вернула данные. Возможно превышен rate-limit'
    }
  } catch (err: any) {
    dadataError = `DaData: ${err?.message || err}`
  }

  return NextResponse.json({
    tochka: { ok: tochkaOk, hasToken: !!token, customerCode, accountId, error: tochkaError },
    dadata: { ok: dadataOk, hasOwnKey: !!process.env.DADATA_API_KEY, error: dadataError },
  })
}
