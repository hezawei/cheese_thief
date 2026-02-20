import { useState, useRef, useCallback, useEffect } from 'react'

interface UseCountdownReturn {
  remaining: number
  isRunning: boolean
  start: (seconds: number) => void
  stop: () => void
  reset: () => void
}

export function useCountdown(onComplete?: () => void): UseCountdownReturn {
  const [remaining, setRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearTimer()
    setIsRunning(false)
  }, [clearTimer])

  const start = useCallback(
    (seconds: number) => {
      clearTimer()
      setRemaining(seconds)
      setIsRunning(true)

      timerRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer()
            setIsRunning(false)
            onCompleteRef.current?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    [clearTimer],
  )

  const reset = useCallback(() => {
    clearTimer()
    setRemaining(0)
    setIsRunning(false)
  }, [clearTimer])

  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  return { remaining, isRunning, start, stop, reset }
}
