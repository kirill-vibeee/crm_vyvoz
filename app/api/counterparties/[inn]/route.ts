import { lookupCounterpartyByInn } from '@/lib/inn'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ inn: string }> }
) {
  const { inn } = await params
  const info = await lookupCounterpartyByInn(inn)
  if (!info) {
    return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
  }
  return NextResponse.json(info)
}
