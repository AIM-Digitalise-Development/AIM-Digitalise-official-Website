import client from './client'

export const login = (email, password) => client.post('/auth/login', { email, password })
export const logout = () => client.post('/auth/logout')
export const refreshToken = (refreshToken) => client.post('/auth/refresh', { refresh_token: refreshToken })
export const getCurrentUser = () => client.get('/auth/me')
export const register = (userData) => client.post('/auth/register', userData)
export const forgotPassword = (email) => client.post('/auth/forgot-password', { email })
export const resetPassword = (token, password) => client.post('/auth/reset-password', { token, password })