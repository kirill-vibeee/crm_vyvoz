'use client'

import { Menu } from 'lucide-react'

export function MobileMenuButton() {
  function open() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('crm:open-sidebar'))
    }
  }
  return (
    <button
      onClick={open}
      className="md:hidden w-7 h-7 -ml-1 mr-2 inline-flex items-center justify-center rounded text-text-muted hover:bg-surface hover:text-text"
      aria-label="Меню"
    >
      <Menu size={16} />
    </button>
  )
}
