const ADMIN_API = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'

// Helper: admin fetch with Bearer token from localStorage
const adminFetch = async (method, path, body = null) => {
  const token = localStorage.getItem('access_token')
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const response = await fetch(`${ADMIN_API}${path}`, options)
  const data = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`)
    error.response = { data, status: response.status }
    throw error
  }
  return { data }
}

// GET /admin/leads
export const getAdminLeads = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== false && v !== undefined && v !== null) {
      query.set(k, v)
    }
  })
  const queryString = query.toString()
  return adminFetch('GET', `/admin/leads${queryString ? `?${queryString}` : ''}`)
}

// GET /admin/leads/stats
export const getAdminLeadStats = () =>
  adminFetch('GET', '/admin/leads/stats')

// GET /admin/leads/{id}
export const getAdminLeadDetails = (id) =>
  adminFetch('GET', `/admin/leads/${id}`)

// POST /admin/leads
export const createAdminLead = (data) =>
  adminFetch('POST', '/admin/leads', data)

// PUT /admin/leads/{id}
export const updateAdminLead = (id, data) =>
  adminFetch('PUT', `/admin/leads/${id}`, data)

// DELETE /admin/leads/{id}
export const deleteAdminLead = (id) =>
  adminFetch('DELETE', `/admin/leads/${id}`)

// POST /admin/leads/{id}/follow-up
export const scheduleAdminFollowUp = (leadId, data) =>
  adminFetch('POST', `/admin/leads/${leadId}/follow-up`, data)

// GET /admin/demo-slots-available
export const getAdminDemoSlotsAvailable = () =>
  adminFetch('GET', '/admin/demo-slots-available')

// GET /admin/demo-slots/{slotId}/available-dates
export const getAdminAvailableDates = (slotId, params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== false && v !== undefined && v !== null) {
      query.set(k, v)
    }
  })
  const queryString = query.toString()
  return adminFetch('GET', `/admin/demo-slots/${slotId}/available-dates${queryString ? `?${queryString}` : ''}`)
}

// GET /admin/demo-slots/{slotId}/bookings
export const getAdminSlotBookings = (slotId, dateStr) =>
  adminFetch('GET', `/admin/demo-slots/${slotId}/bookings?date=${dateStr}`)

// POST /admin/leads/{leadId}/book-demo-slot
export const bookAdminDemoSlot = (leadId, data) =>
  adminFetch('POST', `/admin/leads/${leadId}/book-demo-slot`, data)

// POST /admin/bookings/{bookingId}/cancel
export const cancelAdminBooking = (bookingId) =>
  adminFetch('POST', `/admin/bookings/${bookingId}/cancel`)

// GET /admin/product-categories (or shared categories)
export const getAdminCategories = () =>
  adminFetch('GET', '/admin/product-categories')

// GET /admin/sub-categories (or shared subcategories)
export const getAdminSubcategories = (catId = '') =>
  adminFetch('GET', `/admin/sub-categories${catId ? `?category_id=${catId}` : ''}`)

// GET /admin/products (or shared products)
export const getAdminProductsDropdown = (subCatId = '') =>
  adminFetch('GET', `/admin/products${subCatId ? `?sub_category_id=${subCatId}` : ''}`)

// POST /admin/leads/{id}/send-demo-email
export const sendAdminDemoEmail = (leadId, data) =>
  adminFetch('POST', `/admin/leads/${leadId}/send-demo-email`, data)

// PUT /admin/leads/{id}/status
export const updateAdminLeadStatus = (id, data) =>
  adminFetch('PUT', `/admin/leads/${id}/status`, data)

// POST /admin/leads/{id}/activity
export const addAdminLeadActivity = (id, data) =>
  adminFetch('POST', `/admin/leads/${id}/activity`, data)

// POST /admin/leads/bulk-assign
export const bulkAssignAdminLeads = (data) =>
  adminFetch('POST', '/admin/leads/bulk-assign', data)
