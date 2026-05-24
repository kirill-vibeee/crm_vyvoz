'use client'

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const baseClass =
  'w-full bg-bg-elevated border border-border rounded px-3 h-8 text-[13px] text-text placeholder:text-text-dim transition-colors hover:border-border-hover focus:border-accent focus:bg-bg'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return <input ref={ref} className={`${baseClass} ${className}`} {...props} />
  }
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full bg-bg-elevated border border-border rounded px-3 py-2 text-[13px] text-text placeholder:text-text-dim transition-colors hover:border-border-hover focus:border-accent focus:bg-bg resize-none ${className}`}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

interface FieldProps {
  label?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, hint, children, className = '' }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs text-text-muted font-medium">{label}</label>}
      {children}
      {hint && <span className="text-xs text-text-dim">{hint}</span>}
    </div>
  )
}
