

import axios from 'axios'
import { getMockResponse } from '../utils/mockAuthData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If network fails (no response) or server error/route not found (5xx, 404), try mock fallback
    if (originalRequest && (!error.response || error.response.status >= 500 || error.response.status === 404)) {
      try {
        let requestData = null
        if (originalRequest.data) {
          try {
            requestData = typeof originalRequest.data === 'string' 
              ? JSON.parse(originalRequest.data) 
              : originalRequest.data
          } catch (_) {
            requestData = originalRequest.data
          }
        }
        
        const mockData = getMockResponse(originalRequest.url, originalRequest.method, requestData)
        if (mockData) {
          console.warn(`[Axios Fallback] Live request failed for ${originalRequest.url}. Using simulated mock data.`)
          return { data: mockData, status: 200, statusText: 'OK', headers: {}, config: originalRequest }
        }
      } catch (mockError) {
        console.error('Failed to resolve Axios mock fallback:', mockError)
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })
        localStorage.setItem('access_token', response.data.access_token)
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`
        return client(originalRequest)
      } catch (refreshError) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default client