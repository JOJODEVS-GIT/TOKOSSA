'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 focus:ring-primary-500',
      secondary:
        'bg-white border-2 border-warm-200 text-secondary-500 hover:bg-warm-50 hover:border-warm-300 focus:ring-warm-400',
      outline:
        'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
      ghost:
        'text-warm-600 hover:bg-warm-100 hover:text-secondary-500 focus:ring-warm-400',
      whatsapp:
        'bg-green-500 text-white shadow-lg shadow-green-500/25 hover:bg-green-600 hover:shadow-xl hover:shadow-green-500/30 focus:ring-green-500',
      danger:
        'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500',
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-5 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? 'true' : 'false'}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Chargement...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
