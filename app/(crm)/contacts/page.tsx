import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ContactsPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    redirect('/deals')
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-4">Контакты</h1>
      <div className="bg-surface border border-border rounded-lg p-8 text-text-muted">
        <p>Раздел Контакты — в разработке</p>
      </div>
    </div>
  )
}
