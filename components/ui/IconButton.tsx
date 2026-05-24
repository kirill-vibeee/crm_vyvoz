'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', className = '', children, ...props }, ref) => {
    const dim = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'
    return (
      <button
        ref={ref}
        className={`${dim} inline-flex items-center justify-center rounded text-text-muted hover:bg-surface hover:text-text transition-colors disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)
IconButton.displayName = 'IconButton'
