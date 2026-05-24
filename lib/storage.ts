import { mkdir, readFile, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_ROOT = process.env.UPLOAD_DIR || '/app/uploads'

export interface SavedFile {
  storageKey: string  // относительный путь от UPLOAD_ROOT
  filename: string    // имя на диске (uuid + расширение)
  size: number
}

function safeExt(name: string): string {
  const dot = name.lastIndexOf('.')
  if (dot === -1) return ''
  const ext = name.slice(dot).toLowerCase()
  // ограничим длину/символы
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : ''
}

export async function saveFile(dealId: string, originalName: string, data: Uint8Array | Buffer): Promise<SavedFile> {
  const dir = path.join(UPLOAD_ROOT, dealId)
  await mkdir(dir, { recursive: true })

  const ext = safeExt(originalName)
  const filename = `${randomUUID()}${ext}`
  const absPath = path.join(dir, filename)
  await writeFile(absPath, data)

  const storageKey = `${dealId}/${filename}`
  return { storageKey, filename, size: data.byteLength }
}

export async function readStoredFile(storageKey: string): Promise<Buffer> {
  const absPath = path.join(UPLOAD_ROOT, storageKey)
  return await readFile(absPath)
}

export async function deleteStoredFile(storageKey: string): Promise<void> {
  const absPath = path.join(UPLOAD_ROOT, storageKey)
  try {
    await unlink(absPath)
  } catch {
    // silently ignore — already gone
  }
}
