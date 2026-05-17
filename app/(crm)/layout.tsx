import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default async function CRMLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={session.user.role || 'MANAGER'} />
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
