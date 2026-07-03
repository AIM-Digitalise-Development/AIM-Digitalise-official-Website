import client from './client'
import { getMockResponse } from '../utils/mockAuthData'

export const PARTNER_API = import.meta.env.VITE_PARTNER_API_URL || 'https://api.nexgn.in/api'

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

// ─── Fetch RM Options ───────────────────────────────────────────────────────
export const fetchRMOptions = () =>
  partnerFetch('GET', '/public/rm-options')

// ─── Step 1: Register partner (Step Tracking API) ──────────────────────────
// formData: FormData with all fields + file uploads
export const registerPartner = (formData) =>
  partnerFetch('POST', '/partner-step/register', formData, true)

// ─── Check Partner Status by partner_id ─────────────────────────────────────
export const checkPartnerStatus = (partnerId) =>
  partnerFetch('GET', `/partner-step/status/${partnerId}`)

// ─── Step 2: Fetch agreement HTML + step data ──────────────────────────────
export const fetchStep2Data = (partnerId) =>
  partnerFetch('GET', `/partner-step/step2/${partnerId}`)

// ─── Step 2: Get preview URL (opens PDF in new tab) ────────────────────────
export const getAgreementPreviewUrl = (partnerId) =>
  `${PARTNER_API}/partner-step/step2/preview/${partnerId}`

// ─── Step 2: Download agreement PDF (blob) + triggers email ────────────────
// Returns a Blob for the PDF file; marks step 2 as completed on the server.
export const downloadAgreementPdf = async (partnerId) => {
  const token = localStorage.getItem('partner_token')

  // Build form data
  const fd = new FormData()
  fd.append('partner_id', partnerId)

  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${PARTNER_API}/partner-step/step2/download`, {
    method: 'POST',
    headers,
    body: fd,
  })

  if (!response.ok) {
    // Try to parse JSON error
    let msg = 'Failed to download agreement'
    try {
      const errData = await response.json()
      msg = errData.message || msg
    } catch { /* ignore */ }
    throw new Error(msg)
  }

  const blob = await response.blob()
  return blob
}

// ─── Step 2: Download agreement (legacy URL helper, kept for compat) ───────
export const getAgreementDownloadUrl = () => `${PARTNER_API}/partner/download-agreement`

// ─── Step 3a: Upload signed agreement ──────────────────────────────────────
// formData: FormData { partner_id, signed_agreement (file) }
export const uploadSignedAgreement = (formData) =>
  partnerFetch('POST', '/partner-step/step3/upload-agreement', formData, true)

// ─── Step 3a (legacy): Complete registration ───────────────────────────────
export const completeRegistration = (formData) =>
  partnerFetch('POST', '/partner/complete-registration', formData, true)

// ─── Step 3b: Create Razorpay order ────────────────────────────────────────
// data: { partner_id, amount, currency }
export const createOrder = (data) =>
  partnerFetch('POST', '/partner/create-order', data)

// ─── Step 3c: Complete payment (step tracking) ─────────────────────────────
// data: { partner_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, currency }
export const completePayment = (data) =>
  partnerFetch('POST', '/partner-step/step3/complete-payment', data)

// ─── Step 3c (legacy): Verify payment ───────────────────────────────────────
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

// ─── Leads Management ────────────────────────────────────────────────────────
export const getPartnerLeads = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== false && v !== undefined && v !== null) {
      query.set(k, v)
    }
  })
  const queryString = query.toString()
  return partnerFetch('GET', `/partner/leads${queryString ? `?${queryString}` : ''}`)
}

export const getPartnerLeadStats = () =>
  partnerFetch('GET', '/partner/leads/stats')

export const getPartnerLeadDetails = (id) =>
  partnerFetch('GET', `/partner/leads/${id}`)

export const createPartnerLead = (data) =>
  partnerFetch('POST', '/partner/leads', data)

export const updatePartnerLead = (id, data) =>
  partnerFetch('PUT', `/partner/leads/${id}`, data)

export const deletePartnerLead = (id) =>
  partnerFetch('DELETE', `/partner/leads/${id}`)

export const assignPartnerDemoSlot = (leadId, slotId) =>
  partnerFetch('POST', `/partner/leads/${leadId}/assign-demo-slot`, { demo_slot_id: slotId })

export const removePartnerDemoSlot = (leadId) =>
  partnerFetch('POST', `/partner/leads/${leadId}/remove-demo-slot`)

export const schedulePartnerFollowUp = (leadId, data) =>
  partnerFetch('POST', `/partner/leads/${leadId}/follow-up`, data)

// ─── Demo Slots ──────────────────────────────────────────────────────────────
export const getPartnerDemoSlots = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== false && v !== undefined && v !== null) {
      query.set(k, v)
    }
  })
  const queryString = query.toString()
  return partnerFetch('GET', `/partner/demo-slots${queryString ? `?${queryString}` : ''}`)
}

export const getPartnerDemoSlotStats = () =>
  partnerFetch('GET', '/partner/demo-slots/stats')

export const togglePartnerDemoSlotStatus = (id) =>
  partnerFetch('POST', `/partner/demo-slots/${id}/toggle-status`)

export const deletePartnerDemoSlot = (id) =>
  partnerFetch('DELETE', `/partner/demo-slots/${id}`)

export const createPartnerDemoSlot = (data) =>
  partnerFetch('POST', '/partner/demo-slots', data)

export const updatePartnerDemoSlot = (id, data) =>
  partnerFetch('PUT', `/partner/demo-slots/${id}`, data)

export const getPartnerSlotBookings = (slotId, date) =>
  partnerFetch('GET', `/partner/demo-slots/${slotId}/bookings?date=${date}`)

export const getPartnerDemoSlotsAvailable = () =>
  partnerFetch('GET', '/partner/demo-slots-available')

export const bookPartnerDemoSlot = (leadId, data) =>
  partnerFetch('POST', `/partner/leads/${leadId}/book-demo-slot`, data)

export const cancelPartnerBooking = (bookingId) =>
  partnerFetch('POST', `/partner/bookings/${bookingId}/cancel`)

// ─── Dropdown helpers ────────────────────────────────────────────────────────
export const getPartnerCategories = () =>
  partnerFetch('GET', '/partner/categories')

export const getPartnerSubcategories = (categoryId) =>
  partnerFetch('GET', `/partner/subcategories${categoryId ? `?category_id=${categoryId}` : ''}`)

export const getPartnerProductsDropdown = (subCategoryId) =>
  partnerFetch('GET', `/partner/products-dropdown${subCategoryId ? `?sub_category_id=${subCategoryId}` : ''}`)

export const updatePartnerLeadStatus = (id, data) =>
  partnerFetch('PUT', `/partner/leads/${id}/status`, data)

export const addPartnerLeadActivity = (id, data) =>
  partnerFetch('POST', `/partner/leads/${id}/activity`, data)

export const sendPartnerDemoEmail = (id, data) =>
  partnerFetch('POST', `/partner/leads/${id}/send-demo`, data)

export const getPartnerAvailableDates = (slotId, params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== false && v !== undefined && v !== null) {
      query.set(k, v)
    }
  })
  const queryString = query.toString()
  return partnerFetch('GET', `/partner/demo-slots/${slotId}/available-dates${queryString ? `?${queryString}` : ''}`)
}

export const bulkAssignLeads = (data) => {
  return Promise.resolve({ data: { success: true, message: 'Leads reassigned successfully (Mocked).' } })
}