import { create } from 'zustand'

const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  theme: localStorage.getItem('theme') || 'dark',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    set({ theme })
  },
  toast: null,
  showToast: (message, type = 'info') => set({ toast: { message, type, id: Date.now() } }),
  hideToast: () => set({ toast: null }),
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  
  // Appointment modal state
  appointmentModalOpen: false,
  openAppointmentModal: () => set({ appointmentModalOpen: true }),
  closeAppointmentModal: () => set({ appointmentModalOpen: false }),
}))

export default useUIStore