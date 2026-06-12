// src/utils/mockApiFallback.js

export const getMockResponse = (url, method, data = null) => {
  const lowercaseUrl = url.toLowerCase()

  // 1. Admin Auth Mocks
  if (lowercaseUrl.includes('/admin/login')) {
    return {
      success: true,
      data: {
        token: 'mock-admin-token-12345',
        admin: {
          id: 1,
          name: 'Demo Admin User',
          email: data?.email || 'admin@aimdigitalise.com',
          role: 'admin',
          is_active: true
        }
      }
    }
  }
  if (lowercaseUrl.includes('/admin/profile') || lowercaseUrl.includes('/admin/check')) {
    return {
      success: true,
      data: {
        id: 1,
        name: 'Demo Admin User',
        email: 'admin@aimdigitalise.com',
        role: 'admin',
        is_active: true
      }
    }
  }

  // 2. Employee Auth Mocks
  if (lowercaseUrl.includes('/login') && !lowercaseUrl.includes('/client/') && !lowercaseUrl.includes('/partner/')) {
    return {
      success: true,
      token: 'mock-employee-token-12345',
      user: {
        id: 2,
        name: 'Demo Employee User',
        email: data?.email || 'employee@aimdigitalise.com',
        role: 'employee',
        is_active: true
      }
    }
  }

  // 3. Client Portal Mocks
  if (lowercaseUrl.includes('/client/login')) {
    return {
      success: true,
      token: 'mock-client-token-12345',
      client: {
        id: 4,
        client_name: 'Demo Client Academy',
        client_id: data?.client_id || 'CLI-1001',
        email: 'client@demo.com',
        product_name: 'NEXGN Institute Pro',
        product_category: 'SaaS Software',
        processing_fee: 10000,
        monthly_subscription: 2500,
        status: 'Active',
        payment_status: 'Paid',
        total_students: 250,
        created_at: '2026-01-01',
        activated_at: '2026-01-02'
      }
    }
  }
  if (lowercaseUrl.includes('/client/profile')) {
    return {
      success: true,
      data: {
        id: 4,
        client_name: 'Demo Client Academy',
        client_id: 'CLI-1001',
        email: 'client@demo.com',
        product_name: 'NEXGN Institute Pro',
        product_category: 'SaaS Software',
        processing_fee: 10000,
        monthly_subscription: 2500,
        status: 'Active',
        payment_status: 'Paid',
        total_students: 250,
        created_at: '2026-01-01',
        activated_at: '2026-01-02',
        contact_number: '+91 9876543210',
        company_name: 'Demo School Academy',
        district: 'Kolkata',
        state: 'West Bengal',
        pincode: '700107',
        address_line_1: '#139, Rajdanga Main Road'
      }
    }
  }
  if (lowercaseUrl.includes('/client/my-products')) {
    return {
      success: true,
      data: [
        {
          id: 101,
          name: 'NEXGN Institute Pro',
          product_name: 'NEXGN Institute Pro',
          category: 'SaaS Software',
          processing_fee: 10000,
          monthly_subscription: 2500,
          status: 'Active',
          payment_status: 'Paid',
          total_students: 250,
          created_at: '2026-01-01',
          activated_at: '2026-01-02'
        }
      ]
    }
  }
  if (lowercaseUrl.includes('/client/student-count')) {
    return {
      success: true,
      data: {
        student_count: 250,
        min_students: 100
      }
    }
  }
  if (lowercaseUrl.includes('/client/payment-cycles')) {
    return {
      success: true,
      data: {
        cycles: ['monthly', 'quarterly', 'half-yearly', 'yearly']
      }
    }
  }

  // 4. Partner Portal Mocks
  if (lowercaseUrl.includes('/partner/login')) {
    return {
      success: true,
      data: {
        token: 'mock-partner-token-12345',
        partner: {
          id: 3,
          partner_name: 'Demo Partner User',
          partner_id: data?.login || 'PIDIN54321',
          email: 'partner@demo.com',
          contact_no: '+91 9999988888',
          partner_type: 'Premium Partner',
          organization_name: 'AIM Partner Org',
          payment_status: 'Paid',
          is_active: true,
          last_login_at: '2026-06-12'
        }
      }
    }
  }
  if (lowercaseUrl.includes('/partner/profile') || lowercaseUrl.includes('/partner/check')) {
    return {
      success: true,
      data: {
        id: 3,
        partner_name: 'Demo Partner User',
        partner_id: 'PIDIN54321',
        email: 'partner@demo.com',
        contact_no: '+91 9999988888',
        partner_type: 'Premium Partner',
        organization_name: 'AIM Partner Org',
        payment_status: 'Paid',
        is_active: true,
        last_login_at: '2026-06-12'
      }
    }
  }
  if (lowercaseUrl.includes('/partner/dashboard-stats')) {
    return {
      success: true,
      data: {
        total_earnings: 150000,
        pending_payout: 25000,
        total_sales: 1250000,
        active_leads: 12,
        earnings_by_month: [
          { month: 'Jan', amount: 10000 },
          { month: 'Feb', amount: 15000 },
          { month: 'Mar', amount: 12000 },
          { month: 'Apr', amount: 25000 },
          { month: 'May', amount: 30000 },
          { month: 'Jun', amount: 58000 }
        ]
      }
    }
  }
  if (lowercaseUrl.includes('/partner/commission-report')) {
    return {
      success: true,
      data: {
        total_commission: 150000,
        total_sales: 1250000,
        commission_rate: '12%',
        monthly_breakdown: [
          { month: 'June 2026', commission: 58000, sales: 483000 },
          { month: 'May 2026', commission: 30000, sales: 250000 },
          { month: 'April 2026', commission: 25000, sales: 208000 }
        ]
      }
    }
  }
  if (lowercaseUrl.includes('/partner/my-orders')) {
    return {
      success: true,
      data: [
        {
          id: 1,
          client_name: 'St. Mary School',
          product_name: 'NEXGN Institute Pro',
          amount: 25000,
          commission: 3000,
          status: 'Completed',
          created_at: '2026-06-01'
        },
        {
          id: 2,
          client_name: 'Apex Enterprise',
          product_name: 'NEXGN ERP Premium Plus',
          amount: 45000,
          commission: 5400,
          status: 'Completed',
          created_at: '2026-06-05'
        }
      ]
    }
  }

  return null
}
