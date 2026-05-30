import client from './client'

export const getDashboardStats = () => client.get('/analytics/dashboard')
export const getRevenueData = (params) => client.get('/analytics/revenue', { params })
export const getOrdersData = (params) => client.get('/analytics/orders', { params })
export const getUserAnalytics = (params) => client.get('/analytics/users', { params })
export const exportReport = (type, params) => client.get(`/analytics/export/${type}`, { params, responseType: 'blob' })