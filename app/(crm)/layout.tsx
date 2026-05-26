'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { ReactNode, useEffect, useState } from 'react'

export default function CRMLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onOpen() {
      setMenuOpen(true)
    }
    window.addEventListener('crm:open-sidebar', onOpen)
    return () => window.removeEventListener('crm:open-sidebar', onOpen)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1 overflow-hidden bg-bg min-w-0 flex flex-col">
        <div className="flex-1 min-h-0">{children}</div>
      </main>
    </div>
  )
}
