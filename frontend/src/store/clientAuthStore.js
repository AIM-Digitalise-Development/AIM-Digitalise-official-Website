import { create } from 'zustand'

const CLIENT_TOKEN_KEY = 'client_token'
const CLIENT_USER_KEY = 'client_user'

// Hydrate from localStorage on startup
const storedToken = localStorage.getItem(CLIENT_TOKEN_KEY) || null
const storedUser = (() => {
  try {
    const raw = localStorage.getItem(CLIENT_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
})()

export const useClientAuthStore = create((set) => ({
  clientToken: storedToken,
  clientUser: storedUser,
  isClientAuthenticated: !!storedToken,

  // Caching states
  profileFetched: false,
  profileData: null,
  productsFetched: false,
  productData: null,

  clientLogin: (user, token) => {
    localStorage.setItem(CLIENT_TOKEN_KEY, token)
    localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(user))
    set({
      clientToken: token,
      clientUser: user,
      isClientAuthenticated: true,
      profileFetched: false,
      profileData: null,
      productsFetched: false,
      productData: null,
    })
  },

  clientLogout: () => {
    localStorage.removeItem(CLIENT_TOKEN_KEY)
    localStorage.removeItem(CLIENT_USER_KEY)
    set({
      clientToken: null,
      clientUser: null,
      isClientAuthenticated: false,
      profileFetched: false,
      profileData: null,
      productsFetched: false,
      productData: null,
    })
  },

  setProfileData: (profileData) => set({ profileData, profileFetched: true }),
  setProductData: (productData) => set({ productData, productsFetched: true }),
}))
