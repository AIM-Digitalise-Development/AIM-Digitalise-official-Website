import client from '../client'

// General Clients API endpoints
export const getGeneralClients = () =>
  client.get('/admin/general-clients')

export const getGeneralClientById = (id) =>
  client.get(`/admin/general-clients/${id}`)

export const createGeneralClient = (data) =>
  client.post('/admin/general-clients', data)

export const deleteGeneralClient = (id) =>
  client.delete(`/admin/general-clients/${id}`)

export const createQuotation = (clientId, data) =>
  client.post(`/admin/general-clients/${clientId}/quotations`, data)

export const sendQuotation = (quotationId) =>
  client.post(`/admin/quotations/${quotationId}/send`)

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
