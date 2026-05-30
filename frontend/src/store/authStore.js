import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
        localStorage.setItem('access_token', token)
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      },
      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
      setToken: (token) => set({ token }),
    }),
    { name: 'auth-storage' }
  )
)

export default useAuthStore