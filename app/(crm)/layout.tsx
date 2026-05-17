import { Sidebar } from '@/components/layout/Sidebar'
import { ReactNode } from 'react'

export default function CRMLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="ADMIN" />
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
