import client from './client'

// Create Lead - POST /employee/leads
export const createLead = (data) =>
  client.post('/employee/leads', data)

// Get All Leads - GET /employee/leads
// query parameters: status, priority, search, date_from, date_to, follow_up_today, pending_follow_up, per_page, page
export const getLeads = (params = {}) =>
  client.get('/employee/leads', { params })

// Get Lead Details - GET /employee/leads/{id}
export const getLeadDetails = (id) =>
  client.get(`/employee/leads/${id}`)

// Update Lead - PUT /employee/leads/{id}
export const updateLead = (id, data) =>
  client.put(`/employee/leads/${id}`, data)

// Update Lead Status - PUT /employee/leads/{id}/status
// Body: { status, notes, lost_reason }
export const updateLeadStatus = (id, data) =>
  client.put(`/employee/leads/${id}/status`, data)

// Add Lead Activity - POST /employee/leads/{id}/activity
// Body: { activity_type, description, notes, scheduled_date }
export const addLeadActivity = (id, data) =>
  client.post(`/employee/leads/${id}/activity`, data)

// Get Lead Statistics - GET /employee/leads/stats
export const getLeadStats = () =>
  client.get('/employee/leads/stats')

// Bulk Assign Leads - POST /employee/leads/bulk-assign
// Body: { lead_ids, assigned_to, notes }
export const bulkAssignLeads = (data) =>
  client.post('/employee/leads/bulk-assign', data)

// Delete Lead - DELETE /employee/leads/{id}
export const deleteLead = (id) =>
  client.delete(`/employee/leads/${id}`)
