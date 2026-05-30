import { PERMISSIONS } from '../constants/roles'

export const canAccess = (userRole, requiredPermission) => {
  if (!userRole) return false
  const userPermissions = PERMISSIONS[userRole] || []
  return userPermissions.includes('*') || userPermissions.includes(requiredPermission)
}

export const canAccessAny = (userRole, requiredPermissions) => {
  if (!userRole) return false
  const userPermissions = PERMISSIONS[userRole] || []
  if (userPermissions.includes('*')) return true
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

export const canAccessAll = (userRole, requiredPermissions) => {
  if (!userRole) return false
  const userPermissions = PERMISSIONS[userRole] || []
  if (userPermissions.includes('*')) return true
  return requiredPermissions.every(permission => userPermissions.includes(permission))
}