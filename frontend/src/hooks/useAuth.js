import useAuthStore from '../store/authStore'

export const useAuth = () => {
  const { user, token, isAuthenticated, role, login, logout, updateUser, setToken, adminLogin } = useAuthStore()
  return { user, token, isAuthenticated, role, login, logout, updateUser, setToken, adminLogin }
}