'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'error' | 'success' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({
  message,
  type = 'error',
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor =
    type === 'error'
      ? 'bg-red-500/95 backdrop-blur-sm'
      : type === 'success'
        ? 'bg-green-500/95 backdrop-blur-sm'
        : 'bg-blue-500/95 backdrop-blur-sm'

  return (
    <div
      className={`
        ${bgColor} text-white
        px-4 py-3 rounded-lg shadow-xl border border-white/10
        flex items-center gap-3
        animate-in slide-in-from-top-5 fade-in
        min-w-[300px] max-w-md
      `}
    >
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors"
        aria-label="Close"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}

