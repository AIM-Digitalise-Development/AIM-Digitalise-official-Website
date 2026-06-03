const PARTNER_API = import.meta.env.VITE_PARTNER_API_URL || 'https://api.nexgn.in/api'

// Helper: build an admin-to-partner API fetch wrapper
const adminPartnerFetch = async (method, path, body = null) => {
  const token = localStorage.getItem('access_token') // admin auth token
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const response = await fetch(`${PARTNER_API}${path}`, options)
  const data = await response.json()
  if (!response.ok) {
    const error = new Error(data?.message || 'Admin Partner Request failed')
    error.response = { data, status: response.status }
    throw error
  }
  return { data }
}

// ─── Get all partners ────────────────────────────────────────────────────────
export const getAdminPartners = () =>
  adminPartnerFetch('GET', '/admin/partners')

// ─── Get partner details ─────────────────────────────────────────────────────
export const getAdminPartnerById = (id) =>
  adminPartnerFetch('GET', `/admin/partners/${id}`)

// ─── Update partner registration status ──────────────────────────────────────
// status: 'active', 'suspended', 'pending'
export const updatePartnerRegistrationStatus = (id, status) =>
  adminPartnerFetch('POST', `/admin/partners/${id}/status`, { status })
