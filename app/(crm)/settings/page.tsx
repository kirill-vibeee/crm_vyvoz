import { auth } from '@/lib/auth'

export default async function SettingsPage() {
  const session = await auth()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Настройки</h1>

      <div className="bg-surface border border-border rounded-lg p-6 max-w-md">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Профиль</h2>
        <p className="text-text-primary mb-2">
          <span className="text-text-muted">Email: </span>
          {session?.user?.email}
        </p>
        <p className="text-text-primary mb-2">
          <span className="text-text-muted">Имя: </span>
          {session?.user?.name}
        </p>
        <p className="text-text-primary">
          <span className="text-text-muted">Роль: </span>
          {session?.user?.role === 'ADMIN' ? '👑 Администратор' : '👤 Менеджер'}
        </p>
      </div>
    </div>
  )
}
