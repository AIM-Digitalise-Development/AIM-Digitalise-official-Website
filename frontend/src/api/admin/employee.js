// Admin Employee Management API
// Departments, Designations & Employees CRUD
// Base: https://api.nexgn.in/api

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
  return data
}

// ─── Dashboard / Stats ────────────────────────────────────────────────────────
// GET /api/admin/dashboard
export const fetchDashboard = () =>
  adminFetch('GET', '/admin/dashboard')

// ─── Departments ──────────────────────────────────────────────────────────────
// GET /api/admin/departments
export const fetchDepartments = () =>
  adminFetch('GET', '/admin/departments')

// POST /api/admin/departments  — body: { name, description }
export const createDepartment = (payload) =>
  adminFetch('POST', '/admin/departments', payload)

// PUT /api/admin/departments/{id}  — body: { name, description }
export const updateDepartment = (id, payload) =>
  adminFetch('PUT', `/admin/departments/${id}`, payload)

// DELETE /api/admin/departments/{id}
export const deleteDepartment = (id) =>
  adminFetch('DELETE', `/admin/departments/${id}`)

// ─── Designations ─────────────────────────────────────────────────────────────
// GET /api/admin/designations
export const fetchDesignations = () =>
  adminFetch('GET', '/admin/designations')

// POST /api/admin/designations  — body: { name, department_id, description }
export const createDesignation = (payload) =>
  adminFetch('POST', '/admin/designations', payload)

// PUT /api/admin/designations/{id}
export const updateDesignation = (id, payload) =>
  adminFetch('PUT', `/admin/designations/${id}`, payload)

// DELETE /api/admin/designations/{id}
export const deleteDesignation = (id) =>
  adminFetch('DELETE', `/admin/designations/${id}`)

// ─── Employees ────────────────────────────────────────────────────────────────
// GET /api/admin/employees?search=&department_id=&designation_id=&employment_status=
export const fetchEmployees = (filters = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, val]) => {
    if (val) params.append(key, val)
  })
  const qs = params.toString()
  return adminFetch('GET', `/admin/employees${qs ? `?${qs}` : ''}`)
}

// GET /api/admin/employees/{id}
export const fetchEmployeeById = (id) =>
  adminFetch('GET', `/admin/employees/${id}`)

// GET /api/admin/employees/stats
export const fetchEmployeeStats = () =>
  adminFetch('GET', '/admin/employees/stats')

// POST /api/admin/employees  — body: full employee payload
export const createEmployee = (payload) =>
  adminFetch('POST', '/admin/employees', payload)

// PUT /api/admin/employees/{id}
export const updateEmployee = (id, payload) =>
  adminFetch('PUT', `/admin/employees/${id}`, payload)

// DELETE /api/admin/employees/{id}
export const deleteEmployee = (id) =>
  adminFetch('DELETE', `/admin/employees/${id}`)
