'use client'

import { File as FileIcon, Loader2, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface DealFile {
  id: string
  originalName: string
  mimeType: string
  size: number
  url: string
  createdAt: string
}

interface Props {
  dealId: string
}

function isImage(mime: string) {
  return mime.startsWith('image/')
}

function formatBytes(n: number) {
  if (n < 1024) return n + ' Б'
  if (n < 1024 * 1024) return Math.round(n / 1024) + ' КБ'
  return (n / 1024 / 1024).toFixed(1) + ' МБ'
}

export function DealFilesSection({ dealId }: Props) {
  const [files, setFiles] = useState<DealFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewFile, setPreviewFile] = useState<DealFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/deals/${dealId}/files`)
      .then((r) => r.json())
      .then((d) => setFiles(Array.isArray(d) ? d : []))
      .catch(() => setFiles([]))
  }, [dealId])

  async function uploadFiles(fileList: FileList | File[]) {
    setUploading(true)
    try {
      for (const f of Array.from(fileList)) {
        const fd = new FormData()
        fd.append('file', f)
        const res = await fetch(`/api/deals/${dealId}/files`, { method: 'POST', body: fd })
        if (res.ok) {
          const saved = await res.json()
          setFiles((prev) => [saved, ...prev])
        }
      }
    } finally {
      setUploading(false)
    }
  }

  async function remove(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    await fetch(`/api/deals/files/${id}`, { method: 'DELETE' })
  }

  return (
    <div className="border-t border-border pt-5">
      <div className="text-[11px] text-text-dim uppercase tracking-wider mb-3 font-semibold">
        Файлы и чеки
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-1.5 py-4 border border-dashed rounded cursor-pointer transition-colors ${
          dragOver ? 'border-accent bg-accent-soft' : 'border-border hover:border-border-hover'
        }`}
      >
        {uploading ? (
          <Loader2 size={18} className="animate-spin text-text-muted" />
        ) : (
          <Upload size={16} className="text-text-muted" />
        )}
        <span className="text-[12px] text-text-muted">
          {uploading ? 'Загрузка...' : 'Перетащи или кликни, чтобы прикрепить'}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {files.map((f) => (
            <div
              key={f.id}
              className="group relative aspect-square bg-bg-elevated border border-border rounded overflow-hidden hover:border-border-hover"
            >
              {isImage(f.mimeType) ? (
                <img
                  src={f.url}
                  alt={f.originalName}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setPreviewFile(f)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => window.open(f.url, '_blank')}
                  className="w-full h-full flex flex-col items-center justify-center gap-1 p-2"
                >
                  <FileIcon size={20} className="text-text-muted" />
                  <span className="text-[10px] text-text-muted text-center line-clamp-2">
                    {f.originalName}
                  </span>
                </button>
              )}
              <button
                onClick={() => remove(f.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded bg-bg/90 border border-border opacity-0 group-hover:opacity-100 flex items-center justify-center text-danger hover:bg-danger/10"
                title="Удалить"
              >
                <Trash2 size={11} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 bg-bg/90 text-[9.5px] text-text-muted truncate">
                {formatBytes(f.size)}
              </div>
            </div>
          ))}
        </div>
      )}

      {previewFile && isImage(previewFile.mimeType) && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <button
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-text-muted hover:text-text"
            onClick={() => setPreviewFile(null)}
          >
            <X size={16} />
          </button>
          <img
            src={previewFile.url}
            alt={previewFile.originalName}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
