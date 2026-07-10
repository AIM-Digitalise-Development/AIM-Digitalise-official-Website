import axios from 'axios'
import { getMockResponse } from '../utils/mockAuthData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'

const clientPortalFetch = async (method, path, data = null, token = null) => {
  // If mock token is used, skip live API request to avoid 401/Unauthorized errors in development
  if (token && token.startsWith('mock-')) {
    const mockData = getMockResponse(path, method, data)
    if (mockData) {
      console.warn(`[Client Portal Mock] Bypassing live request for ${path} due to mock token.`)
      return mockData
    }
  }

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

export const createSubscriptionOrder = (cycle, token, amount = null) =>
  clientPortalFetch('POST', '/client/create-subscription-order', { cycle, ...(amount !== null ? { amount: Math.round(amount) } : {}) }, token)

export const verifySubscriptionPayment = (paymentData, token) =>
  clientPortalFetch('POST', '/client/verify-subscription-payment', paymentData, token)

export const getClientPaymentStatus = (token) =>
  clientPortalFetch('GET', '/client/payment-status', null, token)

export const getClientPaymentHistory = (token) =>
  clientPortalFetch('GET', '/client/payment-history', null, token)

export const getClientCustomizationRequests = (token) =>
  clientPortalFetch('GET', '/client/customization/requests', null, token)

export const submitClientCustomizationRequest = (customizationText, token) =>
  clientPortalFetch('POST', '/client/customization/submit', { customization_text: customizationText }, token)

export const getClientPendingCustomizationPayments = (token) =>
  clientPortalFetch('GET', '/client/customization/pending-payments', null, token)

export const getClientCustomPaymentHistory = (token) =>
  clientPortalFetch('GET', '/client/customization/payment-history', null, token)

export const createCustomizationPaymentOrder = (requestId, token) =>
  clientPortalFetch('POST', '/client/customization/create-payment-order', { customization_request_id: requestId }, token)

export const verifyCustomizationPayment = (paymentData, token) =>
  clientPortalFetch('POST', '/client/customization/verify-payment', paymentData, token)
