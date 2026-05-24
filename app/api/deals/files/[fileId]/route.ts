import { prisma } from '@/lib/prisma'
import { deleteStoredFile, readStoredFile } from '@/lib/storage'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params
  const file = await prisma.dealFile.findUnique({ where: { id: fileId } })
  if (!file) return NextResponse.json({ error: 'Не найден' }, { status: 404 })

  try {
    const data = await readStoredFile(file.storageKey)
    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(file.originalName)}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Файл на диске не найден' }, { status: 404 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params
  const file = await prisma.dealFile.findUnique({ where: { id: fileId } })
  if (!file) return NextResponse.json({ ok: true })

  await deleteStoredFile(file.storageKey)
  await prisma.dealFile.delete({ where: { id: fileId } })
  return NextResponse.json({ ok: true })
}
