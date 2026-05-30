export const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message || 'An unexpected error occurred'
  const status = error.response?.status
  const errors = error.response?.data?.errors

  return {
    message,
    status,
    errors,
    success: false,
  }
}

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

export const logError = (error, context = '') => {
  if (import.meta.env.DEV) {
    console.error(`[ERROR] ${context}:`, error)
  }
  // In production, you might want to send this to a logging service
}