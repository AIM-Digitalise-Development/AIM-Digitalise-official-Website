import client from './client'

export const getOrders = (params) => client.get('/orders', { params })
export const getOrderById = (id) => client.get(`/orders/${id}`)
export const createOrder = (data) => client.post('/orders', data)
export const updateOrder = (id, data) => client.put(`/orders/${id}`, data)
export const deleteOrder = (id) => client.delete(`/orders/${id}`)
export const cancelOrder = (id) => client.post(`/orders/${id}/cancel`)
export const getOrderStatus = (id) => client.get(`/orders/${id}/status`)