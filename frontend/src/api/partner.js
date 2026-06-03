import client from './client'

const PARTNER_API = import.meta.env.VITE_PARTNER_API_URL || 'https://api.nexgn.in/api'

// Helper: build a separate axios-like fetch wrapper for partner API
// (uses fetch directly so it can point at a different base URL)
const partnerFetch = async (method, path, body = null, isFormData = false) => {
  const token = localStorage.getItem('partner_token')
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isFormData) headers['Content-Type'] = 'application/json'
  headers['Accept'] = 'application/json'

  const options = { method, headers }
  if (body) options.body = isFormData ? body : JSON.stringify(body)

  const response = await fetch(`${PARTNER_API}${path}`, options)
  const data = await response.json()
  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed')
    error.response = { data, status: response.status }
    throw error
  }
  return { data }
}

// ─── Step 1: Register partner ──────────────────────────────────────────────
// formData: FormData with all fields + file uploads
export const registerPartner = (formData) =>
  partnerFetch('POST', '/partner/register', formData, true)

// ─── Step 2: Download agreement ────────────────────────────────────────────
export const getAgreementDownloadUrl = () => `${PARTNER_API}/partner/download-agreement`

// ─── Step 3a: Upload signed agreement ──────────────────────────────────────
// formData: { partner_id, email, signed_agreement (file) }
export const completeRegistration = (formData) =>
  partnerFetch('POST', '/partner/complete-registration', formData, true)

// ─── Step 3b: Create Razorpay order ────────────────────────────────────────
// data: { partner_id, amount, currency }
export const createOrder = (data) =>
  partnerFetch('POST', '/partner/create-order', data)

// ─── Step 3c: Verify payment ────────────────────────────────────────────────
// data: { partner_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, currency }
export const verifyPayment = (data) =>
  partnerFetch('POST', '/partner/verify-payment', data)

// ─── Login ──────────────────────────────────────────────────────────────────
export const partnerLogin = (email, password) =>
  partnerFetch('POST', '/partner/login', { email, password })

// ─── Auth check ─────────────────────────────────────────────────────────────
export const checkPartnerAuth = () =>
  partnerFetch('GET', '/partner/check')

// ─── Partner profile ─────────────────────────────────────────────────────────
export const getPartnerProfile = () =>
  partnerFetch('GET', '/partner/profile')

// ─── Logout ──────────────────────────────────────────────────────────────────
export const partnerLogout = () =>
  partnerFetch('POST', '/partner/logout')

// Legacy exports (kept for existing partner portal pages)
export const getEarnings = () => client.get('/partner/earnings')
export const getPayouts = () => client.get('/partner/payouts')
export const requestPayout = (data) => client.post('/partner/payouts', data)
export const getPartnerStats = () => client.get('/partner/stats')
export const updatePartnerProfile = (data) => client.put('/partner/profile', data)