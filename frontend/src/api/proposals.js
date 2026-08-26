import client from './client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'

// Helper for admin fetch with Bearer token
const adminFetch = async (method, path, body = null) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('admin_token')
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const response = await fetch(`${API_BASE_URL}${path}`, options)
  const data = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`)
    error.response = { data, status: response.status }
    throw error
  }
  return data
}

// ── Public Proposal Endpoints (Client Flow) ───────────────────

/**
 * 1. Request Email OTP
 * POST /api/public/proposals/send-otp
 * Body: { email: string }
 */
export const sendProposalOtp = async (email) => {
  try {
    const response = await client.post('/public/proposals/send-otp', { email })
    return response.data
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.'
    throw new Error(msg)
  }
}

/**
 * 2. Verify OTP
 * POST /api/public/proposals/verify-otp
 * Body: { email: string, otp: string }
 */
export const verifyProposalOtp = async (email, otp) => {
  try {
    const response = await client.post('/public/proposals/verify-otp', { email, otp })
    return response.data
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Invalid or expired OTP.'
    throw new Error(msg)
  }
}

/**
 * 3. Submit Proposal Details
 * POST /api/public/proposals
 * Body: { school_name, address, principal_name, email, contact_no }
 */
export const submitProposal = async (proposalData) => {
  try {
    const response = await client.post('/public/proposals', proposalData)
    return response.data
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Failed to submit proposal request.'
    throw new Error(msg)
  }
}

// ── Admin Proposal Endpoints (Admin Portal Flow) ──────────────

/**
 * 4. Fetch Proposals List
 * GET /api/admin/proposals
 */
export const getAdminProposals = async () => {
  try {
    const response = await client.get('/admin/proposals')
    return response.data
  } catch (error) {
    return await adminFetch('GET', '/admin/proposals')
  }
}

/**
 * 5. Send Proposal Email (Admin Action)
 * POST /api/admin/proposals/{id}/send-email
 */
export const sendProposalEmail = async (id) => {
  try {
    const response = await client.post(`/admin/proposals/${id}/send-email`)
    return response.data
  } catch (error) {
    return await adminFetch('POST', `/admin/proposals/${id}/send-email`)
  }
}
