import { ReactNode } from 'react'

type Tone = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted'

interface BadgeProps {
  tone?: Tone
  children: ReactNode
  className?: string
}

const toneClass: Record<Tone, string> = {
  default: 'bg-surface text-text border-border',
  accent: 'bg-accent-soft text-accent border-accent/30',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  muted: 'bg-bg-elevated text-text-muted border-border',
}

export function Badge({ tone = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 h-5 text-[11px] font-medium rounded border ${toneClass[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
