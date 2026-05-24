/**
 * MVP mode: вместо настоящего Prisma + Postgres используем in-memory store.
 * Поверхность API совпадает (prisma.deal.findMany / create / update / delete и т.д.)
 * так что вызовы из app/api/* и lib/* не требуют изменений.
 *
 * Данные не сохраняются между перезапусками контейнера — это OK для пощупать.
 */

import { memstore } from './memstore'

;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

export const prisma: any = memstore
