// src/store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,                   // optional: track role explicitly

      // Generic login (can be used for token-based or session-based)
      login: (user, token) => {
        set({
          user,
          token: token || null,    // null for session-based auth
          isAuthenticated: true,
          role: user?.role || null,
        })
        if (token) {
          localStorage.setItem('access_token', token)
        }
        // No token removal here because admin might have no token
      },

      // Convenience method for admin session login
      adminLogin: (user) => {
        set({
          user,
          token: null,
          isAuthenticated: true,
          role: 'admin',
        })
        // ensure no stale token
        localStorage.removeItem('access_token')
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, role: null })
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      },

      updateUser: (userData) =>
        set((state) => ({ user: { ...state.user, ...userData } })),

      setToken: (token) => set({ token }),
    }),
    { name: 'auth-storage' }
  )
)

export default useAuthStore