import client from './client'

// Employee Login - POST /employee/login
// Body: { employee_id, dob }
export const employeeLogin = (employee_id, dob) =>
  client.post('/employee/login', { employee_id, dob })

// Employee Check Auth - GET /employee/check
export const checkEmployeeAuth = () =>
  client.get('/employee/check')

// Employee Get Profile - GET /employee/profile
export const getEmployeeProfile = () =>
  client.get('/employee/profile')

// Employee Update Profile - PUT /employee/profile
// Body: { phone, alternate_phone, current_address, bank_name, account_number, ifsc_code, upi_id }
export const updateEmployeeProfile = (data) =>
  client.put('/employee/profile', data)

// Employee Get Dashboard - GET /employee/dashboard
export const getEmployeeDashboard = () =>
  client.get('/employee/dashboard')

// Employee Logout - POST /employee/logout
export const employeeLogout = () =>
  client.post('/employee/logout')
