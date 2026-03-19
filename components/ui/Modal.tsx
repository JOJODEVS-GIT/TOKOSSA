'use client'

import { useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
  showClose?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  className,
  showClose = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative bg-white rounded-3xl shadow-2xl shadow-black/10 max-w-lg w-full mx-4 max-h-[90vh] overflow-auto animate-slide-up',
          className
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-5 border-b border-warm-100">
            {title && <h2 className="text-lg font-bold text-secondary-500">{title}</h2>}
            {showClose && (
              <button
                onClick={onClose}
                className="p-2 bg-warm-100 hover:bg-warm-200 rounded-xl transition-colors"
                aria-label="Fermer"
              >
                <svg
                  className="w-5 h-5 text-warm-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5 md:p-6">{children}</div>
      </div>
    </div>
  )
}
