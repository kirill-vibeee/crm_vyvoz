import { prisma } from '@/lib/prisma'
import { saveFile } from '@/lib/storage'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params

  const deal = await prisma.deal.findUnique({ where: { id: dealId } })
  if (!deal) return NextResponse.json({ error: 'Сделка не найдена' }, { status: 404 })

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не передан' }, { status: 400 })
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const saved = await saveFile(dealId, file.name, buf)

  const dealFile = await prisma.dealFile.create({
    data: {
      dealId,
      filename: saved.filename,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: saved.size,
      storageKey: saved.storageKey,
      url: `/api/deals/files/${saved.storageKey.replace('/', '__')}`, // placeholder, реальный URL ниже
    },
  })

  // Обновляем URL на API-роут с реальным ID
  const updated = await prisma.dealFile.update({
    where: { id: dealFile.id },
    data: { url: `/api/deals/files/${dealFile.id}` },
  })

  return NextResponse.json(updated, { status: 201 })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dealId } = await params
  const files = await prisma.dealFile.findMany({
    where: { dealId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(files)
}
