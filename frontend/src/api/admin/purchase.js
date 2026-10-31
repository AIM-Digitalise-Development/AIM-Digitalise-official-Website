import client from '../client'

// Vendors API
export const getVendors = () => client.get('/admin/vendors')
export const createVendor = (data) => client.post('/admin/vendors', data)
export const deleteVendor = (id) => client.delete(`/admin/vendors/${id}`)

// Items API
export const getItems = () => client.get('/admin/items')
export const createItem = (data) => client.post('/admin/items', data)
export const deleteItem = (id) => client.delete(`/admin/items/${id}`)

// Purchases API
export const getPurchases = () => client.get('/admin/purchases')
export const createPurchase = (formData) =>
  client.post('/admin/purchases', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const deletePurchase = (id) => client.delete(`/admin/purchases/${id}`)
export const recordPurchasePayment = (id, data) => client.post(`/admin/purchases/${id}/payments`, data)

