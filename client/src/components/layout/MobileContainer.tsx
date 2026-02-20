import type { ReactNode } from 'react'

interface MobileContainerProps {
  children: ReactNode
}

export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div
      className="
        mx-auto w-full max-w-[430px]
        h-[100dvh] min-h-[100dvh]
        overflow-y-auto overflow-x-hidden
        bg-background
        relative
        select-none
        pt-[var(--sat)]
        pb-[var(--sab)]
      "
    >
      {children}
    </div>
  )
}
