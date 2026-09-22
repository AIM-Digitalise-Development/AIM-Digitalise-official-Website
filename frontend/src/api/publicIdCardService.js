import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'

export const createPublicIdCardOrder = async (orderPayload) => {
  const response = await axios.post(`${API_BASE_URL}/public/id-card-orders/create`, orderPayload, {
    headers: { 'Content-Type': 'application/json' }
  })
  return response.data
}

export const verifyPublicIdCardPayment = async (paymentPayload) => {
  const response = await axios.post(`${API_BASE_URL}/public/id-card-orders/verify`, paymentPayload, {
    headers: { 'Content-Type': 'application/json' }
  })
  return response.data
}
