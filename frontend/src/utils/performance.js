export const measurePerformance = (name, fn) => {
  if (import.meta.env.DEV) {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    console.log(`${name}: ${(end - start).toFixed(2)}ms`)
    return result
  }
  return fn()
}

export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}