import { getAccountId, getCustomerCode } from '@/lib/tochka'
import { lookupCounterpartyByInn } from '@/lib/inn'
import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.TOCHKA_JWT_TOKEN
  const customerCode = getCustomerCode()

  let tochkaOk = false
  let tochkaError: string | null = null
  let accountId: string | null = null

  if (!token) {
    tochkaError = 'TOCHKA_JWT_TOKEN не установлен в Railway Variables'
  } else if (!customerCode) {
    tochkaError = 'Не удалось определить customer_code из JWT'
  } else {
    try {
      accountId = await getAccountId()
      if (accountId) {
        tochkaOk = true
      } else {
        tochkaError = 'JWT валидный, но API Точки не вернул accounts (возможно нет прав или истёк токен)'
      }
    } catch (err: any) {
      tochkaError = `Ошибка подключения к Точке: ${err?.message || err}`
    }
  }

  // Проверка DaData (тестируем на ИНН Сбербанка — он точно есть в реестре)
  let dadataOk = false
  let dadataError: string | null = null
  try {
    const test = await lookupCounterpartyByInn('7707083893')
    if (test) {
      dadataOk = true
    } else {
      dadataError = 'DaData не вернула данные. Возможно превышен rate-limit публичного ключа — добавь DADATA_API_KEY в Railway'
    }
  } catch (err: any) {
    dadataError = `DaData ошибка: ${err?.message || err}`
  }

  return NextResponse.json({
    tochka: {
      ok: tochkaOk,
      hasToken: !!token,
      customerCode,
      accountId,
      error: tochkaError,
    },
    dadata: {
      ok: dadataOk,
      hasOwnKey: !!process.env.DADATA_API_KEY,
      error: dadataError,
    },
  })
}
