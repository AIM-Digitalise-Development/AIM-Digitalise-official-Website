import client from './client'
import { getMockResponse } from '../utils/mockAuthData'

const PARTNER_API = import.meta.env.VITE_PARTNER_API_URL || 'https://api.nexgn.in/api'

// Helper: build a separate axios-like fetch wrapper for partner API
// (uses fetch directly so it can point at a different base URL)
const partnerFetch = async (method, path, body = null, isFormData = false) => {
  const token = localStorage.getItem('partner_token')
  
  // If mock token is used, skip live API request to avoid 401/Unauthorized errors in development
  if (token && token.startsWith('mock-')) {
    const mockData = getMockResponse(path, method, body)
    if (mockData) {
      console.warn(`[Partner Portal Mock] Bypassing live request for ${path} due to mock token.`)
      return { data: mockData }
    }
  }

  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (body && !isFormData) headers['Content-Type'] = 'application/json'
  headers['Accept'] = 'application/json'

  const options = { method, headers }
  if (body) options.body = isFormData ? body : JSON.stringify(body)

  try {
    const response = await fetch(`${PARTNER_API}${path}`, options)
    
    let data = null
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      data = { message: text || `HTTP Error ${response.status}` }
    }

    if (!response.ok) {
      // If server returned 5xx/404, fall back to mock data
      if (response.status >= 500 || response.status === 404) {
        const mockData = getMockResponse(path, method, body)
        if (mockData) {
          console.warn(`[Partner Fetch Fallback] Live request failed for ${path} (Status ${response.status}). Using mock data.`)
          return { data: mockData }
        }
      }

      console.error('Partner API request failed:', {
        status: response.status,
        path,
        responseBody: data?.message
      })
      const errorMsg = data?.message && data.message.length < 150 
        ? data.message 
        : `Server returned error ${response.status}`
      const error = new Error(errorMsg)
      error.response = { data, status: response.status }
      throw error
    }
    return { data }
  } catch (err) {
    // If network failed completely (e.g. Failed to fetch), fall back to mock data
    if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
      const mockData = getMockResponse(path, method, body)
      if (mockData) {
        console.warn(`[Partner Fetch Fallback] Network unreachable for ${path}. Using mock data.`)
        return { data: mockData }
      }
    }
    throw err
  }
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
// Backend accepts Partner ID (e.g. PIDIN1234) OR Email in the `login` field
export const partnerLogin = (login, password) =>
  partnerFetch('POST', '/partner/login', { login, password })

// ─── Auth check ─────────────────────────────────────────────────────────────
export const checkPartnerAuth = () =>
  partnerFetch('GET', '/partner/check')

// ─── Partner profile ─────────────────────────────────────────────────────────
export const getPartnerProfile = () =>
  partnerFetch('GET', '/partner/profile')

// ─── Logout ──────────────────────────────────────────────────────────────────
export const partnerLogout = () =>
  partnerFetch('POST', '/partner/logout')

// ─── Get Partner's Sold Orders (My Orders) ───────────────────────────────────
export const getPartnerOrders = () =>
  partnerFetch('GET', '/partner/my-orders')

// ─── Get Single Order Details ────────────────────────────────────────────────
export const getPartnerOrderDetail = (orderId) =>
  partnerFetch('GET', `/partner/order/${orderId}`)

// ─── Dashboard Statistics ────────────────────────────────────────────────────
export const getDashboardStats = () =>
  partnerFetch('GET', '/partner/dashboard-stats')

// ─── Commission Report ───────────────────────────────────────────────────────
export const getCommissionReport = () =>
  partnerFetch('GET', '/partner/commission-report')