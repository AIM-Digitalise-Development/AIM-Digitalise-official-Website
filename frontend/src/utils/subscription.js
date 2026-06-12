/**
 * Parses and returns the plan end date/expiration date from client profile or product data.
 */
export const getPlanEndDate = (displayUser, activeProduct) => {
  const dateStr = 
    displayUser?.valid_to || 
    displayUser?.valid_until || 
    displayUser?.plan_end_date || 
    displayUser?.expiry_date || 
    displayUser?.renewalDueDate ||
    activeProduct?.valid_to || 
    activeProduct?.valid_until || 
    activeProduct?.plan_end_date || 
    activeProduct?.expiry_date ||
    activeProduct?.renewalDueDate
  
  if (dateStr) return new Date(dateStr)
  
  // Fallback: 1 month after activated_at if payment is paid
  const activated = displayUser?.activated_at || activeProduct?.activated_at
  const status = displayUser?.payment_status || activeProduct?.payment_status || ''
  if (activated && status.toLowerCase() === 'paid') {
    const activatedDate = new Date(activated)
    activatedDate.setMonth(activatedDate.getMonth() + 1)
    return activatedDate
  }
  return null
}

/**
 * Evaluates subscription status: active, expired, near-expiry, and if payment is allowed.
 */
export const checkSubscriptionStatus = (profileData, productData) => {
  const displayUser = profileData || {}
  const displayProducts = Array.isArray(productData) ? productData : (productData ? [productData] : [])
  const activeProduct = displayProducts[0] || {}

  const currentDate = new Date()
  // Set time to midnight for simple days-remaining calculations
  currentDate.setHours(0, 0, 0, 0)

  const planEndDate = getPlanEndDate(displayUser, activeProduct)
  
  let isPlanActive = false
  let daysRemaining = 0
  let canPay = true
  let isNearExpiry = false
  let isExpired = false

  const isPaid = (displayUser.payment_status || activeProduct.payment_status || '').toLowerCase() === 'paid'

  if (isPaid && planEndDate) {
    const endDateCopy = new Date(planEndDate)
    endDateCopy.setHours(0, 0, 0, 0)

    const diffTime = endDateCopy.getTime() - currentDate.getTime()
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (daysRemaining > 0) {
      isPlanActive = true
      isExpired = false
      isNearExpiry = daysRemaining <= 3
      canPay = daysRemaining <= 3
    } else {
      isPlanActive = false
      isExpired = true
      isNearExpiry = false
      canPay = true
    }
  }

  return {
    isPlanActive,
    daysRemaining,
    canPay,
    isNearExpiry,
    isExpired,
    planEndDate,
    isPaid
  }
}
