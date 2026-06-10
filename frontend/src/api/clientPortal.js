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
