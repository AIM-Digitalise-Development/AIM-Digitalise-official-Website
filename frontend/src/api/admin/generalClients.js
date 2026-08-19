import client from '../client'

// General Clients API endpoints
export const getGeneralClients = () =>
  client.get('/admin/general-clients')

export const getGeneralClientById = (id) =>
  client.get(`/admin/general-clients/${id}`)

export const createGeneralClient = (data) =>
  client.post('/admin/general-clients', data)

export const updateGeneralClient = (id, data) =>
  client.put(`/admin/general-clients/${id}`, data)

export const updateGeneralClientStatus = (id, status) =>
  client.patch(`/admin/general-clients/${id}/status`, { status })

export const deleteGeneralClient = (id) =>
  client.delete(`/admin/general-clients/${id}`)

// General Services Catalog API endpoints (/admin/general-services)
export const getGeneralServices = () =>
  client.get('/admin/general-services')

export const getGeneralServiceById = (id) =>
  client.get(`/admin/general-services/${id}`)

export const createGeneralService = (data) =>
  client.post('/admin/general-services', data)

export const updateGeneralService = (id, data) =>
  client.put(`/admin/general-services/${id}`, data)

export const deleteGeneralService = (id) =>
  client.delete(`/admin/general-services/${id}`)

export const createQuotation = (clientId, data) =>
  client.post(`/admin/general-clients/${clientId}/quotations`, data)

export const sendQuotation = (quotationId) =>
  client.post(`/admin/quotations/${quotationId}/send`)

// Admin Invoice Download Link Generator
export const getAdminInvoiceDownloadUrl = (quotationId) => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('access_token') || ''
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'
  return `${baseUrl}/admin/quotations/${quotationId}/download-invoice?token=${token}`
}

// Public Quotation & Payment Endpoints (/api/public/...)
export const getPublicQuotation = (uuid) =>
  client.get(`/public/general-quotations/${uuid}`)

export const createPublicQuotationOrder = (uuid) =>
  client.post(`/public/general-quotations/${uuid}/create-order`)

export const verifyPublicQuotationPayment = (uuid, paymentData) =>
  client.post(`/public/general-quotations/${uuid}/verify-payment`, paymentData)

export const getPublicInvoiceDownloadUrl = (uuid) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'
  return `${baseUrl}/public/general-quotations/${uuid}/download-invoice`
}

// Country Taxes & Product Pricing Overrides APIs
export const getCountryTaxes = () =>
  client.get('/admin/country-taxes')

export const updateCountryTax = (id, data) =>
  client.put(`/admin/country-taxes/${id}`, data)

export const setCountryPrice = (productId, data) =>
  client.post(`/admin/products/${productId}/country-price`, data)

export const getPublicProductsForCountry = (countryCode = 'IN') =>
  client.get(`/public/subcategories-with-products?country=${countryCode}`)

export const getSubscriptionClients = () =>
  client.get('/admin/clients')

export const getDuePayments = () =>
  client.get('/admin/due-payments')



