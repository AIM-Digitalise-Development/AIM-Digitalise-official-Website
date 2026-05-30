import { useEffect, useRef } from 'react'

export const usePerformance = (componentName) => {
  const renderCount = useRef(0)

  useEffect(() => {
    if (import.meta.env.DEV) {
      renderCount.current += 1
      console.log(`${componentName} rendered ${renderCount.current} times`)
    }
  })

  useEffect(() => {
    if (import.meta.env.DEV) {
      const start = performance.now()
      return () => {
        const end = performance.now()
        console.log(`${componentName} unmounted after ${(end - start).toFixed(2)}ms`)
      }
    }
  }, [componentName])
}