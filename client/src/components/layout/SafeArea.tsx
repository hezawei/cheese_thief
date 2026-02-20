import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SafeAreaProps {
  children: ReactNode
  className?: string
  position: 'top' | 'bottom'
}

export default function SafeArea({ children, className, position }: SafeAreaProps) {
  return (
    <div
      className={cn(
        position === 'top' && 'pt-[var(--sat)]',
        position === 'bottom' && 'pb-[var(--sab)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
