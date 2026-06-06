// Admin dashboard API
// All dashboard data comes from a single endpoint: GET /api/admin/dashboard
// Response shape:
// {
//   success: true,
//   data: {
//     clients: { total, active, new_this_month, pending_payments },
//     revenue: { total, this_month },
//     partners: { total, active, pending, new_this_month },
//     top_products: [{ product_id, product_name, product_category, total_sold, total_revenue }],
//     monthly_revenue: [{ month, orders, revenue }],
//     recent_activities: [{ type, client_name|partner_name, product_name, amount|organization, partner_name, status, created_at }]
//   }
// }

// Re-export from the unified admin partners module
export { getAdminDashboard } from './partners'