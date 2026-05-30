import client from './client'

export const getEarnings = () => client.get('/partner/earnings')
export const getPayouts = () => client.get('/partner/payouts')
export const requestPayout = (data) => client.post('/partner/payouts', data)
export const getPartnerStats = () => client.get('/partner/stats')
export const updatePartnerProfile = (data) => client.put('/partner/profile', data)