import { useAuth } from './useAuth'
import { PERMISSIONS } from '../constants/roles'

export const useRoleAccess = () => {
  const { user } = useAuth()

  const hasPermission = (permission) => {
    if (!user) return false
    const userPermissions = PERMISSIONS[user.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }

  const hasRole = (roles) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const hasAnyRole = (roles) => {
    if (!user) return false
    return roles.some(role => role === user.role)
  }

  const hasAllRoles = (roles) => {
    if (!user) return false
    return roles.every(role => role === user.role)
  }

  return { hasPermission, hasRole, hasAnyRole, hasAllRoles, userRole: user?.role }
}