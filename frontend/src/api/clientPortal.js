import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'

const clientPortalFetch = async (method, path, data = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    method,
    url: `${API_BASE_URL}${path}`,
    headers,
  }

  if (data) {
    if (method === 'GET') {
      config.params = data
    } else {
      config.data = data
    }
  }

  const response = await axios(config)
  return response.data
}

export const clientLogin = (client_id, password) =>
  clientPortalFetch('POST', '/client/login', { client_id, password })

export const getClientProfile = (token) =>
  clientPortalFetch('GET', '/client/profile', null, token)

export const getClientProducts = (token) =>
  clientPortalFetch('GET', '/client/my-products', null, token)

export const clientLogout = (token) =>
  clientPortalFetch('POST', '/client/logout', null, token)

export const getClientStudentCount = (token) =>
  clientPortalFetch('GET', '/client/student-count', null, token)

export const getClientPaymentCycles = (token) =>
  clientPortalFetch('GET', '/client/payment-cycles', null, token)

export const calculateSubscription = (cycle, token) =>
  clientPortalFetch('GET', '/client/calculate-subscription', { cycle }, token)

export const createSubscriptionOrder = (cycle, token) =>
  clientPortalFetch('POST', '/client/create-subscription-order', { cycle }, token)

export const verifySubscriptionPayment = (paymentData, token) =>
  clientPortalFetch('POST', '/client/verify-subscription-payment', paymentData, token)

