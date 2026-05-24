'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Kanban, Calculator, FileText, LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { label: 'Сделки', href: '/deals', icon: Kanban },
  { label: 'Калькулятор', href: '/calculator', icon: Calculator },
  { label: 'Счета', href: '/invoices', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-surface border-r border-border flex flex-col h-screen shrink-0">
      <div className="h-12 px-4 flex items-center border-b border-border">
        <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white text-xs font-bold mr-2">
          В
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-text leading-none">Вывоз мусора</span>
          <span className="text-[10px] text-text-muted leading-none mt-0.5">СПб · Москва</span>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 h-8 rounded text-[13px] transition-colors ${
                isActive
                  ? 'bg-accent-soft text-text font-medium'
                  : 'text-text-muted hover:bg-surface-hover hover:text-text'
              }`}
            >
              <Icon size={15} strokeWidth={1.8} className={isActive ? 'text-accent' : ''} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="text-[11px] text-text-dim">v0.1 · MVP</div>
      </div>
    </aside>
  )
}
