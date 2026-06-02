// src/api/adminAuth.js
import client from './client'

export const adminLogin = (email, password) =>
  client.post('/admin/login', { email, password })

export const adminLogout = () =>
  client.post('/admin/logout')

export const getAdminProfile = () =>
  client.get('/admin/profile')

export const checkAdminAuth = () =>
  client.get('/admin/check')