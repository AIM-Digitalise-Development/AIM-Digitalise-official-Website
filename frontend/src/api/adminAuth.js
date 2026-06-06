import client from './client'

// Admin login — POST /api/admin/login
// Response: { success, data: { admin: { id, name, email, role, is_active, last_login_at, ... }, token } }
export const adminLogin = (email, password) =>
  client.post('/admin/login', { email, password })

// Admin logout — POST /api/admin/logout (sends Bearer token)
export const adminLogout = () =>
  client.post('/admin/logout')

// Admin profile — GET /api/admin/profile
// Response: { success, data: { id, name, email, role, is_active, last_login_at, ... } }
export const getAdminProfile = () =>
  client.get('/admin/profile')

// Check auth — GET /api/admin/check
// Response: { success, authenticated, data: { id, name, email, role, is_active } }
export const checkAdminAuth = () =>
  client.get('/admin/check')