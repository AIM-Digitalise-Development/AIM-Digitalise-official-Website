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
