import { useEffect } from 'react'
import useUIStore from '../../store/uiStore'

export const Toast = () => {
  const { toast, hideToast } = useUIStore()
  
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toast, hideToast])
  
  if (!toast) return null
  
  const types = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`${types[toast.type] || types.info} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3`}>
        <span>{toast.message}</span>
        <button onClick={hideToast} className="text-white hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  )
}