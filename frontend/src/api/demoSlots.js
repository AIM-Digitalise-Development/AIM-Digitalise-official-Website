import client from './client'

// Create Demo Slot - POST /employee/demo-slots
export const createDemoSlot = (data) =>
  client.post('/employee/demo-slots', data)

// Get All Demo Slots - GET /employee/demo-slots
// query params: demo_type, is_active, search
export const getDemoSlots = (params = {}) =>
  client.get('/employee/demo-slots', { params })

// Update Demo Slot - PUT /employee/demo-slots/{id}
export const updateDemoSlot = (id, data) =>
  client.put(`/employee/demo-slots/${id}`, data)

// Toggle Demo Slot Status - POST /employee/demo-slots/{id}/toggle-status
export const toggleDemoSlotStatus = (id) =>
  client.post(`/employee/demo-slots/${id}/toggle-status`)

// Delete Demo Slot - DELETE /employee/demo-slots/{id}
export const deleteDemoSlot = (id) =>
  client.delete(`/employee/demo-slots/${id}`)

// Get Demo Slot Statistics - GET /employee/demo-slots/stats
export const getDemoStats = () =>
  client.get('/employee/demo-slots/stats')
