import client from '../client'

// Admin system settings endpoints
export const getSettings = () => 
  client.get('/admin/settings')

export const updateGeneralSettings = (data) => 
  client.put('/admin/settings/general', data)

export const updateSecuritySettings = (data) => 
  client.put('/admin/settings/security', data)

export const updateNotificationSettings = (data) => 
  client.put('/admin/settings/notifications', data)

export const updateApiSettings = (data) => 
  client.put('/admin/settings/api', data)

export const clearCache = () => 
  client.post('/admin/settings/clear-cache')

export const runBackup = () => 
  client.post('/admin/settings/backup')