import useAuthStore from '../store/authStore'

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, updateUser, setToken } = useAuthStore()
  return { user, token, isAuthenticated, login, logout, updateUser, setToken }
}