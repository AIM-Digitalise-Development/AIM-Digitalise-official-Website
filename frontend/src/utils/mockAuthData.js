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
        cycles: {
          monthly: {
            multiplier: 1,
            discount: 0,
            discounted_monthly: 2500,
            subtotal: 2500,
            gst_amount: 450,
            total: 2950,
            savings: 0
          },
          quarterly: {
            multiplier: 3,
            discount: 5,
            discounted_monthly: 2375,
            subtotal: 7125,
            gst_amount: 1282.5,
            total: 8407.5,
            savings: 375
          },
          'half-yearly': {
            multiplier: 6,
            discount: 10,
            discounted_monthly: 2250,
            subtotal: 13500,
            gst_amount: 2430,
            total: 15930,
            savings: 1500
          },
          yearly: {
            multiplier: 12,
            discount: 15,
            discounted_monthly: 2125,
            subtotal: 25500,
            gst_amount: 4590,
            total: 30090,
            savings: 4500
          }
        }
      }
    }
  }

  if (lowercaseUrl.includes('/client/calculate-subscription')) {
    const cycle = data?.cycle || 'annual'
    const multipliers = { monthly: 1, quarterly: 3, 'half-yearly': 6, half_yearly: 6, yearly: 12, annual: 12 }
    const discounts = { monthly: 0, quarterly: 5, 'half-yearly': 10, half_yearly: 10, yearly: 15, annual: 15 }
    
    const mult = multipliers[cycle] || 12
    const disc = discounts[cycle] || 15
    const studentCount = 250
    const baseMonthly = studentCount * 10
    const baseTotal = baseMonthly * mult
    const discountVal = baseTotal * (disc / 100)
    const subtotal = baseTotal - discountVal
    const gst = subtotal * 0.18
    const grandTotal = subtotal + gst
    
    return {
      success: true,
      data: {
        calculation: {
          student_count: studentCount,
          base_monthly_amount: baseMonthly,
          discount_percentage: disc,
          discounted_monthly_amount: baseMonthly * (1 - disc / 100),
          cycle: cycle,
          multiplier: mult,
          subtotal: subtotal,
          gst_percentage: 18,
          gst_amount: gst,
          total_amount: grandTotal,
          savings: discountVal
        },
        breakdown: {
          formula: `${studentCount} Students * ₹10.00/student = ₹${baseMonthly.toLocaleString()}/month`,
          with_discount: `₹${baseMonthly.toLocaleString()} * ${mult} months - ${disc}% = ₹${subtotal.toLocaleString()}`,
          subtotal: `₹${subtotal.toLocaleString()}`,
          gst: `18% CGST/SGST = ₹${gst.toLocaleString()}`,
          total_for_cycle: `Total = ₹${grandTotal.toLocaleString()}`
        }
      }
    }
  }

  if (lowercaseUrl.includes('/client/create-subscription-order')) {
    const cycle = data?.cycle || 'annual'
    const multipliers = { monthly: 1, quarterly: 3, 'half-yearly': 6, half_yearly: 6, yearly: 12, annual: 12 }
    const mult = multipliers[cycle] || 12
    return {
      success: true,
      simulated: true,
      amount: data?.amount || 8408,
      cycle: cycle,
      total_months: mult,
      order_id: 'order_mock_' + Math.random().toString(36).substring(2, 12),
      key: 'rzp_test_mockkey123',
      currency: 'INR',
      client_name: 'Demo Client School',
      client_email: 'client@demo.com'
    }
  }

  if (lowercaseUrl.includes('/client/verify-subscription-payment')) {
    return {
      success: true,
      message: 'Subscription payment successfully processed and recorded (Mock Mode).'
    }
  }

  if (lowercaseUrl.includes('/client/payment-status')) {
    return {
      success: true,
      data: {
        show_pay_now: true,
        next_payment_date: '2026-07-15',
        message: 'Your subscription period has ended. Please renew your subscription.',
        has_previous_payments: true,
        total_payments_made: 2,
        delivery_info: {
          first_payment_date: '2026-01-01',
          last_payment_date: '2026-04-01',
          last_payment_cycle: 'quarterly',
          next_due_date: '2026-07-15',
          days_until_due: 30,
          is_period_over: false,
          activated_at: '2026-01-02',
          unpaid_months: ['May 2026', 'June 2026'],
          total_due_amount: 5000
        }
      }
    }
  }

  if (lowercaseUrl.includes('/client/payment-history')) {
    return {
      success: true,
      data: {
        has_payments: true,
        payments: [
          {
            id: 1,
            razorpay_payment_id: 'pay_P1A2B3C4D5',
            cycle: 'quarterly',
            amount: 8408,
            created_at: '2026-04-01T10:00:00Z',
            period_start: '2026-04-01',
            period_end: '2026-07-01',
            status: 'success'
          },
          {
            id: 2,
            razorpay_payment_id: 'pay_P2A2B3C4D5',
            cycle: 'quarterly',
            amount: 8408,
            created_at: '2026-01-01T10:00:00Z',
            period_start: '2026-01-01',
            period_end: '2026-04-01',
            status: 'success'
          }
        ],
        summary: {
          total_payments: 2,
          total_amount_formatted: '₹ 16,816.00',
          latest_payment_cycle: 'quarterly',
          next_payment_due_formatted: '15/07/2026',
          is_overdue: false
        }
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
          last_login_at: '2026-06-12',
          total_clients: 8,
          total_clients_this_month: 3,
          extra_earnings_percentage: '5%',
          this_month_earnings: 58000,
          validity_till: '2027-06-12'
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
        last_login_at: '2026-06-12',
        total_clients: 8,
        total_clients_this_month: 3,
        extra_earnings_percentage: '5%',
        this_month_earnings: 58000,
        validity_till: '2027-06-12'
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
