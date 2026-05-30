import useUIStore from '../store/uiStore'

export const useToast = () => {
  const { toast, showToast, hideToast } = useUIStore()

  const success = (message) => showToast(message, 'success')
  const error = (message) => showToast(message, 'error')
  const info = (message) => showToast(message, 'info')
  const warning = (message) => showToast(message, 'warning')

  return { toast, showToast, hideToast, success, error, info, warning }
}