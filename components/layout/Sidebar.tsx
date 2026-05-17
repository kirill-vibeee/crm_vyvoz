'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface NavItem {
  label: string
  href: string
  icon: ReactNode
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Сделки', href: '/deals', icon: '📋' },
  { label: 'Сообщения', href: '/messages', icon: '💬' },
  { label: 'AI-калькулятор', href: '/calculator', icon: '🤖' },
  { label: 'Аналитика', href: '/analytics', icon: '📊', adminOnly: true },
  { label: 'Контакты', href: '/contacts', icon: '👥', adminOnly: true },
  { label: 'Настройки', href: '/settings', icon: '⚙️' },
]

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const filtered = role === 'ADMIN' ? navItems : navItems.filter((n) => !n.adminOnly)

  return (
    <aside className="w-60 bg-surface border-r border-border flex flex-col h-screen">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-text-primary">CRM</h1>
        <p className="text-xs text-text-muted">Вывоз мусора</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filtered.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent/20 text-accent'
                  : 'text-text-primary hover:bg-surface/80'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <p className="text-xs text-text-muted px-4 py-2">
          {role === 'ADMIN' ? '👑 Администратор' : '👤 Менеджер'}
        </p>
      </div>
    </aside>
  )
}
