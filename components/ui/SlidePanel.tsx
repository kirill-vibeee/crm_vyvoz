'use client'

import { X } from 'lucide-react'
import { ReactNode, useEffect } from 'react'

interface SlidePanelProps {
  open: boolean
  onClose: () => void
  title?: string
  width?: number
  children: ReactNode
  footer?: ReactNode
}

export function SlidePanel({ open, onClose, title, width = 520, children, footer }: SlidePanelProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 animate-[fadeIn_120ms_ease-out]"
        onClick={onClose}
      />
      <div
        className="relative h-full bg-bg-elevated border-l border-border flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.6)] animate-[slideIn_180ms_cubic-bezier(0.22,1,0.36,1)]"
        style={{ width }}
      >
        {title !== undefined && (
          <header className="flex items-center justify-between h-12 px-4 border-b border-border shrink-0">
            <h2 className="text-[13px] font-semibold text-text">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-text-muted hover:bg-surface hover:text-text transition-colors"
              aria-label="Закрыть"
            >
              <X size={16} />
            </button>
          </header>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <footer className="border-t border-border p-3 shrink-0">{footer}</footer>}
      </div>
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
