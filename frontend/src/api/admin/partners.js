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
// GET /api/admin/products?active=&category_id=&sub_category_id=&search=
export const getAdminProducts = (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.active !== undefined && filters.active !== '') params.append('active', filters.active)
  if (filters.category_id) params.append('category_id', filters.category_id)
  if (filters.sub_category_id) params.append('sub_category_id', filters.sub_category_id)
  if (filters.search) params.append('search', filters.search)
  const qs = params.toString()
  return adminFetch('GET', `/admin/products${qs ? '?' + qs : ''}`)
}

// PUT /api/admin/products/{id}/discounts
// body: { monthly_discount, quarterly_discount, half_yearly_discount, annual_discount }
export const updateProductDiscounts = (id, discounts) =>
  adminFetch('PUT', `/admin/products/${id}/discounts`, discounts)

// POST /api/admin/products  — body: { name, category_id, sub_category_id, processing_fee, monthly_subscription, per_person, description, ... }
export const createAdminProduct = (data) =>
  adminFetch('POST', '/admin/products', data)

// PUT /api/admin/products/{id}
export const updateAdminProduct = (id, data) =>
  adminFetch('PUT', `/admin/products/${id}`, data)

// POST /api/admin/products/{id}/toggle-status
export const toggleProductStatus = (id) =>
  adminFetch('POST', `/admin/products/${id}/toggle-status`)

// DELETE /api/admin/products/{id}
export const deleteAdminProduct = (id) =>
  adminFetch('DELETE', `/admin/products/${id}`)

// ─── Product Categories ───────────────────────────────────────────────────────
// GET /api/admin/product-categories
export const getAdminProductCategories = () =>
  adminFetch('GET', '/admin/product-categories')

// POST /api/admin/product-categories  — body: { name, description, is_active }
export const createProductCategory = (data) =>
  adminFetch('POST', '/admin/product-categories', data)

// PUT /api/admin/product-categories/{id}
export const updateProductCategory = (id, data) =>
  adminFetch('PUT', `/admin/product-categories/${id}`, data)

// POST /api/admin/product-categories/{id}/toggle-status
export const toggleCategoryStatus = (id) =>
  adminFetch('POST', `/admin/product-categories/${id}/toggle-status`)

// DELETE /api/admin/product-categories/{id}
export const deleteProductCategory = (id) =>
  adminFetch('DELETE', `/admin/product-categories/${id}`)

// ─── Sub-Categories ───────────────────────────────────────────────────────────
// GET /api/admin/sub-categories
export const getAdminSubCategories = () =>
  adminFetch('GET', '/admin/sub-categories')

// POST /api/admin/sub-categories  — body: { name, category_id, description, is_active }
export const createSubCategory = (data) =>
  adminFetch('POST', '/admin/sub-categories', data)

// PUT /api/admin/sub-categories/{id}
export const updateSubCategory = (id, data) =>
  adminFetch('PUT', `/admin/sub-categories/${id}`, data)

// POST /api/admin/sub-categories/{id}/toggle-status
export const toggleSubCategoryStatus = (id) =>
  adminFetch('POST', `/admin/sub-categories/${id}/toggle-status`)

// DELETE /api/admin/sub-categories/{id}
export const deleteSubCategory = (id) =>
  adminFetch('DELETE', `/admin/sub-categories/${id}`)

// ─── Subscriptions ────────────────────────────────────────────────────────────
// GET /api/admin/subscriptions
export const getAdminSubscriptions = () =>
  adminFetch('GET', '/admin/subscriptions')

// POST /api/admin/subscriptions/{id}/activate
export const activateSubscription = (id) =>
  adminFetch('POST', `/admin/subscriptions/${id}/activate`)

// POST /api/admin/subscriptions/{id}/deactivate
export const deactivateSubscription = (id) =>
  adminFetch('POST', `/admin/subscriptions/${id}/deactivate`)

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

// ─── Customization Requests ───────────────────────────────────────────────────
// GET /api/admin/customization/requests?status=&search=
export const getAdminCustomizationRequests = (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.status) params.append('status', filters.status)
  if (filters.search) params.append('search', filters.search)
  const qs = params.toString()
  return adminFetch('GET', `/admin/customization/requests${qs ? '?' + qs : ''}`)
}

// POST /api/admin/customization/requests/{id}/set-amount  — body: { amount, admin_notes }
export const setCustomizationAmount = (id, amount, adminNotes) =>
  adminFetch('POST', `/admin/customization/requests/${id}/set-amount`, { amount, admin_notes: adminNotes })

// POST /api/admin/customization/requests/{id}/update-status  — body: { status, admin_notes }
export const updateCustomizationStatus = (id, status, adminNotes) =>
  adminFetch('POST', `/admin/customization/requests/${id}/update-status`, { status, admin_notes: adminNotes })

// ─── Admin Addon Payments ─────────────────────────────────────────────────────
// GET /api/admin/addon/payments?search=&addon_type=&status=&client_id=
export const getAdminAddonPayments = (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.search)     params.append('search', filters.search)
  if (filters.addon_type) params.append('addon_type', filters.addon_type)
  if (filters.status)     params.append('status', filters.status)
  if (filters.client_id)  params.append('client_id', filters.client_id)
  const qs = params.toString()
  return adminFetch('GET', `/admin/addon/payments${qs ? '?' + qs : ''}`)
}

// GET /api/admin/addon/stats
export const getAdminAddonStats = () =>
  adminFetch('GET', '/admin/addon/stats')
