import { create } from 'zustand'

const PARTNER_TOKEN_KEY = 'partner_token'
const PARTNER_USER_KEY = 'partner_user'

// Hydrate from localStorage on startup
const storedToken = localStorage.getItem(PARTNER_TOKEN_KEY) || null
const storedUser = (() => {
  try {
    const raw = localStorage.getItem(PARTNER_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
})()

export const usePartnerAuthStore = create((set) => ({
  partnerToken: storedToken,
  partnerUser: storedUser,
  isPartnerAuthenticated: !!storedToken,

  partnerLogin: (user, token) => {
    localStorage.setItem(PARTNER_TOKEN_KEY, token)
    localStorage.setItem(PARTNER_USER_KEY, JSON.stringify(user))
    set({ partnerToken: token, partnerUser: user, isPartnerAuthenticated: true })
  },

  partnerLogout: () => {
    localStorage.removeItem(PARTNER_TOKEN_KEY)
    localStorage.removeItem(PARTNER_USER_KEY)
    set({ partnerToken: null, partnerUser: null, isPartnerAuthenticated: false })
  },

  setPartnerUser: (user) => set({ partnerUser: user }),
}))
