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

// ─── Single dashboard endpoint ────────────────────────────────────────────────
// GET /api/admin/dashboard
// Returns: { success, data: { clients, revenue, partners, top_products, monthly_revenue, recent_activities } }
export const getAdminDashboard = () =>
  adminFetch('GET', '/admin/dashboard')

// ─── Partners ─────────────────────────────────────────────────────────────────
// GET /api/admin/partners
export const getAdminPartners = () =>
  adminFetch('GET', '/admin/partners')

// GET /api/admin/partners/{id}
export const getAdminPartnerById = (id) =>
  adminFetch('GET', `/admin/partners/${id}`)

// GET /api/admin/partners/{id}/documents
export const getAdminPartnerDocuments = (id) =>
  adminFetch('GET', `/admin/partners/${id}/documents`)

// POST /api/admin/partners/{id}/approve
export const approvePartner = (id) =>
  adminFetch('POST', `/admin/partners/${id}/approve`)

// POST /api/admin/partners/{id}/reject   — body: { reason }
export const rejectPartner = (id, reason) =>
  adminFetch('POST', `/admin/partners/${id}/reject`, { reason })

// ─── Clients ──────────────────────────────────────────────────────────────────
// GET /api/admin/clients
export const getAdminClients = () =>
  adminFetch('GET', '/admin/clients')

// GET /api/admin/clients/{id}
export const getAdminClientById = (id) =>
  adminFetch('GET', `/admin/clients/${id}`)

// PUT /api/admin/clients/{id}/delivery  — body: { delivery_after: number }
export const updateClientDelivery = (id, deliveryAfterDays) =>
  adminFetch('PUT', `/admin/clients/${id}/delivery`, { delivery_after: deliveryAfterDays })

// ─── Products ─────────────────────────────────────────────────────────────────
// GET /api/admin/products
export const getAdminProducts = () =>
  adminFetch('GET', '/admin/products')

// PUT /api/admin/products/{id}/discounts
// body: { monthly_discount, quarterly_discount, half_yearly_discount, annual_discount }
export const updateProductDiscounts = (id, discounts) =>
  adminFetch('PUT', `/admin/products/${id}/discounts`, discounts)

// ─── Hierarchy & Ranks ────────────────────────────────────────────────────────
// GET /api/admin/partners-hierarchy
export const getPartnersHierarchy = () =>
  adminFetch('GET', '/admin/partners-hierarchy')

// POST /api/admin/partners/{id}/set-rank
export const setPartnerRank = (id, rank) =>
  adminFetch('POST', `/admin/partners/${id}/set-rank`, { rank })

// POST /api/admin/partners/subordinate/set
export const setPartnerSubordinate = (subordinate_id, parent_id) =>
  adminFetch('POST', '/admin/partners/subordinate/set', { subordinate_id, parent_id })

// ─── Commission Settings ──────────────────────────────────────────────────────
// GET /api/admin/commission-settings
export const getCommissionSettings = () =>
  adminFetch('GET', '/admin/commission-settings')

// POST /api/admin/commission-settings  — body: { rules: [...] }
export const updateCommissionSettings = (payload) =>
  adminFetch('POST', '/admin/commission-settings', payload)
