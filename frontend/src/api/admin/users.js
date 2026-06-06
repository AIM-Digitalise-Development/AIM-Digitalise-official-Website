import client from '../client'

// Admin user management endpoints
// Routes are prefixed /api/users/* (protected by admin.token middleware)
export const getUsers = (params) =>
  client.get('/users', { params })

export const getUserById = (id) =>
  client.get(`/users/${id}`)

export const createUser = (data) =>
  client.post('/users', data)

export const updateUser = (id, data) =>
  client.put(`/users/${id}`, data)

export const deleteUser = (id) =>
  client.delete(`/users/${id}`)