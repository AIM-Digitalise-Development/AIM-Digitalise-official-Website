export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  PARTNER: 'partner',
  CUSTOMER: 'customer',
  GUEST: 'guest',
}

export const PERMISSIONS = {
  [ROLES.ADMIN]: ['*'], // Full access
  [ROLES.EMPLOYEE]: ['view_tasks', 'edit_tasks', 'view_timesheet', 'log_time', 'view_dashboard'],
  [ROLES.PARTNER]: ['view_orders', 'edit_orders', 'view_earnings', 'request_payout', 'view_dashboard'],
  [ROLES.CUSTOMER]: ['view_products', 'place_orders', 'view_order_history', 'edit_profile', 'view_dashboard'],
  [ROLES.GUEST]: ['view_products'],
}