'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Menu } from 'lucide-react'
import { ReactNode, useState } from 'react'

export default function CRMLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1 overflow-hidden bg-bg min-w-0 flex flex-col">
        {/* Mobile-only hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden absolute top-2.5 left-3 z-20 w-8 h-8 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface"
          aria-label="Меню"
        >
          <Menu size={16} />
        </button>
        <div className="flex-1 min-h-0 md:pl-0 pl-10">{children}</div>
      </main>
    </div>
  )
}
