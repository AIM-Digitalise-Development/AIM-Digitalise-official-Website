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

  // Caching states
  profileFetched: false,
  orders: null,
  ordersSummary: null,
  leads: null,
  payouts: null,
  payoutBalance: null,
  tickets: null,
  renewals: null,
  dashboardStats: null,
  commissionReport: null,
  subordinatesData: null,

  partnerLogin: (user, token) => {
    localStorage.setItem(PARTNER_TOKEN_KEY, token)
    localStorage.setItem(PARTNER_USER_KEY, JSON.stringify(user))
    set({ 
      partnerToken: token, 
      partnerUser: user, 
      isPartnerAuthenticated: true,
      profileFetched: false,
      orders: null,
      ordersSummary: null,
      leads: null,
      payouts: null,
      payoutBalance: null,
      tickets: null,
      renewals: null,
      dashboardStats: null,
      commissionReport: null,
      subordinatesData: null,
    })
  },

  partnerLogout: () => {
    localStorage.removeItem(PARTNER_TOKEN_KEY)
    localStorage.removeItem(PARTNER_USER_KEY)
    set({ 
      partnerToken: null, 
      partnerUser: null, 
      isPartnerAuthenticated: false,
      profileFetched: false,
      orders: null,
      ordersSummary: null,
      leads: null,
      payouts: null,
      payoutBalance: null,
      tickets: null,
      renewals: null,
      dashboardStats: null,
      commissionReport: null,
      subordinatesData: null,
    })
  },

  setPartnerUser: (user) => {
    try {
      const existing = localStorage.getItem(PARTNER_USER_KEY) ? JSON.parse(localStorage.getItem(PARTNER_USER_KEY)) : {}
      const merged = { ...existing, ...user }
      localStorage.setItem(PARTNER_USER_KEY, JSON.stringify(merged))
      set({ partnerUser: merged, profileFetched: true })
    } catch (_) {
      set({ partnerUser: user, profileFetched: true })
    }
  },
  setOrders: (orders) => set({ orders }),
  setOrdersSummary: (ordersSummary) => set({ ordersSummary }),
  setLeads: (leads) => set({ leads }),
  setPayouts: (payouts) => set({ payouts }),
  setPayoutBalance: (payoutBalance) => set({ payoutBalance }),
  setTickets: (tickets) => set({ tickets }),
  setRenewals: (renewals) => set({ renewals }),
  setDashboardStats: (dashboardStats) => set({ dashboardStats }),
  setCommissionReport: (commissionReport) => set({ commissionReport }),
  setSubordinatesData: (subordinatesData) => set({ subordinatesData }),
}))
