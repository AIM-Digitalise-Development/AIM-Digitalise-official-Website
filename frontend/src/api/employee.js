import client from './client'

// Employee Login - POST /employee/login
// Body: { employee_id, dob }
export const employeeLogin = (employee_id, dob) =>
  client.post('/employee/login', { employee_id, dob })

// Employee Check Auth - GET /employee/check
export const checkEmployeeAuth = () =>
  client.get('/employee/check')

// Employee Get Profile - GET /employee/profile
export const getEmployeeProfile = () =>
  client.get('/employee/profile')

// Employee Update Profile - PUT /employee/profile
// Body: { phone, alternate_phone, current_address, bank_name, account_number, ifsc_code, upi_id }
export const updateEmployeeProfile = (data) =>
  client.put('/employee/profile', data)

// Employee Get Dashboard - GET /employee/dashboard
export const getEmployeeDashboard = () =>
  client.get('/employee/dashboard')

// Employee Logout - POST /employee/logout
export const employeeLogout = () =>
  client.post('/employee/logout')

// Employee General Services Catalog - GET /employee/general-services
export const getEmployeeGeneralServices = () =>
  client.get('/employee/general-services')

export const getEmployeeGeneralServiceById = (id) =>
  client.get(`/employee/general-services/${id}`)

export const createEmployeeGeneralService = (data) =>
  client.post('/employee/general-services', data)

export const updateEmployeeGeneralService = (id, data) =>
  client.put(`/employee/general-services/${id}`, data)

export const deleteEmployeeGeneralService = (id) =>
  client.delete(`/employee/general-services/${id}`)

// Employee General Clients - GET /employee/general-clients
export const getEmployeeGeneralClients = () =>
  client.get('/employee/general-clients')

// Employee General Client Details - GET /employee/general-clients/:id
export const getEmployeeGeneralClientById = (id) =>
  client.get(`/employee/general-clients/${id}`)

// Employee Create General Client - POST /employee/general-clients
export const createEmployeeGeneralClient = (data) =>
  client.post('/employee/general-clients', data)

// Employee Update General Client - PUT /employee/general-clients/:id
export const updateEmployeeGeneralClient = (id, data) =>
  client.put(`/employee/general-clients/${id}`, data)

// Employee Update General Client Status - PATCH /employee/general-clients/:id/status
export const updateEmployeeGeneralClientStatus = (id, status) =>
  client.patch(`/employee/general-clients/${id}/status`, { status })

// Employee Delete General Client - DELETE /employee/general-clients/:id
export const deleteEmployeeGeneralClient = (id) =>
  client.delete(`/employee/general-clients/${id}`)

// Employee Create Quotation for General Client - POST /employee/general-clients/:clientId/quotation
export const createEmployeeQuotation = (clientId, data) =>
  client.post(`/employee/general-clients/${clientId}/quotation`, data)

// Employee Send Quotation Email & Get Razorpay Link - POST /employee/general-clients/quotations/:quotationId/send-email
export const sendEmployeeQuotation = (quotationId) =>
  client.post(`/employee/general-clients/quotations/${quotationId}/send-email`)

// Employee Invoice Download Link Generator
export const getEmployeeInvoiceDownloadUrl = (quotationId) => {
  const token = localStorage.getItem('employee_token') || localStorage.getItem('access_token') || ''
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'
  return `${baseUrl}/employee/general-clients/quotations/${quotationId}/download-invoice?token=${token}`
}

// Employee Record Manual Payment - POST /employee/general-clients/quotations/:quotationId/record-payment
export const recordEmployeeQuotationPayment = (quotationId, data) =>
  client.post(`/employee/general-clients/quotations/${quotationId}/record-payment`, data)

// Employee Convert Lead to Client - POST /employee/leads/:leadId/convert
export const convertLeadToClient = (leadId) =>
  client.post(`/employee/leads/${leadId}/convert`)

// Employee Assign Demo Slot to Lead - POST /employee/leads/:leadId/assign-demo-slot
export const assignDemoSlotToLead = (leadId, demoSlotId) =>
  client.post(`/employee/leads/${leadId}/assign-demo-slot`, { demo_slot_id: demoSlotId })

// Country Taxes & Public Pricing
export const getCountryTaxes = () => client.get('/country-taxes')
export const updateCountryTax = (id, data) => client.put(`/country-taxes/${id}`, data)
export const setCountryPrice = (productId, data) => client.post(`/admin/products/${productId}/country-price`, data)
export const getPublicProductsForCountry = (countryCode = 'IN') =>
  client.get(`/public/products?country=${countryCode}`)
export const getSubscriptionClients = () => client.get('/employee/subscription-clients')

