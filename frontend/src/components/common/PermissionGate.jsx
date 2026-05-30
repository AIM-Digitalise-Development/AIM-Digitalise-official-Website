import { useAuth } from '../../hooks/useAuth'

export const PermissionGate = ({ roles, permissions, children, fallback = null }) => {
  const { user } = useAuth()
  
  if (!user) return fallback
  
  const hasRole = roles ? roles.includes(user.role) : true
  const hasPermission = permissions ? checkPermissions(user.role, permissions) : true
  
  if (!hasRole || !hasPermission) return fallback
  
  return <>{children}</>
}

const checkPermissions = (role, requiredPermissions) => {
  // Add your permission checking logic here
  return true
}