import { useEffect } from 'react'

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])
  
  if (!isOpen) return null
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  }
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative bg-white rounded-lg shadow-xl w-full ${sizes[size]} animate-slide-up`}>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 text-sm font-bold">
            ✕
          </button>
          {title && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          )}
          <div className="p-6">
            {children}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button className="btn-primary">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )
}