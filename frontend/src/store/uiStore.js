import { create } from 'zustand'

const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  toast: null,
  showToast: (message, type = 'info') => set({ toast: { message, type, id: Date.now() } }),
  hideToast: () => set({ toast: null }),
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}))

export default useUIStore