import client from '../client'

// Admin user management endpoints
export const getUsers = (params) => 
  client.get('/admin/users', { params })  // Paginated, filtered

export const getUserById = (id) => 
  client.get(`/admin/users/${id}`)

export const createUser = (data) => 
  client.post('/admin/users', data)

export const updateUser = (id, data) => 
  client.put(`/admin/users/${id}`, data)

export const deleteUser = (id) => 
  client.delete(`/admin/users/${id}`)

export const updateUserRole = (id, role) => 
  client.patch(`/admin/users/${id}/role`, { role })

export const banUser = (id) => 
  client.post(`/admin/users/${id}/ban`)

export const unbanUser = (id) => 
  client.post(`/admin/users/${id}/unban`)

export const exportUsers = (format = 'csv') => 
  client.get('/admin/users/export', { 
    params: { format },
    responseType: 'blob' 
  })