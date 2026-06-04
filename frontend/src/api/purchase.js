/**
 * purchase.js
 * Public purchase API — no auth token required.
 * Uses the base URL already configured in client.js (https://api.nexgn.in/api)
 */

import client from './client'

/**
 * Fetch available RM partners list
 * GET /public/partners
 */
export const fetchPartners = () =>
  client.get('/public/partners').then((r) => r.data)

/**
 * Create a Razorpay order for a selected plan
 * POST /public/create-order
 *
 * @param {Object} payload - see API docs for required fields
 */
export const createOrder = (payload) =>
  client.post('/public/create-order', payload).then((r) => r.data)

/**
 * Verify payment signature after Razorpay callback
 * POST /public/verify-payment
 *
 * @param {Object} payload - { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature }
 */
export const verifyPayment = (payload) =>
  client.post('/public/verify-payment', payload).then((r) => r.data)
