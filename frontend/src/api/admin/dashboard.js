import client from '../client'

// Admin dashboard endpoints
export const getDashboardStats = () => client.get('/admin/dashboard/stats')

export const getRevenueChart = (params) => 
  client.get('/admin/dashboard/revenue', { params })

export const getOrdersChart = (params) => 
  client.get('/admin/dashboard/orders', { params })

export const getRecentActivities = () => 
  client.get('/admin/dashboard/recent-activities')

export const getTopProducts = () => 
  client.get('/admin/dashboard/top-products')

export const getSystemHealth = () => 
  client.get('/admin/dashboard/system-health')