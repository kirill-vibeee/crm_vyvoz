'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Calculator, FileText, Kanban, List, LucideIcon, Users, X } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { label: 'Сделки', href: '/deals', icon: Kanban },
  { label: 'Все сделки', href: '/list', icon: List },
  { label: 'Контакты', href: '/contacts', icon: Users },
  { label: 'AI калькулятор', href: '/calculator', icon: Calculator },
  { label: 'Счета', href: '/invoices', icon: FileText },
  { label: 'Статистика', href: '/stats', icon: BarChart3 },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open = false, onClose }: SidebarProps = {}) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-56 bg-surface border-r border-border flex flex-col h-screen shrink-0 transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-12 px-4 flex items-center border-b border-border">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white text-xs font-bold mr-2">
            В
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[13px] font-semibold text-text leading-none">Вывоз мусора</span>
            <span className="text-[10px] text-text-muted leading-none mt-0.5">СПб · Москва</span>
          </div>
          {open && (
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded text-text-muted hover:text-text"
              aria-label="Закрыть меню"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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
          <div className="text-[11px] text-text-dim">v0.2 · MVP</div>
        </div>
      </aside>
    </>
  )
}
