// src/utils/mockApiFallback.js

const MOCK_EMPLOYEES = [
  { id: 1, employee_id: "AIM260001", full_name: "John Doe" },
  { id: 2, employee_id: "AIM260002", full_name: "Jane Smith" },
  { id: 3, employee_id: "AIM260003", full_name: "Raj Patel" }
]

const getLoggedInMockEmployee = () => {
  let creatorEmployee = {
    id: 1,
    employee_id: "AIM260001",
    full_name: "John Doe"
  }
  try {
    if (typeof window !== 'undefined') {
      const authStorageStr = localStorage.getItem('auth-storage')
      if (authStorageStr) {
        const parsed = JSON.parse(authStorageStr)
        const user = parsed?.state?.user
        if (user) {
          creatorEmployee = {
            id: user.id || 1,
            employee_id: user.employee_id || "AIM260001",
            full_name: user.full_name || user.name || `${user.first_name || 'John'} ${user.last_name || 'Doe'}`.trim()
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to parse auth-storage in mock:', e)
  }
  return creatorEmployee
}

if (typeof window !== 'undefined' && !window.__mockLeads) {
  const getRelativeDateStr = (offsetDays) => {
    const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000)
    return d.toISOString().split('T')[0]
  }

  const todayStr = getRelativeDateStr(0)
  const tomorrowStr = getRelativeDateStr(1)
  const yesterdayStr = getRelativeDateStr(-1)

  window.__mockLeads = [
    {
      id: 1,
      lead_id: "LEAD2600001",
      employee_id: 1,
      client_name: "Rajesh Kumar",
      client_email: "rajesh.kumar@example.com",
      client_phone: "9876543210",
      client_alternate_phone: null,
      company_name: "Tech Solutions Pvt Ltd",
      address: "123, MG Road, Bangalore",
      city: "Bangalore",
      state: "Karnataka",
      pin_code: "560001",
      country: "India",
      lead_source: "Website",
      lead_status: "new",
      lead_priority: "high",
      assigned_to: null,
      assigned_by: null,
      follow_up_date: `${todayStr} 10:00:00`,
      next_follow_up: `${todayStr} 10:00:00`,
      notes: "Interested in our enterprise solution",
      remarks: null,
      product_interest: "Institute Pro",
      budget: "1000000.00",
      expected_close_date: `${todayStr}`,
      conversion_date: null,
      converted_to_client_id: null,
      is_converted: false,
      is_active: true,
      lost_reason: null,
      demo_status: "scheduled",
      demo_slot: `${todayStr} 14:00:00`,
      demo_link: "https://meet.google.com/abc-defg-hij",
      created_at: "2026-06-20T10:30:00.000000Z",
      updated_at: "2026-06-20T10:30:00.000000Z",
      employee: {
        id: 1,
        employee_id: "AIM260001",
        full_name: "John Doe"
      },
      activities: [
        {
          id: 101,
          lead_id: 1,
          employee_id: 1,
          activity_type: "call",
          description: "Initial discovery call with client",
          notes: "Discussed requirements, budget seems good, scheduled demo",
          scheduled_date: "2026-06-21T15:00:00.000000Z",
          completed_at: "2026-06-20T10:35:00.000000Z",
          created_at: "2026-06-20T10:35:00.000000Z",
          employee: {
            id: 1,
            employee_id: "AIM260001",
            full_name: "John Doe"
          }
        }
      ]
    },
    {
      id: 2,
      lead_id: "LEAD2600002",
      employee_id: 1,
      client_name: "Priya Sharma",
      client_email: "priya.sharma@example.com",
      client_phone: "9876543211",
      client_alternate_phone: "9876543212",
      company_name: "Education First Academy",
      address: "456, Park Street, Delhi",
      city: "Delhi",
      state: "Delhi",
      pin_code: "110001",
      country: "India",
      lead_source: "Referral",
      lead_status: "contacted",
      lead_priority: "urgent",
      assigned_to: null,
      assigned_by: null,
      follow_up_date: `${tomorrowStr} 10:00:00`,
      next_follow_up: `${tomorrowStr} 10:00:00`,
      notes: "Looking for custom LMS solution for their school",
      remarks: null,
      product_interest: "Custom Solution",
      budget: "2500000.00",
      expected_close_date: `${tomorrowStr}`,
      conversion_date: null,
      converted_to_client_id: null,
      is_converted: false,
      is_active: true,
      lost_reason: null,
      demo_status: "completed",
      demo_slot: `${yesterdayStr} 11:00:00`,
      demo_link: "https://meet.google.com/xyz-pdqr-abc",
      created_at: "2026-06-18T14:20:00.000000Z",
      updated_at: "2026-06-20T11:00:00.000000Z",
      employee: {
        id: 1,
        employee_id: "AIM260001",
        full_name: "John Doe"
      },
      activities: [
        {
          id: 102,
          lead_id: 2,
          employee_id: 1,
          activity_type: "email",
          description: "Sent product brochure and pricing",
          notes: "Sent email with attachments, waiting for response",
          scheduled_date: "2026-06-20T11:00:00.000000Z",
          completed_at: "2026-06-20T11:00:00.000000Z",
          created_at: "2026-06-20T11:00:00.000000Z",
          employee: {
            id: 1,
            employee_id: "AIM260001",
            full_name: "John Doe"
          }
        }
      ]
    },
    {
      id: 3,
      lead_id: "LEAD2600003",
      employee_id: 1,
      client_name: "Amit Singh",
      client_email: "amit.singh@example.com",
      client_phone: "9876543213",
      client_alternate_phone: null,
      company_name: "Global Edutech",
      address: "789, BKC, Mumbai",
      city: "Mumbai",
      state: "Maharashtra",
      pin_code: "400051",
      country: "India",
      lead_source: "Cold Call",
      lead_status: "new",
      lead_priority: "medium",
      assigned_to: null,
      assigned_by: null,
      follow_up_date: `${yesterdayStr} 16:30:00`,
      next_follow_up: `${yesterdayStr} 16:30:00`,
      notes: "Follow up after initial call",
      remarks: null,
      product_interest: "ERP System",
      budget: "1500000.00",
      expected_close_date: `${yesterdayStr}`,
      conversion_date: null,
      converted_to_client_id: null,
      is_converted: false,
      is_active: true,
      lost_reason: null,
      demo_status: null,
      demo_slot: null,
      created_at: "2026-06-19T09:15:00.000000Z",
      updated_at: "2026-06-19T09:15:00.000000Z",
      employee: {
        id: 1,
        employee_id: "AIM260001",
        full_name: "John Doe"
      },
      activities: []
    },
    {
      id: 4,
      lead_id: "LEAD2600004",
      employee_id: 1,
      client_name: "Delhi Public School",
      client_email: "contact@dps.edu.in",
      client_phone: "9876543214",
      client_alternate_phone: null,
      company_name: "Delhi Public School",
      address: "Sector 12, Dwarka, Delhi",
      city: "Delhi",
      state: "Delhi",
      pin_code: "110075",
      country: "India",
      lead_source: "Referral",
      lead_status: "converted",
      lead_priority: "medium",
      assigned_to: null,
      assigned_by: null,
      follow_up_date: null,
      next_follow_up: null,
      notes: "Completed conversion and billing set up.",
      remarks: null,
      product_interest: "Institute Pro",
      budget: "150000.00",
      expected_close_date: `${yesterdayStr}`,
      conversion_date: `${todayStr}T09:00:00.000000Z`,
      converted_to_client_id: 4,
      is_converted: true,
      is_active: true,
      lost_reason: null,
      demo_status: "completed",
      demo_slot: `${yesterdayStr} 15:00:00`,
      demo_link: "https://meet.google.com/dps-demo",
      created_at: "2026-06-10T11:00:00.000000Z",
      updated_at: `${todayStr}T09:00:00.000000Z`,
      employee: {
        id: 1,
        employee_id: "AIM260001",
        full_name: "John Doe"
      },
      activities: [
        {
          id: 103,
          lead_id: 4,
          employee_id: 1,
          activity_type: "meeting",
          description: "Final agreement signature and payment review",
          notes: "Agreement signed, setup complete.",
          scheduled_date: null,
          completed_at: `${todayStr}T09:00:00.000000Z`,
          created_at: `${todayStr}T09:00:00.000000Z`,
          employee: {
            id: 1,
            employee_id: "AIM260001",
            full_name: "John Doe"
          }
        }
      ]
    }
  ]
}

if (typeof window !== 'undefined' && !window.__mockDemoSlots) {
  window.__mockDemoSlots = [
    {
      id: 1,
      employee_id: 1,
      demo_type: 'client',
      title: 'School ERP Discovery & Demo',
      timing_from: '10:00',
      timing_to: '11:00',
      meeting_link: 'https://meet.google.com/abc-defg-hij',
      max_attendees: 5,
      all_days: false,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      employee_id: 1,
      demo_type: 'partner',
      title: 'Nexgn Premium Partner Training',
      timing_from: '14:30',
      timing_to: '15:30',
      meeting_link: 'https://meet.google.com/xyz-pdqr-abc',
      max_attendees: 25,
      all_days: true,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      employee_id: 1,
      demo_type: 'client',
      title: 'Evening LMS Walkthrough',
      timing_from: '17:00',
      timing_to: '18:00',
      meeting_link: 'https://meet.google.com/dps-demo',
      max_attendees: 10,
      all_days: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: true,
      sunday: true,
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

export const getMockResponse = (url, method, data = null) => {
  method = (method || '').toUpperCase()
  let normalizedUrl = url.toLowerCase()
  if (normalizedUrl.includes('/partner/leads')) {
    normalizedUrl = normalizedUrl.replace('/partner/leads', '/employee/leads')
  } else if (normalizedUrl.includes('/partner/demo-slots')) {
    normalizedUrl = normalizedUrl.replace('/partner/demo-slots', '/employee/demo-slots')
  } else if (normalizedUrl.includes('/partner/demo-slots-available')) {
    normalizedUrl = normalizedUrl.replace('/partner/demo-slots-available', '/employee/demo-slots-available')
  } else if (normalizedUrl.includes('/partner/categories')) {
    normalizedUrl = normalizedUrl.replace('/partner/categories', '/employee/categories')
  } else if (normalizedUrl.includes('/partner/subcategories')) {
    normalizedUrl = normalizedUrl.replace('/partner/subcategories', '/employee/subcategories')
  } else if (normalizedUrl.includes('/partner/products-dropdown')) {
    normalizedUrl = normalizedUrl.replace('/partner/products-dropdown', '/employee/products-dropdown')
  } else if (normalizedUrl.includes('/admin/leads')) {
    normalizedUrl = normalizedUrl.replace('/admin/leads', '/employee/leads')
  } else if (normalizedUrl.includes('/admin/demo-slots')) {
    normalizedUrl = normalizedUrl.replace('/admin/demo-slots', '/employee/demo-slots')
  } else if (normalizedUrl.includes('/admin/demo-slots-available')) {
    normalizedUrl = normalizedUrl.replace('/admin/demo-slots-available', '/employee/demo-slots-available')
  } else if (normalizedUrl.includes('/admin/bookings')) {
    normalizedUrl = normalizedUrl.replace('/admin/bookings', '/employee/bookings')
  } else if (normalizedUrl.includes('/employee/general-services')) {
    normalizedUrl = normalizedUrl.replace('/employee/general-services', '/admin/general-services')
  } else if (normalizedUrl.includes('/public/general-services')) {
    normalizedUrl = normalizedUrl.replace('/public/general-services', '/admin/general-services')
  } else if (normalizedUrl.includes('/employee/general-clients')) {
    normalizedUrl = normalizedUrl.replace('/employee/general-clients', '/admin/general-clients')
  }
  const lowercaseUrl = normalizedUrl
  if (!data) data = {}

  if (typeof window !== 'undefined') {
    if (!window.__mockCustomizationRequests) {
      window.__mockCustomizationRequests = [
        {
          id: 101,
          customization_text: "[iOS App Development] (Target Rollout: 2026-09-15)\n\nRequesting a premium iOS wrapper with notification support.",
          amount: 15000,
          status: 'amount_set',
          created_at: '2026-07-01T12:00:00Z'
        },
        {
          id: 102,
          customization_text: "[Biometric Machine API] (Target Rollout: 2026-08-30)\n\nIntegrate local face-recognition machines with school attendance module.",
          amount: 8500,
          status: 'amount_set',
          created_at: '2026-07-02T14:30:00Z'
        },
        {
          id: 103,
          customization_text: "[Custom Report Design] (Target Rollout: 2026-08-10)\n\nFormat fee book and report card PDF with custom branding.",
          amount: null,
          status: 'pending',
          created_at: '2026-07-05T10:00:00Z'
        }
      ]
    }

    if (!window.__mockCustomizationPayments) {
      window.__mockCustomizationPayments = [
        {
          id: 201,
          razorpay_payment_id: 'pay_CUST12345678',
          customization_text: "[WhatsApp Alerts Integration]\n\nAutomated monthly fee receipt delivery via WhatsApp API.",
          amount: 5900,
          status: 'success',
          created_at: '2026-06-15T09:00:00Z'
        }
      ]
    }
    if (!window.__mockProposals) {
      try {
        const stored = localStorage.getItem('mock_proposals_data')
        if (stored) {
          window.__mockProposals = JSON.parse(stored)
        }
      } catch (e) {}

      if (!window.__mockProposals || !window.__mockProposals.length) {
        window.__mockProposals = [
          {
            id: 1,
            school_name: "Greenwood High School",
            principal_name: "Dr. Sarah Jenkins",
            email: "official@school.edu.in",
            contact_no: "+91 98765 43210",
            address: "123 Campus Lane, City Center, Bangalore",
            email_sent: false,
            proposal_letter_path: "uploads/proposals/proposal_1_17145293.pdf",
            sent_at: null,
            created_at: "2026-08-25T13:00:00.000000Z",
            updated_at: "2026-08-25T13:00:00.000000Z"
          },
          {
            id: 2,
            school_name: "St. Xavier's International Academy",
            principal_name: "Fr. Thomas D'Souza",
            email: "admin@stxaviers.edu.in",
            contact_no: "+91 98450 11223",
            address: "45 Heritage Boulevard, Civil Lines, Pune",
            email_sent: true,
            proposal_letter_path: "uploads/proposals/proposal_2_17145294.pdf",
            sent_at: "2026-08-25T15:30:00.000000Z",
            created_at: "2026-08-24T09:15:00.000000Z",
            updated_at: "2026-08-25T15:30:00.000000Z"
          },
          {
            id: 3,
            school_name: "Delhi Public Global Campus",
            principal_name: "Mrs. Meenakshi Sharma",
            email: "principal@dpglobal.ac.in",
            contact_no: "+91 98112 34567",
            address: "Plot 88, Knowledge Park III, Greater Noida",
            email_sent: false,
            proposal_letter_path: "uploads/proposals/proposal_3_17145295.pdf",
            sent_at: null,
            created_at: "2026-08-26T10:45:00.000000Z",
            updated_at: "2026-08-26T10:45:00.000000Z"
          }
        ]
      }
    }
  }

  // ── Proposal API Mocks ───────────────────────────
  // POST /api/public/proposals/send-otp
  if (lowercaseUrl.includes('/proposals/send-otp') && method === 'POST') {
    const demoOtp = 4829
    return {
      success: true,
      message: "Verification OTP has been sent to your Email ID. Please check your inbox.",
      otp: demoOtp
    }
  }

  // POST /api/public/proposals/verify-otp
  if (lowercaseUrl.includes('/proposals/verify-otp') && method === 'POST') {
    return {
      success: true,
      message: "Email ID verified successfully!"
    }
  }

  // POST /api/public/proposals (Submit Proposal)
  if (lowercaseUrl.includes('/public/proposals') && method === 'POST') {
    const newProposal = {
      id: (window.__mockProposals?.length || 0) + 1,
      school_name: data.school_name || "Greenwood High School",
      principal_name: data.principal_name || "Principal",
      email: data.email || "official@school.edu.in",
      contact_no: data.contact_no || data.phone || "+91 98765 43210",
      address: data.address || "123 Campus Lane, City Center",
      email_sent: false,
      proposal_letter_path: `uploads/proposals/proposal_${Date.now()}.pdf`,
      sent_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    if (window.__mockProposals) {
      window.__mockProposals = [newProposal, ...window.__mockProposals]
      try {
        localStorage.setItem('mock_proposals_data', JSON.stringify(window.__mockProposals))
      } catch (e) {}
    }
    return {
      success: true,
      message: "Proposal request details submitted successfully!",
      data: newProposal
    }
  }

  // POST /api/admin/proposals/:id/send-email
  if (lowercaseUrl.includes('/admin/proposals/') && lowercaseUrl.includes('/send-email') && method === 'POST') {
    const match = lowercaseUrl.match(/\/admin\/proposals\/(\d+)\/send-email/)
    const propId = match ? parseInt(match[1], 10) : null
    let targetEmail = "client@school.edu.in"
    if (window.__mockProposals) {
      window.__mockProposals = window.__mockProposals.map(p => {
        if (p.id === propId || String(p.id) === String(propId)) {
          targetEmail = p.email
          return {
            ...p,
            email_sent: true,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
        return p
      })
      try {
        localStorage.setItem('mock_proposals_data', JSON.stringify(window.__mockProposals))
      } catch (e) {}
    }
    return {
      success: true,
      message: `Proposal email successfully sent to ${targetEmail}!`
    }
  }

  // GET /api/admin/proposals
  if (lowercaseUrl.includes('/admin/proposals') && method === 'GET') {
    return {
      success: true,
      data: window.__mockProposals || []
    }
  }

  if (lowercaseUrl.includes('/public/rm-options')) {
    return {
      success: true,
      counts: { super_admins: 2, partners: 2 },
      data: [
        { id: 1, type: 'admin', name: 'Super Admin User 1', partner_id: null },
        { id: 2, type: 'admin', name: 'Super Admin User 2', partner_id: null },
        { id: 3, type: 'partner', name: 'Master Partner Kumar', partner_id: 'PIDIN26001' },
        { id: 4, type: 'partner', name: 'Premium Partner Sharma', partner_id: 'PIDIN26002' }
      ]
    }
  }

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

  // General Services & Clients Mocks
  if (typeof window !== 'undefined') {
    if (!window.__mockGeneralServices) {
      window.__mockGeneralServices = [
        {
          id: 1,
          name: 'Corporate Informative Website',
          hsn: '998314',
          unit: 'Unit',
          selling_price: 25000,
          category: 'Web Development',
          description: 'Complete dynamic corporate website with CMS, inquiry form, social media integration, mobile responsiveness, and basic SEO.',
          is_active: true
        },
        {
          id: 2,
          name: 'Custom ERP & Billing Portal',
          hsn: '998313',
          unit: 'Unit',
          selling_price: 45000,
          category: 'Software',
          description: 'Enterprise ERP software with GST billing, multi-user role management, inventory control, and payment gateway integration.',
          is_active: true
        },
        {
          id: 3,
          name: 'WhatsApp Business API Integration',
          hsn: '998315',
          unit: 'Setup',
          selling_price: 12000,
          category: 'API Integration',
          description: 'Automated WhatsApp messaging bot, order confirmation alerts, OTP verification, and broadcast marketing panel.',
          is_active: true
        },
        {
          id: 4,
          name: 'E-Commerce Online Store with PG',
          hsn: '998314',
          unit: 'Unit',
          selling_price: 35000,
          category: 'E-Commerce',
          description: 'Full-featured online shop with product catalog, shopping cart, Razorpay checkout, shipment tracking, and customer portal.',
          is_active: true
        },
        {
          id: 5,
          name: 'Mobile App Development (Android + iOS)',
          hsn: '998313',
          unit: 'Unit',
          selling_price: 65000,
          category: 'Mobile App',
          description: 'Cross-platform mobile application with push notifications, offline sync, real-time analytics, and app store deployment.',
          is_active: true
        },
        {
          id: 6,
          name: 'Annual Cloud Hosting & Maintenance (AMC)',
          hsn: '998316',
          unit: 'Year',
          selling_price: 15000,
          category: 'Maintenance',
          description: '1-Year comprehensive server maintenance, SSL certificate, 99.9% uptime SLA, automated daily backups, and priority support.',
          is_active: true
        }
      ]
    }

    if (!window.__mockGeneralClients) {
      window.__mockGeneralClients = [
        {
          id: 1,
          client_id: 'GC-2026-001',
          client_name: 'Sharma Tech Solutions',
          company_name: 'Sharma Tech Pvt Ltd',
          contact_person: 'Mr. Rohit Sharma',
          email: 'contact@sharmatech.com',
          contact_number: '+91 9876543210',
          alt_contact_number: '+91 9876543211',
          address: '45, MG Road, Sector 14',
          district: 'Gurugram',
          state: 'Haryana',
          pin_code: '122001',
          country_code: 'IN',
          gst_type: 'Intra-State',
          gstin: '07AAAAA0000A1Z5',
          lead_source: 'Website',
          referred_by: 'Direct',
          sold_by_name: 'Rahul Verma',
          branch_name: 'Head Office (Gurugram)',
          status: 'Quotation Sent',
          next_followup_date: '2026-08-25',
          reg_date: '2026-08-10',
          software_requirements: 'Custom ERP & Billing Portal, WhatsApp Business API Integration',
          quotations_count: 1,
          quotations: [
            {
              id: 101,
              quotation_number: 'AIM-20260813-001',
              quotation_date: '2026-08-10',
              payment_terms: 'Due on Receipt',
              gst_type: 'Intra-State',
              subtotal: 57000,
              cgst: 5130,
              sgst: 5130,
              tax_total: 10260,
              grand_total: 67260,
              uuid: 'quotation-uuid-101',
              status: 'sent',
              items: [
                {
                  id: 1,
                  product_id: 2,
                  product_name: 'Custom ERP & Billing Portal',
                  hsn: '998313',
                  qty: 1,
                  unit: 'Unit',
                  selling_price: 45000,
                  discount_percentage: 0,
                  description: 'Enterprise ERP software with GST billing, multi-user role management, inventory control, and payment gateway integration.'
                },
                {
                  id: 2,
                  product_id: 3,
                  product_name: 'WhatsApp Business API Integration',
                  hsn: '998315',
                  qty: 1,
                  unit: 'Setup',
                  selling_price: 12000,
                  discount_percentage: 0,
                  description: 'Automated WhatsApp messaging bot, order confirmation alerts, OTP verification, and broadcast marketing panel.'
                }
              ]
            }
          ]
        },
        {
          id: 2,
          client_id: 'GC-2026-002',
          client_name: 'Himalayan Traders',
          company_name: 'Himalayan Traders LLC',
          contact_person: 'Mr. Pasang Sherpa',
          email: 'info@himalayantraders.np',
          contact_number: '+977 9801234567',
          alt_contact_number: '',
          address: 'Durbar Marg',
          district: 'Kathmandu',
          state: 'Bagmati',
          pin_code: '44600',
          country_code: 'NP',
          gst_type: 'Inter-State',
          gstin: '301234567',
          lead_source: 'Partner',
          referred_by: 'Kathmandu Branch',
          sold_by_name: 'Anil Shrestha',
          branch_name: 'Kathmandu Branch',
          status: 'Pursuing to Purchase',
          next_followup_date: '2026-08-28',
          reg_date: '2026-08-14',
          software_requirements: 'Corporate Informative Website, Annual Cloud Hosting & Maintenance (AMC)',
          quotations_count: 0,
          quotations: []
        },
        {
          id: 3,
          client_id: 'GC-2026-003',
          client_name: 'Apex Global Logistics',
          company_name: 'Apex Logistics Inc.',
          contact_person: 'Ms. Sunita Roy',
          email: 'admin@apexglobal.in',
          contact_number: '+91 9988776655',
          alt_contact_number: '+91 9988776650',
          address: 'Connaught Place',
          district: 'Central Delhi',
          state: 'Delhi',
          pin_code: '110001',
          country_code: 'IN',
          gst_type: 'Intra-State',
          gstin: '07BBBBB1111B2Z8',
          lead_source: 'Referral',
          referred_by: 'Delhi HQ',
          sold_by_name: 'Pooja Mehta',
          branch_name: 'Head Office (Gurugram)',
          status: 'Attended',
          next_followup_date: '2026-08-30',
          reg_date: '2026-08-18',
          software_requirements: 'Corporate Informative Website, E-Commerce Online Store with PG',
          quotations_count: 0,
          quotations: []
        }
      ]
    }

    if (!window.__mockCountryTaxes) {
      window.__mockCountryTaxes = [
        { id: 1, country_code: 'IN', country_name: 'India', currency: 'INR', currency_symbol: '₹', tax_id_label: 'GSTIN', tax_name: 'GST', tax_rate: 18, is_active: true },
        { id: 2, country_code: 'NP', country_name: 'Nepal', currency: 'NPR', currency_symbol: 'NRs', tax_id_label: 'PAN/VAT', tax_name: 'VAT', tax_rate: 13, is_active: true },
        { id: 3, country_code: 'BT', country_name: 'Bhutan', currency: 'BTN', currency_symbol: 'Nu', tax_id_label: 'BIT', tax_name: 'Sales Tax', tax_rate: 7, is_active: true }
      ]
    }
  }

  // ==========================================
  // GENERAL SERVICES API ENDPOINTS
  // ==========================================
  if (lowercaseUrl.includes('/admin/general-services')) {
    const singleServiceMatch = lowercaseUrl.match(/\/admin\/general-services\/(\d+)$/)
    if (singleServiceMatch) {
      const sId = parseInt(singleServiceMatch[1], 10)
      if (method === 'GET') {
        const item = (window.__mockGeneralServices || []).find(s => s.id === sId)
        return item ? { success: true, data: item } : { success: false, message: 'Service not found' }
      }
      if (method === 'PUT') {
        let updated = null
        if (window.__mockGeneralServices) {
          window.__mockGeneralServices = window.__mockGeneralServices.map(s => {
            if (s.id === sId) {
              updated = {
                ...s,
                name: data?.name || data?.service_name || s.name,
                hsn: data?.hsn || data?.hsn_sac || s.hsn,
                unit: data?.unit || s.unit,
                selling_price: data?.selling_price !== undefined ? Number(data.selling_price) : (data?.price !== undefined ? Number(data.price) : s.selling_price),
                category: data?.category || s.category,
                description: data?.description !== undefined ? data.description : s.description,
                is_active: data?.is_active !== undefined ? data.is_active : s.is_active
              }
              return updated
            }
            return s
          })
        }
        return { success: true, data: updated, message: 'General service updated successfully' }
      }
      if (method === 'DELETE') {
        if (window.__mockGeneralServices) {
          window.__mockGeneralServices = window.__mockGeneralServices.filter(s => s.id !== sId)
        }
        return { success: true, message: 'General service deleted successfully' }
      }
    }

    if (method === 'POST') {
      const newService = {
        id: Math.floor(Date.now() + Math.random() * 1000),
        name: data?.name || data?.service_name || 'New Service',
        hsn: data?.hsn || data?.hsn_sac || '9983',
        unit: data?.unit || 'Unit',
        selling_price: data?.selling_price !== undefined ? Number(data.selling_price) : (data?.price !== undefined ? Number(data.price) : 0),
        category: data?.category || 'General',
        description: data?.description || '',
        is_active: data?.is_active !== undefined ? data.is_active : true
      }
      if (window.__mockGeneralServices) {
        window.__mockGeneralServices.unshift(newService)
      }
      return { success: true, data: newService, message: 'General service created successfully' }
    }

    return {
      success: true,
      data: (window.__mockGeneralServices || []).map(s => ({
        ...s,
        service_name: s.service_name || s.name,
        service_price: s.service_price !== undefined ? s.service_price : (s.selling_price || s.price || 0),
        service_description: s.service_description !== undefined ? s.service_description : (s.description || ''),
        hsn_code: s.hsn_code || s.hsn || '9983'
      }))
    }
  }

  // GET /admin/general-clients/:id
  const singleClientMatch = lowercaseUrl.match(/\/admin\/general-clients\/(\d+)$/)
  if (singleClientMatch && method === 'GET') {
    const clientId = parseInt(singleClientMatch[1], 10)
    const clientItem = (window.__mockGeneralClients || []).find(c => c.id === clientId)
    if (clientItem) {
      return { success: true, data: clientItem }
    }
    return { success: false, message: 'Client not found' }
  }

  // PATCH /admin/general-clients/:id/status
  const statusMatch = lowercaseUrl.match(/\/admin\/general-clients\/(\d+)\/status$/)
  if (statusMatch && (method === 'PATCH' || method === 'PUT')) {
    const clientId = parseInt(statusMatch[1], 10)
    const clientItem = (window.__mockGeneralClients || []).find(c => c.id === clientId)
    if (clientItem) {
      clientItem.status = data?.status || clientItem.status
      return { success: true, data: clientItem, message: `Status updated to ${clientItem.status}` }
    }
    return { success: false, message: 'Client not found' }
  }

  // POST /admin/general-clients/:id/quotations
  const createQuotationMatch = lowercaseUrl.match(/\/admin\/general-clients\/(\d+)\/quotations$/)
  if (createQuotationMatch && method === 'POST') {
    const clientId = parseInt(createQuotationMatch[1], 10)
    const clientItem = (window.__mockGeneralClients || []).find(c => c.id === clientId)
    const newQuotation = {
      id: Math.floor(Date.now() + Math.random() * 1000),
      uuid: `quotation-${Date.now()}`,
      quotation_number: data?.quotation_number || `AIM-${Date.now()}`,
      quotation_date: data?.quotation_date || new Date().toISOString().substring(0, 10),
      po_number: data?.po_number || '',
      po_date: data?.po_date || '',
      discount_description: data?.discount_description || '',
      payment_terms: data?.payment_terms || 'Due on Receipt',
      gst_type: data?.gst_type || 'Intra-State',
      gstin: data?.gstin || '',
      anexture: data?.anexture || 'NO',
      items: data?.items || [],
      status: 'draft'
    }
    if (clientItem) {
      if (!clientItem.quotations) clientItem.quotations = []
      clientItem.quotations.unshift(newQuotation)
      clientItem.quotations_count = clientItem.quotations.length
      if (clientItem.status === 'Attended') {
        clientItem.status = 'Quotation Sent'
      }
    }
    return { success: true, data: newQuotation, message: 'Quotation created successfully' }
  }

  // POST /admin/quotations/:id/send or /employee/general-clients/quotations/:id/send-email
  if ((lowercaseUrl.includes('/quotations/') && (lowercaseUrl.includes('/send') || lowercaseUrl.includes('/send-email')))) {
    const uuidMatch = lowercaseUrl.match(/\/quotations\/(\d+)\/(send|send-email)/)
    const qId = uuidMatch ? uuidMatch[1] : '101'
    if (window.__mockGeneralClients) {
      for (const clientItem of window.__mockGeneralClients) {
        if (clientItem.quotations) {
          const matchQ = clientItem.quotations.find(q => String(q.id) === String(qId))
          if (matchQ) {
            matchQ.status = 'sent'
            clientItem.status = 'Quotation Sent'
            break
          }
        }
      }
    }
    return {
      success: true,
      message: 'Quotation & Invoice sent successfully to client email!',
      payment_url: `${window.location.origin}/general-quotation-pay.html?uuid=quotation-uuid-${qId}`
    }
  }

  // POST /employee/general-clients/quotations/:id/record-payment
  if (lowercaseUrl.includes('/record-payment') && method === 'POST') {
    const qMatch = lowercaseUrl.match(/\/quotations\/(\d+)\/record-payment/)
    const qId = qMatch ? qMatch[1] : null
    let recordedQuotation = null
    if (window.__mockGeneralClients) {
      for (const c of window.__mockGeneralClients) {
        if (c.quotations) {
          const q = c.quotations.find(it => String(it.id) === String(qId))
          if (q) {
            q.status = 'paid'
            q.paid_amount = data?.payment_amount || q.grand_total
            q.payment_mode = data?.payment_mode || 'Bank Transfer'
            q.transaction_reference = data?.transaction_reference || ('UTR' + Date.now())
            q.payment_date = data?.payment_date || new Date().toISOString().substring(0, 10)
            c.status = 'Order Closed'
            recordedQuotation = q
            break
          }
        }
      }
    }
    return {
      success: true,
      message: 'Payment recorded successfully!',
      data: recordedQuotation || data
    }
  }

  // PUBLIC QUOTATION ENDPOINTS (/public/general-quotations/...)
  if (lowercaseUrl.includes('/public/general-quotations/')) {
    const parts = lowercaseUrl.split('/public/general-quotations/')[1] || ''
    const [rawUuid, action] = parts.split('/')
    const uuid = rawUuid ? rawUuid.split('?')[0] : ''

    // Find quotation in mock database
    let foundQuotation = null
    let foundClient = null

    if (window.__mockGeneralClients) {
      for (const clientItem of window.__mockGeneralClients) {
        if (clientItem.quotations) {
          const match = clientItem.quotations.find(q => q.uuid === uuid || `quotation-uuid-${q.id}` === uuid || `quotation-${q.id}` === uuid)
          if (match) {
            foundQuotation = match
            foundClient = clientItem
            break
          }
        }
      }
    }

    if (!foundQuotation) {
      foundClient = (window.__mockGeneralClients && window.__mockGeneralClients[0]) || {
        client_name: 'Test Client',
        company_name: 'Test Enterprise',
        email: 'client@example.com',
        contact_number: '+91 9876543210',
        address: 'MG Road',
        state: 'Haryana',
        gst_type: 'Intra-State',
        gstin: '07AAAAA0000A1Z5'
      }
      foundQuotation = {
        id: 101,
        uuid: uuid || 'quotation-uuid-101',
        quotation_number: 'AIM-20260813-001',
        quotation_date: '2026-08-10',
        payment_terms: 'Due on Receipt',
        gst_type: foundClient.gst_type || 'Intra-State',
        subtotal: 45000,
        cgst: 4050,
        sgst: 4050,
        tax_total: 8100,
        grand_total: 53100,
        status: 'sent',
        items: [
          {
            id: 1,
            product_name: 'Custom ERP Software Suite',
            hsn: '9983',
            unit: 'Unit',
            qty: 1,
            selling_price: 45000,
            discount_percentage: 0,
            description: 'Complete corporate informative dynamic website with admin panel and database.'
          }
        ]
      }
    }

    if (action === 'create-order') {
      return {
        success: true,
        order_id: `order_mock_${Date.now()}`,
        key: 'rzp_test_mockkey123',
        amount: Math.round(Number(foundQuotation.grand_total || 53100) * 100),
        currency: 'INR',
        quotation: foundQuotation
      }
    }

    if (action === 'verify-payment') {
      foundQuotation.status = 'paid'
      foundQuotation.paid_at = new Date().toISOString()
      if (foundClient) {
        foundClient.status = 'Order Closed'
      }
      return {
        success: true,
        message: 'Payment verified successfully! Tax Invoice PDF has been sent to client email.',
        quotation: foundQuotation
      }
    }

    // Default: GET /public/general-quotations/{uuid}
    return {
      success: true,
      data: {
        ...foundQuotation,
        client: foundClient
      }
    }
  }

  // GET /admin/general-clients & POST /admin/general-clients & PUT/DELETE /admin/general-clients/:id
  if (lowercaseUrl.includes('/admin/general-clients')) {
    const singleGenClientMatch = lowercaseUrl.match(/\/admin\/general-clients\/(\d+)$/)
    if (singleGenClientMatch && method === 'DELETE') {
      const cId = parseInt(singleGenClientMatch[1], 10)
      if (window.__mockGeneralClients) {
        window.__mockGeneralClients = window.__mockGeneralClients.filter(c => c.id !== cId)
      }
      return { success: true, message: 'General client deleted successfully' }
    }

    if (singleGenClientMatch && method === 'PUT') {
      const cId = parseInt(singleGenClientMatch[1], 10)
      let updatedClient = null
      if (window.__mockGeneralClients) {
        window.__mockGeneralClients = window.__mockGeneralClients.map(c => {
          if (c.id === cId) {
            updatedClient = {
              ...c,
              client_name: data?.client_name ?? c.client_name,
              company_name: data?.company_name ?? c.company_name,
              contact_person: data?.contact_person ?? c.contact_person,
              email: data?.email ?? c.email,
              contact_number: data?.contact_number ?? c.contact_number,
              alt_contact_number: data?.alt_contact_number ?? c.alt_contact_number,
              address: data?.address ?? c.address,
              district: data?.district ?? c.district,
              state: data?.state ?? c.state,
              pin_code: data?.pin_code ?? c.pin_code,
              country_code: data?.country_code ?? c.country_code,
              gst_type: data?.gst_type ?? c.gst_type,
              gstin: data?.gstin ?? c.gstin,
              lead_source: data?.lead_source ?? c.lead_source,
              referred_by: data?.referred_by ?? c.referred_by,
              sold_by_name: data?.sold_by_name ?? c.sold_by_name,
              branch_name: data?.branch_name ?? c.branch_name,
              status: data?.status ?? c.status,
              next_followup_date: data?.next_followup_date ?? c.next_followup_date,
              software_requirements: data?.software_requirements ?? c.software_requirements,
            }
            return updatedClient
          }
          return c
        })
      }
      return { success: true, data: updatedClient, message: 'General client updated successfully' }
    }

    if (method === 'POST') {
      const newGenClient = {
        id: Math.floor(Date.now() + Math.random() * 1000),
        client_id: `GC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        client_name: data?.client_name || 'New Client',
        company_name: data?.company_name || '',
        contact_person: data?.contact_person || data?.client_name || '',
        email: data?.email || '',
        contact_number: data?.contact_number || '',
        alt_contact_number: data?.alt_contact_number || '',
        address: data?.address || '',
        district: data?.district || '',
        state: data?.state || '',
        pin_code: data?.pin_code || '',
        country_code: data?.country_code || 'IN',
        gst_type: data?.gst_type || 'Intra-State',
        gstin: data?.gstin || '',
        lead_source: data?.lead_source || 'Website',
        referred_by: data?.referred_by || 'Direct',
        sold_by_name: data?.sold_by_name || 'Admin Sales Team',
        branch_name: data?.branch_name || 'Head Office (Gurugram)',
        status: data?.status || 'Attended',
        next_followup_date: data?.next_followup_date || '',
        reg_date: new Date().toISOString().substring(0, 10),
        software_requirements: data?.software_requirements || '',
        quotations_count: 0,
        quotations: []
      }
      if (window.__mockGeneralClients) {
        window.__mockGeneralClients.unshift(newGenClient)
      }

      // Mirror to mock Leads if available
      if (window.__mockLeads) {
        const alreadyInLeads = window.__mockLeads.some(
          l => l.client_name?.toLowerCase() === (newGenClient.client_name || '').toLowerCase() &&
               l.client_phone === newGenClient.contact_number
        )
        if (!alreadyInLeads) {
          const newLeadId = window.__mockLeads.length > 0 ? Math.max(...window.__mockLeads.map(l => l.id)) + 1 : 1
          window.__mockLeads.unshift({
            id: newLeadId,
            lead_id: `LEAD26${String(newLeadId).padStart(5, '0')}`,
            employee_id: getLoggedInMockEmployee().id,
            client_name: newGenClient.client_name,
            client_email: newGenClient.email || '',
            client_phone: newGenClient.contact_number,
            client_alternate_phone: newGenClient.alt_contact_number || null,
            company_name: newGenClient.company_name || null,
            address: newGenClient.address || null,
            city: newGenClient.district || null,
            state: newGenClient.state || null,
            pin_code: newGenClient.pin_code || null,
            country: newGenClient.country_code === 'IN' ? 'India' : (newGenClient.country_code || 'India'),
            country_code: newGenClient.country_code || 'IN',
            lead_source: newGenClient.lead_source || 'Website',
            lead_status: 'new',
            lead_priority: 'medium',
            category_id: 'general_client',
            category_name: 'General Client',
            product_name: newGenClient.software_requirements || 'General Client Services',
            product_interest: newGenClient.software_requirements || 'General Client Services',
            software_requirements: newGenClient.software_requirements,
            selected_services: newGenClient.software_requirements ? newGenClient.software_requirements.split(',').map(s => s.trim()) : [],
            gst_type: newGenClient.gst_type || null,
            gstin: newGenClient.gstin || null,
            follow_up_date: newGenClient.next_followup_date || null,
            next_follow_up: newGenClient.next_followup_date || null,
            notes: `[Created from General Client Panel] Services: ${newGenClient.software_requirements}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            employee: getLoggedInMockEmployee(),
            activities: []
          })
        }
      }

      return { success: true, data: newGenClient, message: 'General client created successfully' }
    }

    return {
      success: true,
      data: window.__mockGeneralClients || []
    }
  }


  // GET /admin/country-taxes & PUT /admin/country-taxes/:id
  if (lowercaseUrl.includes('/admin/country-taxes')) {
    const updateTaxMatch = lowercaseUrl.match(/\/admin\/country-taxes\/(\d+)$/)
    if (updateTaxMatch && method === 'PUT') {
      const taxId = parseInt(updateTaxMatch[1], 10)
      let updatedItem = null
      if (window.__mockCountryTaxes) {
        window.__mockCountryTaxes = window.__mockCountryTaxes.map(t => {
          if (t.id === taxId) {
            updatedItem = {
              ...t,
              tax_name: data?.tax_name ?? t.tax_name,
              tax_rate: data?.tax_rate ?? t.tax_rate,
              is_active: data?.is_active ?? t.is_active
            }
            return updatedItem
          }
          return t
        })
      }
      return { success: true, data: updatedItem || data, message: 'Country tax updated' }
    }
    return { success: true, data: window.__mockCountryTaxes || [] }
  }

  // POST /admin/products/:id/country-price
  if (lowercaseUrl.includes('/country-price')) {
    return {
      success: true,
      message: 'Country price updated successfully',
      data: { ...data }
    }
  }

  // GET /public/subcategories-with-products
  if (lowercaseUrl.includes('/public/subcategories-with-products')) {
    return {
      success: true,
      data: [
        {
          id: 1,
          name: 'Web & ERP Solutions',
          products: [
            { id: 1, name: 'Corporate Informative Website', processing_fee: 15000, monthly_subscription: 1500, currency: 'INR', description: 'Complete corporate dynamic website with admin login details.' },
            { id: 2, name: 'School Management ERP Suite', processing_fee: 35000, monthly_subscription: 3500, currency: 'INR', description: 'Complete School ERP with Fee Management, Attendance, and Exam Portal.' },
            { id: 3, name: 'Hospital & Clinic POS Software', processing_fee: 28000, monthly_subscription: 2500, currency: 'INR', description: 'OPD, Pharmacy, Billing, and Patient EMR system.' }
          ]
        }
      ]
    }
  }

  // GET /admin/clients (Subscription clients)
  if (lowercaseUrl.includes('/admin/clients')) {
    return {
      success: true,
      data: {
        all_clients: [
          { id: 1, name: 'Greenfield School', email: 'greenfield@school.com', plan: 'Silver Plan', is_active: true },
          { id: 2, name: 'Apex Retailers', email: 'apex@retail.com', plan: 'Gold Plan', is_active: true }
        ]
      }
    }
  }

  // 2. Employee Auth Mocks
  if (lowercaseUrl.includes('/login') && !lowercaseUrl.includes('/client/') && !lowercaseUrl.includes('/partner/')) {
    const employeeInfo = {
      id: 2,
      employee_id: 'AIM260001',
      first_name: 'John',
      last_name: 'Doe',
      full_name: 'John Doe',
      name: 'John Doe',
      email: data?.email || 'john.doe@test.com',
      phone: '9876543210',
      role: 'employee',
      is_active: true,
      department: { id: 1, name: 'Technology' },
      designation: { id: 1, name: 'Software Engineer' }
    }
    return {
      success: true,
      token: 'mock-employee-token-12345',
      user: employeeInfo,
      employee: employeeInfo
    }
  }

  if (lowercaseUrl.includes('/employee/check')) {
    return {
      success: true,
      data: {
        id: 2,
        employee_id: 'AIM260001',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        name: 'John Doe',
        email: 'john.doe@test.com',
        role: 'employee',
        is_active: true
      }
    }
  }

  if (lowercaseUrl.includes('/employee/profile')) {
    if (method?.toUpperCase() === 'PUT') {
      return {
        success: true,
        message: 'Profile updated successfully'
      }
    }
    return {
      success: true,
      data: {
        id: 2,
        employee_id: 'AIM260001',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        email: 'john.doe@test.com',
        phone: '9876543210',
        alternate_phone: '9876543211',
        dob: '1990-01-15',
        gender: 'male',
        current_address: '123 Main Street, Bangalore',
        permanent_address: '456 Home Street, Delhi',
        aadhar_number: '123456789012',
        pan_number: 'ABCDE1234F',
        bank_name: 'HDFC Bank',
        account_number: '12345678901234',
        ifsc_code: 'HDFC0001234',
        upi_id: 'john.doe@hdfc',
        employment_status: 'Active',
        office_start_time: '09:00',
        office_end_time: '18:00',
        joining_date: '2026-01-01',
        confirmation_date: '2026-04-01',
        department: { id: 1, name: 'Technology' },
        designation: { id: 1, name: 'Software Engineer' }
      }
    }
  }

  // 2.5 Employee Leads Mocks
  if (lowercaseUrl.includes('/employee/leads')) {
    const leadsList = window.__mockLeads || []

    // GET /employee/leads/stats
    if (lowercaseUrl.includes('/employee/leads/stats')) {
      const total = leadsList.length
      const active = leadsList.filter(l => !l.is_converted && l.lead_status !== 'lost' && l.lead_status !== 'junk').length
      const converted = leadsList.filter(l => l.is_converted || l.lead_status === 'converted').length
      const lost = leadsList.filter(l => l.lead_status === 'lost').length
      const junk = leadsList.filter(l => l.lead_status === 'junk').length
      const newLeads = leadsList.filter(l => l.lead_status === 'new').length
      const contacted = leadsList.filter(l => l.lead_status === 'contacted').length
      const qualified = leadsList.filter(l => l.lead_status === 'qualified').length
      const proposal = leadsList.filter(l => l.lead_status === 'proposal').length
      const negotiation = leadsList.filter(l => l.lead_status === 'negotiation').length

      const urgent = leadsList.filter(l => l.lead_priority === 'urgent').length
      const high = leadsList.filter(l => l.lead_priority === 'high').length
      const medium = leadsList.filter(l => l.lead_priority === 'medium').length
      const low = leadsList.filter(l => l.lead_priority === 'low').length

      const todayStr = new Date().toISOString().split('T')[0]
      const followUpToday = leadsList.filter(l => l.follow_up_date && l.follow_up_date.startsWith(todayStr)).length
      const pendingFollowUp = leadsList.filter(l => {
        if (!l.follow_up_date) return false
        const dateStr = l.follow_up_date.split(' ')[0]
        return dateStr < todayStr && l.lead_status !== 'converted' && l.lead_status !== 'lost' && l.lead_status !== 'junk'
      }).length
      const todayDemo = leadsList.filter(l => l.demo_slot && l.demo_slot.startsWith(todayStr)).length

      const allActivities = []
      leadsList.forEach(lead => {
        if (lead.activities) {
          lead.activities.forEach(act => {
            allActivities.push({
              ...act,
              client_name: lead.client_name,
              lead_public_id: lead.lead_id
            })
          })
        }
      })
      allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      return {
        success: true,
        data: {
          summary: {
            total_leads: total,
            active_leads: active,
            converted_leads: converted,
            conversion_rate: total > 0 ? Math.round((converted / total) * 100) + '%' : '0%',
            this_month_leads: total
          },
          status_breakdown: {
            new: newLeads,
            contacted,
            qualified,
            proposal,
            negotiation,
            converted,
            lost,
            junk
          },
          priority_breakdown: {
            urgent,
            high,
            medium,
            low
          },
          follow_ups: {
            today: followUpToday,
            pending: pendingFollowUp
          },
          demos: {
            today: todayDemo
          },
          recent_activities: allActivities.slice(0, 10)
        }
      }
    }

    // POST /employee/leads/bulk-assign
    if (lowercaseUrl.includes('/employee/leads/bulk-assign') && method === 'POST') {
      const { lead_ids, assigned_to, notes } = data || {}
      const targetEmp = MOCK_EMPLOYEES.find(e => e.id === Number(assigned_to)) || MOCK_EMPLOYEES[1]

      let count = 0
      window.__mockLeads = leadsList.map(l => {
        if (lead_ids.includes(l.id)) {
          count++
          const updatedLead = {
            ...l,
            assigned_to: targetEmp.id,
            assigned_by: getLoggedInMockEmployee().id,
            updated_at: new Date().toISOString()
          }
          if (!updatedLead.activities) updatedLead.activities = []
          updatedLead.activities.unshift({
            id: Math.floor(Math.random() * 100000),
            lead_id: l.id,
            employee_id: getLoggedInMockEmployee().id,
            activity_type: 'note',
            description: `Lead assigned to ${targetEmp.full_name}`,
            notes: notes || 'Assigned via bulk assignment.',
            scheduled_date: null,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            employee: getLoggedInMockEmployee()
          })
          return updatedLead
        }
        return l
      })

      return {
        success: true,
        message: `${count} lead(s) assigned successfully`,
        data: {
          assigned_count: count,
          assigned_to: targetEmp,
          assigned_by: getLoggedInMockEmployee()
        }
      }
    }

    // DELETE /employee/leads/{id}
    const deleteMatch = lowercaseUrl.match(/\/employee\/leads\/(\d+)$/)
    if (deleteMatch && method === 'DELETE') {
      const leadId = parseInt(deleteMatch[1])
      window.__mockLeads = leadsList.filter(l => l.id !== leadId)
      return {
        success: true,
        message: 'Lead deleted successfully'
      }
    }

    // PUT /employee/leads/{id}/status
    const statusMatch = lowercaseUrl.match(/\/employee\/leads\/(\d+)\/status$/)
    if (statusMatch && method === 'PUT') {
      const leadId = parseInt(statusMatch[1])
      const { status, notes, lost_reason } = data || {}

      let updated = null
      window.__mockLeads = leadsList.map(l => {
        if (l.id === leadId) {
          const updatedLead = {
            ...l,
            lead_status: status,
            lost_reason: status === 'lost' ? lost_reason : null,
            is_converted: status === 'converted' ? true : l.is_converted,
            conversion_date: status === 'converted' ? new Date().toISOString() : l.conversion_date,
            updated_at: new Date().toISOString()
          }
          if (!updatedLead.activities) updatedLead.activities = []
          updatedLead.activities.unshift({
            id: Math.floor(Math.random() * 100000),
            lead_id: l.id,
            employee_id: getLoggedInMockEmployee().id,
            activity_type: 'note',
            description: `Status updated to ${status.toUpperCase()}`,
            notes: notes || `Lead status changed to ${status}.`,
            scheduled_date: null,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            employee: getLoggedInMockEmployee()
          })
          updated = updatedLead
          return updatedLead
        }
        return l
      })

      if (updated) {
        return {
          success: true,
          message: 'Lead status updated successfully',
          data: {
            id: updated.id,
            lead_status: updated.lead_status,
            notes: notes || `Lead status changed to ${status}.`
          }
        }
      } else {
        return { success: false, message: 'Lead not found' }
      }
    }

    // POST /employee/leads/{id}/activity
    const activityMatch = lowercaseUrl.match(/\/employee\/leads\/(\d+)\/activity$/)
    if (activityMatch && method === 'POST') {
      const leadId = parseInt(activityMatch[1])
      const { activity_type, description, notes, scheduled_date } = data || {}

      let newActivity = null
      window.__mockLeads = leadsList.map(l => {
        if (l.id === leadId) {
          newActivity = {
            id: Math.floor(Math.random() * 100000),
            lead_id: l.id,
            employee_id: getLoggedInMockEmployee().id,
            activity_type: activity_type || 'note',
            description: description || 'Logged activity',
            notes: notes || '',
            scheduled_date: scheduled_date ? new Date(scheduled_date).toISOString() : null,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            employee: getLoggedInMockEmployee()
          }
          const updatedLead = {
            ...l,
            follow_up_date: scheduled_date || l.follow_up_date,
            next_follow_up: scheduled_date || l.next_follow_up,
            updated_at: new Date().toISOString()
          }
          if (!updatedLead.activities) updatedLead.activities = []
          updatedLead.activities.unshift(newActivity)
          return updatedLead
        }
        return l
      })

      if (newActivity) {
        return {
          success: true,
          message: 'Activity added successfully',
          data: newActivity
        }
      } else {
        return { success: false, message: 'Lead not found' }
      }
    }

    // POST /employee/leads/{id}/send-demo
    const sendDemoMatch = lowercaseUrl.match(/\/employee\/leads\/(\d+)\/send-demo$/)
    if (sendDemoMatch && method === 'POST') {
      const leadId = parseInt(sendDemoMatch[1])
      const { email } = data || {}

      let updated = false
      window.__mockLeads = leadsList.map(l => {
        if (l.id === leadId) {
          updated = true
          const updatedLead = {
            ...l,
            client_email: email || l.client_email,
            lead_status: l.lead_status === 'new' ? 'contacted' : l.lead_status,
            updated_at: new Date().toISOString()
          }
          if (!updatedLead.activities) updatedLead.activities = []
          updatedLead.activities.unshift({
            id: Math.floor(Math.random() * 100000),
            lead_id: l.id,
            employee_id: getLoggedInMockEmployee().id,
            activity_type: 'email',
            description: 'School Software Demo Sent',
            notes: `Emailed school ERP software demo details to: ${email || l.client_email || 'client'}`,
            scheduled_date: null,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            employee: getLoggedInMockEmployee()
          })
          return updatedLead
        }
        return l
      })

      if (updated) {
        return {
          success: true,
          message: 'School software demo email sent successfully!'
        }
      } else {
        return { success: false, message: 'Lead not found' }
      }
    }

    // GET /employee/leads/{id}
    const detailsMatch = lowercaseUrl.match(/\/employee\/leads\/(\d+)$/)
    if (detailsMatch && method === 'GET') {
      const leadId = parseInt(detailsMatch[1])
      const lead = leadsList.find(l => l.id === leadId)
      if (lead) {
        return {
          success: true,
          data: {
            lead: lead,
            activities: lead.activities || []
          }
        }
      } else {
        return { success: false, message: 'Lead not found' }
      }
    }

    // PUT /employee/leads/{id}
    const updateMatch = lowercaseUrl.match(/\/employee\/leads\/(\d+)$/)
    if (updateMatch && method === 'PUT') {
      const leadId = parseInt(updateMatch[1])
      let updated = null

      window.__mockLeads = leadsList.map(l => {
        if (l.id === leadId) {
          const isStatusChanged = data.lead_status !== undefined && data.lead_status !== l.lead_status
          const newStatus = data.lead_status !== undefined ? data.lead_status : l.lead_status
          const updatedLead = {
            ...l,
            client_name: data.client_name || l.client_name,
            client_email: data.client_email || l.client_email,
            client_phone: data.client_phone || l.client_phone,
            client_alternate_phone: data.client_alternate_phone !== undefined ? data.client_alternate_phone : l.client_alternate_phone,
            company_name: data.company_name !== undefined ? data.company_name : l.company_name,
            address: data.address !== undefined ? data.address : l.address,
            city: data.city !== undefined ? data.city : l.city,
            state: data.state !== undefined ? data.state : l.state,
            pin_code: data.pin_code !== undefined ? data.pin_code : l.pin_code,
            country: data.country || l.country,
            lead_source: data.lead_source || l.lead_source,
            lead_priority: data.lead_priority || l.lead_priority,
            lead_status: newStatus,
            is_converted: newStatus === 'converted' ? true : (data.lead_status !== undefined ? false : l.is_converted),
            conversion_date: newStatus === 'converted' ? new Date().toISOString() : (data.lead_status !== undefined ? null : l.conversion_date),
            budget: data.budget !== undefined ? String(data.budget) : l.budget,
            expected_close_date: data.expected_close_date !== undefined ? data.expected_close_date : l.expected_close_date,
            follow_up_date: data.follow_up_date !== undefined ? data.follow_up_date : (data.expected_close_date !== undefined ? data.expected_close_date : l.follow_up_date),
            next_follow_up: data.follow_up_date !== undefined ? data.follow_up_date : (data.expected_close_date !== undefined ? data.expected_close_date : l.next_follow_up),
            notes: data.notes || l.notes,
            updated_at: new Date().toISOString()
          }
          if (isStatusChanged) {
            if (!updatedLead.activities) updatedLead.activities = []
            updatedLead.activities.unshift({
              id: Math.floor(Math.random() * 100000),
              lead_id: l.id,
              employee_id: getLoggedInMockEmployee().id,
              activity_type: 'note',
              description: `Status updated to ${newStatus.toUpperCase()}`,
              notes: `Lead status changed to ${newStatus} via lead edit.`,
              scheduled_date: null,
              completed_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              employee: getLoggedInMockEmployee()
            })
          }
          updated = updatedLead
          return updatedLead
        }
        return l
      })

      if (updated) {
        return {
          success: true,
          message: 'Lead updated successfully',
          data: {
            id: updated.id,
            lead_id: updated.lead_id,
            client_name: updated.client_name,
            lead_priority: updated.lead_priority,
            lead_status: updated.lead_status,
            budget: updated.budget,
            notes: updated.notes
          }
        }
      } else {
        return { success: false, message: 'Lead not found' }
      }
    }

    // POST /employee/leads/{id}/convert
    const convertMatch = lowercaseUrl.match(/\/employee\/leads\/(\d+)\/convert$/)
    if (convertMatch && method === 'POST') {
      const leadId = parseInt(convertMatch[1])
      const lead = leadsList.find(l => l.id === leadId)
      if (lead) {
        lead.is_converted = true
        lead.lead_status = 'converted'
        lead.conversion_date = new Date().toISOString()
        const newClientId = `GC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
        const newGenClient = {
          id: Math.floor(Date.now() + Math.random() * 1000),
          client_id: newClientId,
          client_name: lead.client_name,
          company_name: lead.company_name || lead.client_name,
          contact_person: lead.client_name,
          email: lead.client_email || '',
          contact_number: lead.client_phone || '',
          alt_contact_number: lead.client_alternate_phone || '',
          address: lead.address || '',
          district: lead.city || '',
          state: lead.state || '',
          pin_code: lead.pin_code || '',
          country_code: lead.country_code || 'IN',
          gst_type: lead.gst_type || 'Intra-State',
          gstin: '',
          lead_source: lead.lead_source || 'Website',
          referred_by: lead.referred_by || 'Direct',
          sold_by_name: getLoggedInMockEmployee().full_name || 'Employee',
          branch_name: 'Head Office (Gurugram)',
          status: 'Attended',
          next_followup_date: lead.follow_up_date || '',
          reg_date: new Date().toISOString().substring(0, 10),
          software_requirements: Array.isArray(lead.software_requirements) ? lead.software_requirements.join(', ') : (lead.software_requirements || lead.product_interest || ''),
          quotations_count: 0,
          quotations: []
        }
        if (window.__mockGeneralClients) {
          window.__mockGeneralClients.unshift(newGenClient)
        }
        return {
          success: true,
          message: 'Lead successfully converted to Client!',
          data: { client_id: newClientId, client: newGenClient }
        }
      } else {
        return { success: false, message: 'Lead not found for conversion' }
      }
    }

    // POST /employee/leads/{id}/assign-demo-slot
    const assignSlotMatch = lowercaseUrl.match(/\/employee\/leads\/(\d+)\/assign-demo-slot$/)
    if (assignSlotMatch && method === 'POST') {
      const leadId = parseInt(assignSlotMatch[1])
      const slotId = data?.demo_slot_id
      const lead = leadsList.find(l => l.id === leadId)
      if (lead) {
        lead.demo_status = 'scheduled'
        lead.demo_slot = new Date().toISOString()
        return {
          success: true,
          message: 'Demo slot assigned to lead successfully!',
          data: lead
        }
      } else {
        return { success: false, message: 'Lead not found' }
      }
    }

    // POST /employee/leads (Create)
    if (method === 'POST') {
      const newId = leadsList.length > 0 ? Math.max(...leadsList.map(l => l.id)) + 1 : 1
      const leadId = `LEAD26${String(newId).padStart(5, '0')}`
      const followUp = data.follow_up_date || data.expected_close_date || null
      const isGeneralClient = data.category_id === 'general_client' || data.category_name === 'General Client'
      const servicesStr = data.software_requirements || (Array.isArray(data.selected_services) ? data.selected_services.join(', ') : '') || data.product_name || data.product_interest || null

      const newLead = {
        id: newId,
        lead_id: leadId,
        employee_id: getLoggedInMockEmployee().id,
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        client_alternate_phone: data.client_alternate_phone || null,
        company_name: data.company_name || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pin_code: data.pin_code || null,
        country: data.country || 'India',
        country_code: data.country_code || 'IN',
        lead_source: data.lead_source || 'Website',
        lead_status: data.lead_status || 'new',
        lead_priority: data.lead_priority || 'medium',
        category_id: data.category_id || (isGeneralClient ? 'general_client' : null),
        category_name: isGeneralClient ? 'General Client' : (data.category_name || null),
        sub_category_id: data.sub_category_id || null,
        product_id: data.product_id || null,
        product_name: isGeneralClient ? (servicesStr || 'General Client Services') : (data.product_name || data.product_interest || null),
        product_interest: isGeneralClient ? (servicesStr || 'General Client Services') : (data.product_interest || data.product_name || null),
        software_requirements: servicesStr,
        selected_services: Array.isArray(data.selected_services) ? data.selected_services : (servicesStr ? servicesStr.split(',').map(s => s.trim()) : []),
        gst_type: data.gst_type || null,
        gstin: data.gstin || null,
        product_processing_fee: data.product_processing_fee || null,
        product_monthly_subscription: data.product_monthly_subscription || null,
        assigned_to: data.assigned_to || null,
        assigned_by: data.assigned_to ? getLoggedInMockEmployee().id : null,
        follow_up_date: followUp,
        next_follow_up: followUp,
        notes: data.notes || null,
        remarks: null,
        budget: data.budget ? String(data.budget) : '0.00',
        expected_close_date: data.expected_close_date || null,
        conversion_date: null,
        converted_to_client_id: null,
        is_converted: false,
        is_active: true,
        lost_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        employee: getLoggedInMockEmployee(),
        activities: []
      }
      leadsList.unshift(newLead)
      window.__mockLeads = leadsList

      // Mirror to mock General Clients if it is a general client and not already present
      if (isGeneralClient && window.__mockGeneralClients) {
        const alreadyExists = window.__mockGeneralClients.some(
          c => c.client_name?.toLowerCase() === (data.client_name || '').toLowerCase() &&
               c.contact_number === data.client_phone
        )
        if (!alreadyExists) {
          window.__mockGeneralClients.unshift({
            id: Math.floor(Date.now() + Math.random() * 1000),
            client_id: `GC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
            client_name: data.client_name || 'New Client',
            company_name: data.company_name || '',
            contact_person: data.client_name || '',
            email: data.client_email || '',
            contact_number: data.client_phone || '',
            alt_contact_number: data.client_alternate_phone || '',
            address: data.address || '',
            district: data.city || '',
            state: data.state || '',
            pin_code: data.pin_code || '',
            country_code: data.country_code || 'IN',
            gst_type: data.gst_type || 'Intra-State',
            gstin: data.gstin || '',
            lead_source: data.lead_source || 'Direct Enquiry',
            referred_by: 'Direct / None',
            sold_by_name: getLoggedInMockEmployee()?.full_name || 'Employee',
            branch_name: 'Head Office (Gurugram)',
            status: 'Attended',
            next_followup_date: followUp || '',
            reg_date: new Date().toISOString().substring(0, 10),
            software_requirements: servicesStr || '',
            quotations_count: 0,
            quotations: []
          })
        }
      }

      return {
        success: true,
        message: "Lead created successfully",
        data: {
          lead: newLead,
          lead_id: leadId
        }
      }
    }

    // GET /employee/leads (List with filters)
    try {
      const urlObj = new URL(url, 'https://dummy.com')
      const searchParams = urlObj.searchParams
      const filterStatus = searchParams.get('status')
      const filterPriority = searchParams.get('priority')
      const filterSearch = searchParams.get('search')?.toLowerCase()
      const followUpTodayFlag = searchParams.get('follow_up_today') === 'true'
      const pendingFollowUpFlag = searchParams.get('pending_follow_up') === 'true'
      const todayDemoFlag = searchParams.get('today_demo') === 'true'

      let filtered = [...leadsList]

      if (filterStatus) {
        filtered = filtered.filter(l => l.lead_status === filterStatus)
      }
      if (filterPriority) {
        filtered = filtered.filter(l => l.lead_priority === filterPriority)
      }
      if (filterSearch) {
        filtered = filtered.filter(l =>
          l.client_name?.toLowerCase().includes(filterSearch) ||
          l.client_email?.toLowerCase().includes(filterSearch) ||
          l.company_name?.toLowerCase().includes(filterSearch) ||
          l.product_interest?.toLowerCase().includes(filterSearch) ||
          l.lead_id?.toLowerCase().includes(filterSearch)
        )
      }
      const todayStr = new Date().toISOString().split('T')[0]
      if (followUpTodayFlag) {
        filtered = filtered.filter(l => l.follow_up_date && l.follow_up_date.startsWith(todayStr))
      }
      if (pendingFollowUpFlag) {
        filtered = filtered.filter(l => {
          if (!l.follow_up_date) return false
          const dateStr = l.follow_up_date.split(' ')[0]
          return dateStr < todayStr && l.lead_status !== 'converted' && l.lead_status !== 'lost' && l.lead_status !== 'junk'
        })
      }
      if (todayDemoFlag) {
        filtered = filtered.filter(l => l.demo_slot && l.demo_slot.startsWith(todayStr))
      }

      return {
        success: true,
        data: {
          current_page: 1,
          data: filtered,
          total: filtered.length,
          per_page: 20
        }
      }
    } catch (e) {
      console.error('Error parsing mock leads query filters:', e)
      return {
        success: true,
        data: {
          current_page: 1,
          data: leadsList,
          total: leadsList.length,
          per_page: 20
        }
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
        activated_at: '2026-01-02',
        client_order: {
          created_at: '2025-03-28T10:00:00.000Z',
          delivery_date: '2025-07-31T10:00:00.000Z'
        }
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
        address_line_1: '#139, Rajdanga Main Road',
        client_order: {
          created_at: '2025-03-28T10:00:00.000Z',
          delivery_date: '2025-07-31T10:00:00.000Z'
        }
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
          activated_at: '2026-01-02',
          client_order: {
            created_at: '2025-03-28T10:00:00.000Z',
            delivery_date: '2025-07-31T10:00:00.000Z'
          }
        }
      ]
    }
  }
  if (lowercaseUrl.includes('/client/student-count')) {
    return {
      success: true,
      data: {
        student_count: 250,
        min_students: 215  // students covered by the initial paid subscription
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

    // Simulate: 250 total students, 215 were paid initially → 35 new unpaid students
    const studentCount = 250
    const baseStudentCount = 215 // students paid at first subscription
    const extraStudents = studentCount - baseStudentCount // 35 new unpaid students
    const hasExtraStudents = extraStudents > 0

    const baseMonthly = studentCount * 10
    const baseTotal = baseMonthly * mult
    const discountVal = baseTotal * (disc / 100)
    const subtotal = baseTotal - discountVal
    const gst = subtotal * 0.18
    const grandTotal = subtotal + gst

    // Pro-rated extra students amount (simplified: extra students * rate * remaining fraction of cycle)
    const extraMonthly = extraStudents * 10
    const extraSubtotal = extraMonthly * mult * (1 - disc / 100)
    const extraGst = extraSubtotal * 0.18
    const extraTotal = extraSubtotal + extraGst

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
          savings: discountVal,
          // Extra students fields — key fields read by Products.jsx
          extra_students_overdue: hasExtraStudents ? extraStudents : 0,
          is_extra_students_payment: hasExtraStudents,
          extra_students_amount: hasExtraStudents ? Math.round(extraTotal * 100) / 100 : 0
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
    if (typeof window !== 'undefined') {
      window.__mockSubscriptionPaid = true
    }
    return {
      success: true,
      message: 'Subscription payment successfully processed and recorded (Mock Mode).'
    }
  }

  if (lowercaseUrl.includes('/client/payment-status')) {
    const isPaid = typeof window !== 'undefined' && window.__mockSubscriptionPaid
    return {
      success: true,
      data: {
        show_pay_now: !isPaid,
        next_payment_date: isPaid ? '2027-07-15' : '2026-07-15',
        message: isPaid ? 'Your subscription is active.' : 'Your subscription period has ended. Please renew your subscription.',
        has_previous_payments: true,
        total_payments_made: isPaid ? 3 : 2,
        delivery_info: {
          first_payment_date: '2026-01-01',
          last_payment_date: isPaid ? new Date().toISOString().split('T')[0] : '2026-04-01',
          last_payment_cycle: 'quarterly',
          next_due_date: isPaid ? '2027-07-15' : '2026-07-15',
          days_until_due: isPaid ? 365 : 30,
          is_period_over: false,
          activated_at: '2026-01-02',
          unpaid_months: isPaid ? [] : ['May 2026', 'June 2026'],
          total_due_amount: isPaid ? 0 : 5000
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

  if (lowercaseUrl.includes('/client/customization/pending-payments')) {
    const pending = (window.__mockCustomizationRequests || []).filter(r => r.status === 'amount_set')
    return {
      success: true,
      data: {
        pending_requests: pending
      }
    }
  }

  if (lowercaseUrl.includes('/client/customization/payment-history')) {
    return {
      success: true,
      data: {
        payments: window.__mockCustomizationPayments || []
      }
    }
  }

  if (lowercaseUrl.includes('/client/customization/create-payment-order')) {
    const reqId = Number(data?.customization_request_id)
    let orderAmount = data?.amount || 5000

    if (typeof window !== 'undefined' && window.__mockCustomizationRequests) {
      const found = window.__mockCustomizationRequests.find(r => r.id === reqId)
      if (found && found.amount) {
        orderAmount = found.amount
      }
    }

    return {
      success: true,
      simulated: true,
      amount: orderAmount,
      order_id: 'order_cust_' + Math.random().toString(36).substring(2, 12),
      payment_record_id: 'record_' + Math.random().toString(36).substring(2, 12),
      key: 'rzp_test_mockkey123',
      currency: 'INR',
      client_name: 'Demo Client School',
      client_email: 'client@demo.com'
    }
  }

  if (lowercaseUrl.includes('/client/customization/verify-payment')) {
    const reqId = data?.customization_request_id ? Number(data.customization_request_id) : null
    const payId = data?.razorpay_payment_id || 'pay_mock_' + Date.now()

    if (typeof window !== 'undefined' && window.__mockCustomizationRequests) {
      if (reqId) {
        const reqIdx = window.__mockCustomizationRequests.findIndex(r => r.id === reqId)
        if (reqIdx !== -1) {
          const req = window.__mockCustomizationRequests[reqIdx]
          window.__mockCustomizationRequests[reqIdx] = {
            ...req,
            status: 'success'
          }

          if (!window.__mockCustomizationPayments) window.__mockCustomizationPayments = []
          window.__mockCustomizationPayments.push({
            id: Math.max(...(window.__mockCustomizationPayments || []).map(p => p.id), 200) + 1,
            razorpay_payment_id: payId,
            customization_text: req.customization_text,
            amount: req.amount || 0,
            status: 'success',
            created_at: new Date().toISOString()
          })
        }
      } else {
        // Consolidated bulk checkout
        const pendingReqs = window.__mockCustomizationRequests.filter(r => r.status === 'amount_set')
        pendingReqs.forEach(req => {
          req.status = 'success'
          if (!window.__mockCustomizationPayments) window.__mockCustomizationPayments = []
          window.__mockCustomizationPayments.push({
            id: Math.max(...(window.__mockCustomizationPayments || []).map(p => p.id), 200) + 1,
            razorpay_payment_id: payId,
            customization_text: req.customization_text,
            amount: req.amount || 0,
            status: 'success',
            created_at: new Date().toISOString()
          })
        })
      }
    }

    return {
      success: true,
      message: 'Customization payment verified successfully (Mock Mode).'
    }
  }

  if (lowercaseUrl.includes('/client/customization/requests')) {
    return {
      success: true,
      data: {
        requests: window.__mockCustomizationRequests || []
      }
    }
  }

  if (lowercaseUrl.includes('/client/customization/submit')) {
    const text = data?.customization_text || ''
    const newId = Math.max(...(window.__mockCustomizationRequests || []).map(r => r.id), 100) + 1
    const newReq = {
      id: newId,
      customization_text: text,
      amount: null,
      status: 'pending',
      created_at: new Date().toISOString()
    }
    if (typeof window !== 'undefined') {
      if (!window.__mockCustomizationRequests) window.__mockCustomizationRequests = []
      window.__mockCustomizationRequests.push(newReq)
    }
    return {
      success: true,
      message: 'Customization request submitted successfully.'
    }
  }

  // --- Client Addon Services Mocks ---
  if (lowercaseUrl.includes('/client/addon/history')) {
    if (typeof window !== 'undefined' && !window.__mockAddonHistory) {
      window.__mockAddonHistory = [
        {
          addon_type: 'Transportation',
          recipient_type: 'student',
          student_count: 850,
          teacher_count: null,
          start_date_formatted: '01 Jun 2026',
          end_date_formatted: '01 Jun 2027',
          subtotal: 30600,
          gst_amount: 5508,
          amount: 36108,
          amount_formatted: '₹ 36,108.00',
          subtotal_formatted: '₹ 30,600.00',
          gst_amount_formatted: '₹ 5,508.00',
          payment_date_formatted: '10 Jun 2026',
          payment_id: 'pay_addon_1001',
          payment_status: 'paid'
        },
        {
          addon_type: 'Hostel',
          recipient_type: 'student',
          student_count: 50,
          teacher_count: null,
          start_date_formatted: '01 Jul 2026',
          end_date_formatted: '01 Jul 2027',
          subtotal: 3000,
          gst_amount: 540,
          amount: 3540,
          amount_formatted: '₹ 3,540.00',
          subtotal_formatted: '₹ 3,000.00',
          gst_amount_formatted: '₹ 540.00',
          payment_date_formatted: '—',
          payment_id: 'pay_addon_1002',
          payment_status: 'pending'
        }
      ]
    }
    return {
      success: true,
      data: window.__mockAddonHistory || []
    }
  }

  if (lowercaseUrl.includes('/client/addon/preview')) {
    try {
      const urlObj = new URL(url, 'https://dummy.com')
      const addonType = urlObj.searchParams.get('addon_type') || 'Transportation'
      const recipientType = urlObj.searchParams.get('recipient_type') || 'student'

      let count = recipientType === 'teacher' ? 45 : 850
      if (addonType === 'Hostel' || addonType === 'hostel') count = 50
      let rate = 36
      if (addonType === 'Hostel' || addonType === 'hostel') rate = 60
      else if (addonType === 'Domain Services') rate = 7300
      else if (addonType === 'id card Type A') rate = 60
      else if (addonType === 'id card Type B') rate = 42
      else if (addonType === 'id card Type C') rate = 37
      else if (addonType === 'Previous Year Backup' || addonType === 'previous_year') rate = 36

      const finalCount = addonType === 'Domain Services' ? 1 : count
      const subtotal = rate * finalCount
      const gst = Math.round(subtotal * 18) / 100
      const total = subtotal + gst

      return {
        success: true,
        data: {
          addon_type: addonType,
          recipient_type: recipientType,
          rate: rate,
          rate_formatted: `₹ ${rate.toLocaleString('en-IN')}`,
          student_count: recipientType === 'student' ? finalCount : null,
          teacher_count: recipientType === 'teacher' ? finalCount : null,
          subtotal: subtotal,
          subtotal_formatted: `₹ ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          gst_percentage: 18,
          gst_amount: gst,
          gst_amount_formatted: `₹ ${gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          amount: total,
          amount_formatted: `₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (lowercaseUrl.includes('/client/addon/create-order') && method === 'POST') {
    const { addon_type, recipient_type } = data || {}
    let count = recipient_type === 'teacher' ? 45 : 850
    if (addon_type === 'Hostel' || addon_type === 'hostel') count = 50
    let rate = 36
    if (addon_type === 'Hostel' || addon_type === 'hostel') rate = 60
    else if (addon_type === 'Domain Services') rate = 7300
    else if (addon_type === 'id card Type A') rate = 60
    else if (addon_type === 'id card Type B') rate = 42
    else if (addon_type === 'id card Type C') rate = 37
    else if (addon_type === 'Previous Year Backup' || addon_type === 'previous_year') rate = 36

    const finalCount = addon_type === 'Domain Services' ? 1 : count
    const subtotal = rate * finalCount
    const gst = subtotal * 0.18
    const total = subtotal + gst

    return {
      success: true,
      simulated: true,
      order_id: 'order_addon_' + Math.floor(Math.random() * 1000000),
      amount: total,
      currency: 'INR',
      client_name: 'Greenfield School',
      client_email: 'info@greenfield.edu.in'
    }
  }

  if (lowercaseUrl.includes('/client/addon/verify-payment') && method === 'POST') {
    const { addon_type, recipient_type } = data || {}
    let count = recipient_type === 'teacher' ? 45 : 850
    if (addon_type === 'Hostel' || addon_type === 'hostel') count = 50
    let rate = 36
    if (addon_type === 'Hostel' || addon_type === 'hostel') rate = 60
    else if (addon_type === 'Domain Services') rate = 7300
    else if (addon_type === 'id card Type A') rate = 60
    else if (addon_type === 'id card Type B') rate = 42
    else if (addon_type === 'id card Type C') rate = 37
    else if (addon_type === 'Previous Year Backup' || addon_type === 'previous_year') rate = 36

    const finalCount = addon_type === 'Domain Services' ? 1 : count
    const subtotal = rate * finalCount
    const gst = subtotal * 0.18
    const total = subtotal + gst

    const today = new Date()
    const formatDate = (date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`
    }

    const newPayment = {
      addon_type: addon_type,
      recipient_type: recipient_type,
      student_count: recipient_type === 'student' ? finalCount : null,
      teacher_count: recipient_type === 'teacher' ? finalCount : null,
      start_date_formatted: formatDate(today),
      end_date_formatted: formatDate(new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())),
      subtotal: subtotal,
      gst_amount: gst,
      amount: total,
      amount_formatted: `₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtotal_formatted: `₹ ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      gst_amount_formatted: `₹ ${gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      payment_date_formatted: formatDate(today),
      payment_id: 'pay_addon_' + Math.floor(Math.random() * 1000000),
      payment_status: 'paid'
    }

    if (typeof window !== 'undefined') {
      if (!window.__mockAddonHistory) window.__mockAddonHistory = []
      const existingIdx = window.__mockAddonHistory.findIndex(
        p => p.addon_type === addon_type && p.payment_status === 'pending'
      )
      if (existingIdx !== -1) {
        window.__mockAddonHistory[existingIdx] = {
          ...window.__mockAddonHistory[existingIdx],
          payment_status: 'paid',
          payment_date_formatted: formatDate(today),
          payment_id: newPayment.payment_id
        }
      } else {
        window.__mockAddonHistory.unshift(newPayment)
      }
    }

    return {
      success: true,
      message: 'Payment verified and service activated successfully.'
    }
  }

  // --- Client Addon Cart Mocks ---
  if (lowercaseUrl.includes('/client/addon/cart')) {
    if (typeof window !== 'undefined' && !window.__mockAddonCart) {
      window.__mockAddonCart = [];
    }

    // 1. GET /client/addon/cart
    if (method === 'GET' && lowercaseUrl.endsWith('/client/addon/cart')) {
      const items = window.__mockAddonCart || [];
      const subtotal = items.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);
      const gst = Math.round(subtotal * 18) / 100;
      const total = subtotal + gst;

      const fmt = (v) => `₹ ${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

      return {
        success: true,
        data: {
          items,
          total_subtotal_formatted: fmt(subtotal),
          total_gst_formatted: fmt(gst),
          total_amount_formatted: fmt(total),
          total_amount: total,
          item_count: items.length
        }
      };
    }

    // 2. POST /client/addon/cart/add
    if (method === 'POST' && lowercaseUrl.includes('/client/addon/cart/add')) {
      const { addon_type, recipient_type } = data || {};

      // Determine student count & rate
      let count = recipient_type === 'teacher' ? 45 : 850;
      if (addon_type === 'Hostel' || addon_type === 'hostel') count = 50;
      let rate = 36;
      if (addon_type === 'Hostel' || addon_type === 'hostel') rate = 60;
      else if (addon_type === 'Domain Services') rate = 7300;
      else if (addon_type === 'id card Type A') rate = 60;
      else if (addon_type === 'id card Type B') rate = 42;
      else if (addon_type === 'id card Type C') rate = 37;
      else if (addon_type === 'Previous Year Backup' || addon_type === 'previous_year') rate = 36;

      const finalCount = addon_type === 'Domain Services' ? 1 : count;
      const itemSubtotal = rate * finalCount;

      const today = new Date();
      const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

      const newCartItem = {
        id: 'cart_item_' + Math.floor(Math.random() * 1000000),
        addon_type,
        recipient_type,
        student_count: finalCount,
        start_date: today.toISOString(),
        end_date: nextYear.toISOString(),
        amount: itemSubtotal
      };

      if (typeof window !== 'undefined') {
        if (!window.__mockAddonCart) window.__mockAddonCart = [];
        // Prevent duplicate items of the exact same type and recipient
        const dupIdx = window.__mockAddonCart.findIndex(
          item => item.addon_type === addon_type && item.recipient_type === recipient_type
        );
        if (dupIdx !== -1) {
          return {
            success: false,
            message: `Service '${addon_type}' for ${recipient_type} is already in the cart!`
          };
        }
        window.__mockAddonCart.push(newCartItem);
      }

      return {
        success: true,
        message: 'Item added to cart successfully.'
      };
    }

    // 3. DELETE /client/addon/cart/remove/:id
    if (method === 'DELETE' && lowercaseUrl.includes('/client/addon/cart/remove/')) {
      const parts = lowercaseUrl.split('/remove/');
      const cartItemId = parts[parts.length - 1];

      if (typeof window !== 'undefined' && window.__mockAddonCart) {
        window.__mockAddonCart = window.__mockAddonCart.filter(item => item.id !== cartItemId && String(item.id) !== String(cartItemId));
      }

      return {
        success: true,
        message: 'Item removed from cart successfully.'
      };
    }

    // 4. POST /client/addon/cart/clear
    if (method === 'POST' && lowercaseUrl.includes('/client/addon/cart/clear')) {
      if (typeof window !== 'undefined') {
        window.__mockAddonCart = [];
      }
      return {
        success: true,
        message: 'Cart cleared successfully.'
      };
    }

    // 5. POST /client/addon/cart/create-order
    if (method === 'POST' && lowercaseUrl.includes('/client/addon/cart/create-order')) {
      const items = window.__mockAddonCart || [];
      const subtotal = items.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);
      const gst = subtotal * 0.18;
      const total = subtotal + gst;

      return {
        success: true,
        simulated: true,
        order_id: 'order_cart_' + Math.floor(Math.random() * 1000000),
        amount: Math.round(total),
        item_count: items.length,
        currency: 'INR',
        key: 'rzp_test_mockkey123'
      };
    }

    // 6. POST /client/addon/cart/verify-payment
    if (method === 'POST' && lowercaseUrl.includes('/client/addon/cart/verify-payment')) {
      const items = window.__mockAddonCart || [];
      const today = new Date();
      const formatDate = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
      };

      if (typeof window !== 'undefined') {
        if (!window.__mockAddonHistory) window.__mockAddonHistory = [];

        items.forEach(item => {
          const subtotal = parseFloat(item.amount);
          const gst = subtotal * 0.18;
          const total = subtotal + gst;

          const newPayment = {
            addon_type: item.addon_type,
            recipient_type: item.recipient_type,
            student_count: item.student_count,
            teacher_count: item.recipient_type === 'teacher' ? item.student_count : null,
            start_date_formatted: formatDate(today),
            end_date_formatted: formatDate(new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())),
            subtotal: subtotal,
            gst_amount: gst,
            amount: total,
            amount_formatted: `₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            subtotal_formatted: `₹ ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            gst_amount_formatted: `₹ ${gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            payment_date_formatted: formatDate(today),
            payment_id: 'pay_addon_' + Math.floor(Math.random() * 1000000),
            payment_status: 'paid'
          };
          window.__mockAddonHistory.unshift(newPayment);
        });

        // Clear cart
        window.__mockAddonCart = [];
      }

      return {
        success: true,
        message: 'Cart payment verified and services activated successfully.'
      };
    }
  }

  // --- Client Unified Checkout Mocks ---
  if (lowercaseUrl.includes('/client/unified/create-order') && method === 'POST') {
    const { cycle } = data || {}
    const items = window.__mockAddonCart || []

    // 1. Subscription calc
    let subAmount = 3000
    if (cycle === 'annual') subAmount = 30000
    else if (cycle === 'half_yearly' || cycle === 'half-yearly') subAmount = 15000
    else if (cycle === 'quarterly') subAmount = 7500
    else if (cycle === 'monthly') subAmount = 2500

    // 2. Customizations calc
    const pendingCusts = (window.__mockCustomizationRequests || []).filter(r => r.status === 'amount_set')
    const custBaseTotal = pendingCusts.reduce((acc, req) => acc + parseFloat(req.amount || 0), 0)
    const custTotal = Math.round(custBaseTotal * 1.18)

    // 3. Addon cart calc
    const addonBaseTotal = items.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0)
    const addonTotal = Math.round(addonBaseTotal * 1.18)

    const totalAmount = subAmount + custTotal + addonTotal

    return {
      success: true,
      simulated: true,
      order_id: 'order_unified_' + Math.floor(Math.random() * 1000000),
      amount: totalAmount,
      currency: 'INR',
      key: 'rzp_test_mockkey123',
      client_name: 'Greenfield School',
      client_email: 'info@greenfield.edu.in',
      subscription: {
        cycle: cycle || 'annual',
        amount: subAmount
      },
      customization: {
        request_ids: pendingCusts.map(r => r.id),
        amount: custTotal
      },
      addon: {
        items_count: items.length,
        amount: addonTotal
      }
    }
  }

  if (lowercaseUrl.includes('/client/unified/verify-payment') && method === 'POST') {
    const { subscription, customization, addon } = data || {}

    // A. Verify Subscription
    if (typeof window !== 'undefined') {
      window.__mockSubscriptionPaid = true
    }

    // B. Verify Customizations
    if (customization && customization.request_ids) {
      customization.request_ids.forEach(reqId => {
        if (window.__mockCustomizationRequests) {
          const reqIdx = window.__mockCustomizationRequests.findIndex(r => r.id === Number(reqId))
          if (reqIdx !== -1) {
            const req = window.__mockCustomizationRequests[reqIdx]
            window.__mockCustomizationRequests[reqIdx] = {
              ...req,
              status: 'success'
            }
            if (!window.__mockCustomizationPayments) window.__mockCustomizationPayments = []
            window.__mockCustomizationPayments.push({
              id: Math.max(...(window.__mockCustomizationPayments || []).map(p => p.id), 200) + 1,
              razorpay_payment_id: 'pay_mock_' + Date.now(),
              customization_text: req.customization_text,
              amount: req.amount || 0,
              status: 'success',
              created_at: new Date().toISOString()
            })
          }
        }
      })
    }

    // C. Verify Addon Cart
    const items = window.__mockAddonCart || []
    const today = new Date()
    const formatDate = (date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`
    }

    if (typeof window !== 'undefined') {
      if (!window.__mockAddonHistory) window.__mockAddonHistory = []
      items.forEach(item => {
        const subtotal = parseFloat(item.amount)
        const gst = subtotal * 0.18
        const total = subtotal + gst
        const newPayment = {
          addon_type: item.addon_type,
          recipient_type: item.recipient_type,
          student_count: item.student_count,
          teacher_count: item.recipient_type === 'teacher' ? item.student_count : null,
          start_date_formatted: formatDate(today),
          end_date_formatted: formatDate(new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())),
          subtotal: subtotal,
          gst_amount: gst,
          amount: total,
          amount_formatted: `₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          subtotal_formatted: `₹ ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          gst_amount_formatted: `₹ ${gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          payment_date_formatted: formatDate(today),
          payment_id: 'pay_addon_' + Math.floor(Math.random() * 1000000),
          payment_status: 'paid'
        }
        window.__mockAddonHistory.unshift(newPayment)
      })
      window.__mockAddonCart = []
    }

    return {
      success: true,
      message: 'Unified payment verified and all services successfully updated!'
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

  // 2.6 Employee Demo Slots Mocks
  if (lowercaseUrl.includes('/employee/demo-slots')) {
    const slotsList = window.__mockDemoSlots || []

    // GET /employee/demo-slots/stats
    if (lowercaseUrl.includes('/employee/demo-slots/stats')) {
      const total = slotsList.length
      const active = slotsList.filter(s => s.is_active).length
      const partner = slotsList.filter(s => s.demo_type === 'partner').length
      const client = slotsList.filter(s => s.demo_type === 'client').length
      return {
        success: true,
        data: {
          total_slots: total,
          active_slots: active,
          partner_slots: partner,
          client_slots: client
        }
      }
    }

    // POST /employee/demo-slots/{id}/toggle-status
    const toggleStatusMatch = lowercaseUrl.match(/\/employee\/demo-slots\/(\d+)\/toggle-status$/)
    if (toggleStatusMatch && method === 'POST') {
      const slotId = parseInt(toggleStatusMatch[1])
      let message = ''
      window.__mockDemoSlots = slotsList.map(s => {
        if (s.id === slotId) {
          const newStatus = !s.is_active
          message = `Demo slot successfully ${newStatus ? 'activated' : 'deactivated'}`
          return {
            ...s,
            is_active: newStatus,
            updated_at: new Date().toISOString()
          }
        }
        return s
      })
      return {
        success: true,
        message
      }
    }

    // DELETE /employee/demo-slots/{id}
    const deleteSlotMatch = lowercaseUrl.match(/\/employee\/demo-slots\/(\d+)$/)
    if (deleteSlotMatch && method === 'DELETE') {
      const slotId = parseInt(deleteSlotMatch[1])
      window.__mockDemoSlots = slotsList.filter(s => s.id !== slotId)
      return {
        success: true,
        message: 'Demo slot deleted successfully'
      }
    }

    // PUT /employee/demo-slots/{id}
    const updateSlotMatch = lowercaseUrl.match(/\/employee\/demo-slots\/(\d+)$/)
    if (updateSlotMatch && method === 'PUT') {
      const slotId = parseInt(updateSlotMatch[1])
      let updated = null
      window.__mockDemoSlots = slotsList.map(s => {
        if (s.id === slotId) {
          updated = {
            ...s,
            demo_type: data.demo_type || s.demo_type,
            title: data.title || s.title,
            timing_from: data.timing_from || s.timing_from,
            timing_to: data.timing_to || s.timing_to,
            meeting_link: data.meeting_link || s.meeting_link,
            max_attendees: Number(data.max_attendees) || s.max_attendees,
            all_days: data.all_days !== undefined ? data.all_days : s.all_days,
            monday: data.monday !== undefined ? data.monday : s.monday,
            tuesday: data.tuesday !== undefined ? data.tuesday : s.tuesday,
            wednesday: data.wednesday !== undefined ? data.wednesday : s.wednesday,
            thursday: data.thursday !== undefined ? data.thursday : s.thursday,
            friday: data.friday !== undefined ? data.friday : s.friday,
            saturday: data.saturday !== undefined ? data.saturday : s.saturday,
            sunday: data.sunday !== undefined ? data.sunday : s.sunday,
            updated_at: new Date().toISOString()
          }
          return updated
        }
        return s
      })
      return {
        success: true,
        message: 'Demo slot updated successfully',
        data: updated
      }
    }

    // POST /employee/demo-slots
    if (method === 'POST') {
      const newId = slotsList.length > 0 ? Math.max(...slotsList.map(s => s.id)) + 1 : 1
      const newSlot = {
        id: newId,
        employee_id: getLoggedInMockEmployee().id,
        demo_type: data.demo_type || 'client',
        title: data.title || 'Untitled Demo Slot',
        timing_from: data.timing_from || '09:00',
        timing_to: data.timing_to || '17:00',
        meeting_link: data.meeting_link || '',
        max_attendees: Number(data.max_attendees) || 10,
        all_days: data.all_days !== undefined ? data.all_days : false,
        monday: data.monday !== undefined ? data.monday : false,
        tuesday: data.tuesday !== undefined ? data.tuesday : false,
        wednesday: data.wednesday !== undefined ? data.wednesday : false,
        thursday: data.thursday !== undefined ? data.thursday : false,
        friday: data.friday !== undefined ? data.friday : false,
        saturday: data.saturday !== undefined ? data.saturday : false,
        sunday: data.sunday !== undefined ? data.sunday : false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      slotsList.unshift(newSlot)
      window.__mockDemoSlots = slotsList
      return {
        success: true,
        message: 'Demo slot created successfully',
        data: newSlot
      }
    }

    // GET /employee/demo-slots (List with filters)
    try {
      const urlObj = new URL(url, 'https://dummy.com')
      const searchParams = urlObj.searchParams
      const filterDemoType = searchParams.get('demo_type')
      const filterIsActive = searchParams.get('is_active')
      const filterSearch = searchParams.get('search')?.toLowerCase()

      let filtered = [...slotsList]
      if (filterDemoType) {
        filtered = filtered.filter(s => s.demo_type === filterDemoType)
      }
      if (filterIsActive) {
        const activeBool = filterIsActive === 'true'
        filtered = filtered.filter(s => s.is_active === activeBool)
      }
      if (filterSearch) {
        filtered = filtered.filter(s =>
          s.title?.toLowerCase().includes(filterSearch) ||
          s.meeting_link?.toLowerCase().includes(filterSearch)
        )
      }

      return {
        success: true,
        data: {
          current_page: 1,
          data: filtered,
          total: filtered.length,
          per_page: 20
        }
      }
    } catch (e) {
      console.error('Error filtering demo slots mock:', e)
      return {
        success: true,
        data: {
          current_page: 1,
          data: slotsList,
          total: slotsList.length,
          per_page: 20
        }
      }
    }
  }

  // 2.7 Categories, Subcategories, and Products Dropdown Mocks
  if (lowercaseUrl.includes('/employee/categories')) {
    return {
      success: true,
      data: [
        { id: 1, name: 'SaaS Software' },
        { id: 2, name: 'Digital Marketing' },
        { id: 3, name: 'Web Development' }
      ]
    }
  }

  if (lowercaseUrl.includes('/employee/subcategories')) {
    try {
      const urlObj = new URL(url, 'https://dummy.com')
      const catId = urlObj.searchParams.get('category_id')
      const allSubs = [
        { id: 11, category_id: 1, name: 'School Management ERP' },
        { id: 12, category_id: 1, name: 'LMS Portal' },
        { id: 21, category_id: 2, name: 'Social Media Management' },
        { id: 22, category_id: 2, name: 'SEO & PPC Optimization' },
        { id: 31, category_id: 3, name: 'Custom ERP Solutions' },
        { id: 32, category_id: 3, name: 'E-commerce Platforms' }
      ]
      const filtered = catId ? allSubs.filter(s => s.category_id === Number(catId)) : allSubs
      return {
        success: true,
        data: filtered
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (lowercaseUrl.includes('/employee/products-dropdown')) {
    try {
      const urlObj = new URL(url, 'https://dummy.com')
      const subCatId = urlObj.searchParams.get('sub_category_id')
      const catId = urlObj.searchParams.get('category_id')
      const allProducts = [
        { id: 101, sub_category_id: 11, category_id: 1, name: 'Institute Pro', processing_fee: 10000, monthly_subscription: 2500 },
        { id: 102, sub_category_id: 11, category_id: 1, name: 'Institute Basic', processing_fee: 5000, monthly_subscription: 1500 },
        { id: 103, sub_category_id: 12, category_id: 1, name: 'Nexgn LMS Basic', processing_fee: 6000, monthly_subscription: 2000 },
        { id: 104, sub_category_id: 12, category_id: 1, name: 'Nexgn LMS Enterprise', processing_fee: 15000, monthly_subscription: 4000 },
        { id: 201, sub_category_id: 21, category_id: 2, name: 'SMM Starter Pack', processing_fee: 2500, monthly_subscription: 5000 },
        { id: 202, sub_category_id: 22, category_id: 2, name: 'SEO Growth Booster', processing_fee: 4000, monthly_subscription: 8000 },
        { id: 301, sub_category_id: 31, category_id: 3, name: 'Enterprise CRM Customized', processing_fee: 25000, monthly_subscription: 12000 },
        { id: 302, sub_category_id: 32, category_id: 3, name: 'Nexgn Shop Custom', processing_fee: 18000, monthly_subscription: 6000 }
      ]
      let filtered = [...allProducts]
      if (subCatId) filtered = filtered.filter(p => p.sub_category_id === Number(subCatId))
      if (catId) filtered = filtered.filter(p => p.category_id === Number(catId))
      return {
        success: true,
        data: filtered
      }
    } catch (e) {
      console.error(e)
    }
  }

  // 2.8 Demo Slot Available & Booking Mocks
  if (lowercaseUrl.includes('/employee/demo-slots-available')) {
    const slotsList = window.__mockDemoSlots || []
    return {
      success: true,
      data: slotsList.filter(s => s.is_active)
    }
  }

  const availDatesMatch = lowercaseUrl.match(/\/employee\/demo-slots\/(\d+)\/available-dates/)
  if (availDatesMatch) {
    const slotId = parseInt(availDatesMatch[1])
    try {
      const urlObj = new URL(url, 'https://dummy.com')
      const startDateStr = urlObj.searchParams.get('start_date') || new Date().toISOString().split('T')[0]
      const endDateStr = urlObj.searchParams.get('end_date') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const slot = (window.__mockDemoSlots || []).find(s => s.id === slotId)
      const dates = []
      if (slot) {
        const start = new Date(startDateStr)
        const end = new Date(endDateStr)

        const dayMap = {
          0: 'sunday',
          1: 'monday',
          2: 'tuesday',
          3: 'wednesday',
          4: 'thursday',
          5: 'friday',
          6: 'saturday'
        }

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay()
          const dayKey = dayMap[dayOfWeek]
          if (slot.all_days || slot[dayKey]) {
            const dateString = d.toISOString().split('T')[0]
            const bookedCount = (window.__mockLeads || []).filter(l => l.demo_slot && l.demo_slot.startsWith(dateString)).length
            dates.push({
              date: dateString,
              available_attendees: Math.max(0, slot.max_attendees - bookedCount),
              total_attendees: slot.max_attendees,
              is_fully_booked: bookedCount >= slot.max_attendees
            })
          }
        }
      }
      return {
        success: true,
        data: {
          available_dates: dates
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const bookSlotMatch = lowercaseUrl.match(/\/employee\/leads\/(\d+)\/book-demo-slot/)
  if (bookSlotMatch && method === 'POST') {
    const leadId = parseInt(bookSlotMatch[1])
    const { demo_slot_id, booking_date, notes } = data || {}
    const slot = (window.__mockDemoSlots || []).find(s => s.id === Number(demo_slot_id))

    let updated = null
    window.__mockLeads = (window.__mockLeads || []).map(l => {
      if (l.id === leadId) {
        updated = {
          ...l,
          demo_status: 'assigned',
          demo_slot: `${booking_date} ${slot ? slot.timing_from : '10:00'}:00`,
          demo_link: slot ? slot.meeting_link : 'https://meet.google.com/mock-demo',
          booking_id: Math.floor(Math.random() * 100000),
          demo_slot_id: Number(demo_slot_id),
          demo_notes: notes || '',
          updated_at: new Date().toISOString()
        }
        if (!updated.activities) updated.activities = []
        updated.activities.unshift({
          id: Math.floor(Math.random() * 100000),
          lead_id: l.id,
          employee_id: getLoggedInMockEmployee().id,
          activity_type: 'meeting',
          description: `Demo scheduled: ${slot ? slot.title : 'Discovery Session'}`,
          notes: notes || 'Demo booked via employee portal calendar.',
          scheduled_date: `${booking_date}T${slot ? slot.timing_from : '10:00'}:00.000Z`,
          completed_at: null,
          created_at: new Date().toISOString(),
          employee: getLoggedInMockEmployee()
        })
        return updated
      }
      return l
    })

    if (updated) {
      return {
        success: true,
        message: 'Demo slot booked successfully',
        data: updated
      }
    } else {
      return { success: false, message: 'Lead not found' }
    }
  }

  const slotBookingsMatch = lowercaseUrl.match(/\/employee\/demo-slots\/(\d+)\/bookings/)
  if (slotBookingsMatch && method === 'GET') {
    const slotId = parseInt(slotBookingsMatch[1])
    const urlObj = new URL(url, 'https://dummy.com')
    const queryDate = urlObj.searchParams.get('date')
    const bookings = (window.__mockLeads || [])
      .filter(l => {
        if (!l.booking_id) return false
        if (Number(l.demo_slot_id) !== slotId) return false
        if (l.demo_status !== 'assigned') return false
        if (!l.demo_slot) return false
        const bookingDate = l.demo_slot.split(' ')[0]
        return bookingDate === queryDate
      })
      .map(l => ({
        id: l.booking_id,
        demo_slot_id: slotId,
        booking_date: l.demo_slot.split(' ')[0],
        status: 'scheduled',
        notes: l.demo_notes || 'Demo booked via employee portal calendar.',
        lead: {
          client_name: l.client_name,
          client_email: l.client_email || l.email,
          client_phone: l.client_phone
        }
      }))
    return {
      success: true,
      data: {
        bookings
      }
    }
  }

  const followUpMatch = lowercaseUrl.match(/\/employee\/leads\/(\d+)\/follow-up/)
  if (followUpMatch && method === 'POST') {
    const leadId = parseInt(followUpMatch[1])
    const { next_date, status, remark, lost_reason } = data || {}
    let updated = null
    window.__mockLeads = (window.__mockLeads || []).map(l => {
      if (l.id === leadId) {
        updated = {
          ...l,
          lead_status: status,
          follow_up_date: next_date,
          expected_close_date: next_date,
          lost_reason: status === 'lost' ? lost_reason : l.lost_reason,
          updated_at: new Date().toISOString()
        }
        if (!updated.activities) updated.activities = []
        updated.activities.unshift({
          id: Math.floor(Math.random() * 100000),
          lead_id: l.id,
          employee_id: getLoggedInMockEmployee().id,
          activity_type: 'follow_up',
          description: `Follow-up status: ${status}`,
          notes: remark || 'No remark provided.',
          scheduled_date: next_date,
          completed_at: null,
          created_at: new Date().toISOString(),
          employee: getLoggedInMockEmployee()
        })
        return updated
      }
      return l
    })
    if (updated) {
      return {
        success: true,
        message: 'Follow-up scheduled successfully',
        data: updated
      }
    } else {
      return { success: false, message: 'Lead not found' }
    }
  }

  const demoSlotsAvailableMatch = lowercaseUrl.match(/\/employee\/demo-slots-available/)
  if (demoSlotsAvailableMatch && method === 'GET') {
    return {
      success: true,
      data: window.__mockDemoSlots || []
    }
  }

  const availableDatesMatch = lowercaseUrl.match(/\/employee\/demo-slots\/(\d+)\/available-dates/)
  if (availableDatesMatch && method === 'GET') {
    const slotId = parseInt(availableDatesMatch[1])
    const slot = (window.__mockDemoSlots || []).find(s => s.id === slotId)
    const dates = []
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

    for (let i = 0; i < 60; i++) {
      const d = new Date(currentYear, currentMonth, today.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const dayOfWeek = d.getDay()
      const dayKey = daysMap[dayOfWeek]

      const isActiveOnDay = slot ? (slot.all_days || slot[dayKey] === true) : false
      if (isActiveOnDay && slot.is_active) {
        const bookingsCount = (window.__mockLeads || []).filter(l => {
          if (!l.booking_id || Number(l.demo_slot_id) !== slotId) return false
          const bDate = l.demo_slot ? l.demo_slot.split(' ')[0] : ''
          return bDate === dateStr && l.demo_status === 'assigned'
        }).length

        const maxAttendees = slot.max_attendees || 10
        dates.push({
          date: dateStr,
          available_attendees: maxAttendees - bookingsCount,
          total_attendees: maxAttendees,
          is_fully_booked: bookingsCount >= maxAttendees
        })
      }
    }
    return {
      success: true,
      data: {
        available_dates: dates
      }
    }
  }

  const cancelBookingMatch = lowercaseUrl.match(/\/employee\/bookings\/(\d+)\/cancel/)
  if (cancelBookingMatch && method === 'POST') {

    const bookingId = parseInt(cancelBookingMatch[1])
    let updated = null
    window.__mockLeads = (window.__mockLeads || []).map(l => {
      if (l.booking_id === bookingId) {
        updated = {
          ...l,
          demo_status: null,
          demo_slot: null,
          demo_link: null,
          booking_id: null,
          updated_at: new Date().toISOString()
        }
        if (!updated.activities) updated.activities = []
        updated.activities.unshift({
          id: Math.floor(Math.random() * 100000),
          lead_id: l.id,
          employee_id: getLoggedInMockEmployee().id,
          activity_type: 'note',
          description: 'Demo Booking Cancelled',
          notes: 'Demo booking cancelled by employee.',
          scheduled_date: null,
          completed_at: null,
          created_at: new Date().toISOString(),
          employee: getLoggedInMockEmployee()
        })
        return updated
      }
      return l
    })

    if (updated) {
      return {
        success: true,
        message: 'Demo slot booking cancelled successfully',
        data: updated
      }
    } else {
      return { success: false, message: 'Booking not found' }
    }
  }
  // ═══════════════════════════════════════════════════════════════════════════
  // 5. Partner Step-Tracking Registration Mocks
  // ═══════════════════════════════════════════════════════════════════════════

  // POST /partner-step/register
  if (lowercaseUrl.includes('/partner-step/register') && method === 'POST') {
    const partnerId = `PIDIN${Math.floor(10000 + Math.random() * 89999)}`
    return {
      success: true,
      message: 'Partner registered successfully. Step 1 complete.',
      data: {
        partner_id: partnerId,
        partner_name: data?.partner_name || 'Simulated Partner',
        organization_name: data?.organization_name || 'Simulated Organization',
        email: data?.email || 'partner@example.com',
        registration_status: 'pending',
        current_step: 2,
      }
    }
  }

  // GET /partner-step/status/{partnerId}
  if (lowercaseUrl.includes('/partner-step/status/')) {
    const idMatch = lowercaseUrl.match(/\/partner-step\/status\/([^/?]+)/)
    const partnerId = idMatch ? idMatch[1].toUpperCase() : 'PIDIN00000'
    return {
      success: true,
      data: {
        partner_id: partnerId,
        partner_name: 'Mock Partner',
        organization_name: 'Mock Org',
        email: 'mock@partner.com',
        registration_status: 'pending',
        current_step: 2,
        step_1_completed: true,
        step_2_completed: false,
        step_3_completed: false,
        signed_agreement_path: null,
      }
    }
  }

  // GET /partner-step/step2/{partnerId}
  if (lowercaseUrl.includes('/partner-step/step2/') && !lowercaseUrl.includes('/download') && !lowercaseUrl.includes('/preview')) {
    const idMatch = lowercaseUrl.match(/\/partner-step\/step2\/([^/?]+)/)
    const partnerId = idMatch ? idMatch[1].toUpperCase() : 'PIDIN00000'
    return {
      success: true,
      data: {
        partner: {
          partner_id: partnerId,
          partner_name: 'Mock Partner',
          organization_name: 'Mock Org',
          email: 'mock@partner.com',
        },
        agreement_html: '',
        step_2_completed: false,
      }
    }
  }

  // POST /partner-step/step2/download
  if (lowercaseUrl.includes('/partner-step/step2/download') && method === 'POST') {
    return {
      success: true,
      message: 'Agreement downloaded and emailed (simulated).',
      data: {
        step_2_completed: true,
      }
    }
  }

  // POST /partner-step/step3/upload-agreement
  if (lowercaseUrl.includes('/partner-step/step3/upload-agreement') && method === 'POST') {
    return {
      success: true,
      message: 'Signed agreement uploaded successfully (simulated).',
      data: {
        signed_agreement_path: '/storage/agreements/mock_signed.pdf',
      }
    }
  }

  // POST /partner-step/step3/complete-payment
  if (lowercaseUrl.includes('/partner-step/step3/complete-payment') && method === 'POST') {
    return {
      success: true,
      message: 'Payment verified. All steps completed (simulated).',
      data: {
        step_3_completed: true,
        current_step: 4,
        token: `sim_token_${Math.random().toString(36).substring(2)}${Date.now()}`,
        partner: {
          id: data?.partner_id || 'PIDIN00000',
          name: 'Mock Partner',
          email: 'mock@partner.com',
          organization: 'Mock Org',
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. Admin Panel Mocks (SaaS Clients, Subscriptions, Payments & Reports)
  // ═══════════════════════════════════════════════════════════════════════════

  // Setup mock clients database if not present on window
  if (typeof window !== 'undefined' && !window.__mockClients) {
    window.__mockClients = [
      {
        id: 1,
        client_id: "AIM2733488",
        client_name: "Greenfield School",
        company_name: "Greenfield School",
        school_name: "Greenfield School",
        email: "info@greenfield.edu.in",
        phone: "+91 98765 11111",
        product_name: "NexGen ERP (SaaS)",
        product_category: "nexgn",
        partner_name: "Master Partner Kumar",
        processing_fee: "30000",
        monthly_subscription: "2500",
        per_person: 1,
        delivery_after: 5,
        is_active: true,
        activated_at: "2026-03-01T10:00:00Z",
        created_at: "2026-03-01T10:00:00Z",
        valid_until: "2027-03-01T10:00:00Z",
        period_end: "2027-03-01T10:00:00Z",
        age: "205 days left",
        age_days_left: 205,
        default_next_cycle: "annual",
        default_next_amount: 28320.00,
        subscription_cycle_amounts: {
          monthly: {
            cycle: "monthly",
            cycle_months: 1,
            discount_percentage: 0,
            base_total: 2500.00,
            discounted_total: 2500.00,
            gst_amount: 450.00,
            total_amount: 2950.00,
            formatted_total: "₹ 2,950.00"
          },
          quarterly: {
            cycle: "quarterly",
            cycle_months: 3,
            discount_percentage: 10,
            base_total: 7500.00,
            discounted_total: 6750.00,
            gst_amount: 1215.00,
            total_amount: 7965.00,
            formatted_total: "₹ 7,965.00"
          },
          half_yearly: {
            cycle: "half_yearly",
            cycle_months: 6,
            discount_percentage: 15,
            base_total: 15000.00,
            discounted_total: 12750.00,
            gst_amount: 2295.00,
            total_amount: 15045.00,
            formatted_total: "₹ 15,045.00"
          },
          annual: {
            cycle: "annual",
            cycle_months: 12,
            discount_percentage: 20,
            base_total: 30000.00,
            discounted_total: 24000.00,
            gst_amount: 4320.00,
            total_amount: 28320.00,
            formatted_total: "₹ 28,320.00"
          }
        },
        student_count: 850,
        unpaid_months: [],
        total_due_amount: 0,
        payments: [
          { id: 101, razorpay_payment_id: "pay_GF1001", cycle: "annual", period_start: "2026-03-01", period_end: "2027-03-01", amount: 30000, status: "success", created_at: "2026-03-01T11:00:00Z" }
        ],
        customizations: [
          { id: 201, customization_text: "[Online Admission Portal] Add customizable admission forms and fees collector", amount: 15000, status: "approved", admin_notes: "Approved and deployed", submitted_at: "2026-04-01T09:00:00Z" }
        ]
      },
      {
        id: 2,
        client_id: "AIM2688941",
        client_name: "Blue Hill Institute",
        company_name: "Blue Hill Institute",
        school_name: "Blue Hill Institute",
        email: "contact@bluehill.edu.in",
        phone: "+91 98765 22222",
        product_name: "NexGen ERP (SaaS)",
        product_category: "nexgn",
        partner_name: "Premium Partner Sharma",
        processing_fee: "15000",
        monthly_subscription: "1250",
        per_person: 1,
        delivery_after: 10,
        is_active: true,
        activated_at: "2026-01-15T10:00:00Z",
        created_at: "2026-01-15T10:00:00Z",
        valid_until: "2026-08-15T10:00:00Z",
        period_end: "2026-08-15T10:00:00Z",
        age: "7 days left",
        age_days_left: 7,
        default_next_cycle: "quarterly",
        default_next_amount: 3982.50,
        subscription_cycle_amounts: {
          monthly: {
            cycle: "monthly",
            cycle_months: 1,
            discount_percentage: 0,
            base_total: 1250.00,
            discounted_total: 1250.00,
            gst_amount: 225.00,
            total_amount: 1475.00,
            formatted_total: "₹ 1,475.00"
          },
          quarterly: {
            cycle: "quarterly",
            cycle_months: 3,
            discount_percentage: 10,
            base_total: 3750.00,
            discounted_total: 3375.00,
            gst_amount: 607.50,
            total_amount: 3982.50,
            formatted_total: "₹ 3,982.50"
          },
          half_yearly: {
            cycle: "half_yearly",
            cycle_months: 6,
            discount_percentage: 15,
            base_total: 7500.00,
            discounted_total: 6375.00,
            gst_amount: 1147.50,
            total_amount: 7522.50,
            formatted_total: "₹ 7,522.50"
          },
          annual: {
            cycle: "annual",
            cycle_months: 12,
            discount_percentage: 20,
            base_total: 15000.00,
            discounted_total: 12000.00,
            gst_amount: 2160.00,
            total_amount: 14160.00,
            formatted_total: "₹ 14,160.00"
          }
        },
        student_count: 1200,
        unpaid_months: ["May 2026", "June 2026"],
        total_due_amount: 2500,
        payments: [
          { id: 102, razorpay_payment_id: "pay_BH1002", cycle: "quarterly", period_start: "2026-01-15", period_end: "2026-04-15", amount: 3750, status: "success", created_at: "2026-01-15T11:30:00Z" }
        ],
        customizations: []
      },
      {
        id: 3,
        client_id: "AIM2699312",
        client_name: "Sunrise Academy",
        company_name: "Sunrise Academy",
        school_name: "Sunrise Academy",
        email: "admin@sunrise.edu.in",
        phone: "+91 98765 33333",
        product_name: "NexGen ERP (SaaS)",
        product_category: "nexgn",
        partner_name: "Master Partner Kumar",
        processing_fee: "45000",
        monthly_subscription: "3500",
        per_person: 1,
        delivery_after: 0,
        is_active: false,
        activated_at: "2026-04-10T10:00:00Z",
        created_at: "2026-04-10T10:00:00Z",
        valid_until: "2026-08-03T10:00:00Z",
        period_end: "2026-08-03T10:00:00Z",
        age: "Overdue by 5 days",
        age_days_left: -5,
        default_next_cycle: "monthly",
        default_next_amount: 4130.00,
        subscription_cycle_amounts: {
          monthly: {
            cycle: "monthly",
            cycle_months: 1,
            discount_percentage: 0,
            base_total: 3500.00,
            discounted_total: 3500.00,
            gst_amount: 630.00,
            total_amount: 4130.00,
            formatted_total: "₹ 4,130.00"
          },
          quarterly: {
            cycle: "quarterly",
            cycle_months: 3,
            discount_percentage: 10,
            base_total: 10500.00,
            discounted_total: 9450.00,
            gst_amount: 1701.00,
            total_amount: 11151.00,
            formatted_total: "₹ 11,151.00"
          },
          half_yearly: {
            cycle: "half_yearly",
            cycle_months: 6,
            discount_percentage: 15,
            base_total: 21000.00,
            discounted_total: 17850.00,
            gst_amount: 3213.00,
            total_amount: 21063.00,
            formatted_total: "₹ 21,063.00"
          },
          annual: {
            cycle: "annual",
            cycle_months: 12,
            discount_percentage: 20,
            base_total: 42000.00,
            discounted_total: 33600.00,
            gst_amount: 6048.00,
            total_amount: 39648.00,
            formatted_total: "₹ 39,648.00"
          }
        },
        student_count: 0,
        unpaid_months: ["April 2026"],
        total_due_amount: 3500,
        payments: [],
        customizations: [
          { id: 202, customization_text: "[Hostel Management System] Track room allotment and dining billing", amount: null, status: "pending", admin_notes: "", submitted_at: "2026-05-01T12:00:00Z" }
        ]
      },
      {
        id: 4,
        client_id: "AIM2600101",
        client_name: "Tech Solutions Pvt Ltd",
        company_name: "Tech Solutions Pvt Ltd",
        school_name: "Tech Solutions Pvt Ltd",
        email: "ceo@techsolutions.com",
        phone: "+91 98765 44444",
        product_name: "Static Corporate Website",
        product_category: "static",
        partner_name: "Direct Sales",
        processing_fee: "5000",
        monthly_subscription: "0",
        per_person: 0,
        delivery_after: 7,
        is_active: true,
        activated_at: "2026-02-20T10:00:00Z",
        created_at: "2026-02-20T10:00:00Z",
        valid_until: "2027-02-20T10:00:00Z",
        period_end: "2027-02-20T10:00:00Z",
        age: "196 days left",
        age_days_left: 196,
        default_next_cycle: "annual",
        default_next_amount: 0,
        student_count: 0,
        unpaid_months: [],
        total_due_amount: 0,
        payments: [
          { id: 103, razorpay_payment_id: "pay_TS1003", cycle: "annual", period_start: "2026-02-20", period_end: "2027-02-20", amount: 5000, status: "success", created_at: "2026-02-20T14:00:00Z" }
        ],
        customizations: []
      },
      {
        id: 5,
        client_id: "AIM2600102",
        client_name: "Education First Academy",
        company_name: "Education First Academy",
        school_name: "Education First Academy",
        email: "contact@edufirst.org",
        phone: "+91 98765 55555",
        product_name: "Dynamic Portal & LMS",
        product_category: "dynamic",
        partner_name: "Premium Partner Sharma",
        processing_fee: "15000",
        monthly_subscription: "1000",
        per_person: 0,
        delivery_after: 15,
        is_active: true,
        activated_at: "2026-05-01T10:00:00Z",
        created_at: "2026-05-01T10:00:00Z",
        valid_until: "2026-08-08T10:00:00Z",
        period_end: "2026-08-08T10:00:00Z",
        age: "Due today",
        age_days_left: 0,
        default_next_cycle: "quarterly",
        default_next_amount: 3186.00,
        subscription_cycle_amounts: {
          monthly: {
            cycle: "monthly",
            cycle_months: 1,
            discount_percentage: 0,
            base_total: 1000.00,
            discounted_total: 1000.00,
            gst_amount: 180.00,
            total_amount: 1180.00,
            formatted_total: "₹ 1,180.00"
          },
          quarterly: {
            cycle: "quarterly",
            cycle_months: 3,
            discount_percentage: 10,
            base_total: 3000.00,
            discounted_total: 2700.00,
            gst_amount: 486.00,
            total_amount: 3186.00,
            formatted_total: "₹ 3,186.00"
          },
          half_yearly: {
            cycle: "half_yearly",
            cycle_months: 6,
            discount_percentage: 15,
            base_total: 6000.00,
            discounted_total: 5100.00,
            gst_amount: 918.00,
            total_amount: 6018.00,
            formatted_total: "₹ 6,018.00"
          },
          annual: {
            cycle: "annual",
            cycle_months: 12,
            discount_percentage: 20,
            base_total: 12000.00,
            discounted_total: 9600.00,
            gst_amount: 1728.00,
            total_amount: 11328.00,
            formatted_total: "₹ 11,328.00"
          }
        },
        student_count: 0,
        unpaid_months: ["July 2026"],
        total_due_amount: 1000,
        payments: [
          { id: 104, razorpay_payment_id: "pay_EF1004", cycle: "quarterly", period_start: "2026-05-01", period_end: "2026-08-01", amount: 15000, status: "success", created_at: "2026-05-01T16:45:00Z" }
        ],
        customizations: [
          { id: 203, customization_text: "[Video Conferencing Tool] Zoom API integration for class schedules", amount: 8000, status: "amount_set", admin_notes: "Quote set to ₹8,000 for server credentials.", submitted_at: "2026-06-10T14:30:00Z" }
        ]
      }
    ];
  }

  // GET /admin/clients
  if (lowercaseUrl.includes('/admin/clients') && method === 'GET') {
    // If it's looking for a specific client e.g. /admin/clients/1
    const detailMatch = lowercaseUrl.match(/\/admin\/clients\/(\d+)/);
    if (detailMatch) {
      const clientId = parseInt(detailMatch[1], 10);
      const client = window.__mockClients.find(c => c.id === clientId);
      if (client) {
        return {
          success: true,
          data: client
        };
      }
      return { success: false, message: 'Client not found' };
    }

    return {
      success: true,
      data: {
        all_clients: window.__mockClients
      }
    };
  }

  // GET /admin/subscriptions
  if (lowercaseUrl.includes('/admin/subscriptions') && method === 'GET') {
    const list = [];
    window.__mockClients.forEach(c => {
      c.payments.forEach(p => {
        list.push({
          id: p.id,
          client_id: c.client_id,
          client_name: c.client_name,
          client_email: c.email,
          product_name: c.product_name,
          billing_cycle: p.cycle,
          amount: p.amount,
          start_date: p.period_start,
          end_date: p.period_end,
          is_active: c.is_active
        });
      });
    });
    return {
      success: true,
      data: list
    };
  }

  // GET /admin/customization/requests
  if (lowercaseUrl.includes('/admin/customization/requests') && method === 'GET') {
    const list = [];
    window.__mockClients.forEach(c => {
      c.customizations.forEach(cust => {
        list.push({
          id: cust.id,
          client_display_id: c.client_id,
          client: {
            id: c.id,
            name: c.client_name,
            school_name: c.school_name,
            email: c.email
          },
          customization_text: cust.customization_text,
          amount: cust.amount,
          status: cust.status,
          admin_notes: cust.admin_notes,
          submitted_at: cust.submitted_at,
          created_at: cust.submitted_at
        });
      });
    });
    return {
      success: true,
      data: {
        requests: list
      }
    };
  }

  // POST /admin/customization/requests/{id}/set-amount
  const quoteMatch = lowercaseUrl.match(/\/admin\/customization\/requests\/(\d+)\/set-amount/);
  if (quoteMatch && method === 'POST') {
    const requestId = parseInt(quoteMatch[1], 10);
    const { amount, admin_notes } = data || {};

    window.__mockClients.forEach(c => {
      c.customizations.forEach(cust => {
        if (cust.id === requestId) {
          cust.amount = parseFloat(amount);
          cust.admin_notes = admin_notes;
          cust.status = 'amount_set';
        }
      });
    });
    return {
      success: true,
      message: 'Quote set successfully'
    };
  }

  // POST /admin/customization/requests/{id}/update-status
  const statusUpdateMatch = lowercaseUrl.match(/\/admin\/customization\/requests\/(\d+)\/update-status/);
  if (statusUpdateMatch && method === 'POST') {
    const requestId = parseInt(statusUpdateMatch[1], 10);
    const { status, admin_notes } = data || {};

    window.__mockClients.forEach(c => {
      c.customizations.forEach(cust => {
        if (cust.id === requestId) {
          cust.status = status;
          if (admin_notes) cust.admin_notes = admin_notes;
        }
      });
    });
    return {
      success: true,
      message: 'Request status updated successfully'
    };
  }

  // GET /partner/my-subordinates
  if (lowercaseUrl.includes('/partner/my-subordinates') && method === 'GET') {
    return {
      success: true,
      data: {
        partner: {
          id: 2,
          partner_id: "PIDIN26052",
          name: "Your Partner Name",
          rank: "master"
        },
        summary: {
          total_subordinates: 3,
          total_masters: 1,
          total_associates: 2,
          total_downline: 5,
          total_downline_revenue: 1850000
        },
        hierarchy_tree: {
          id: 2,
          partner_id: "PIDIN26052",
          partner_name: "Your Partner Name",
          organization_name: "Your Organization Name",
          email: "your.email@example.com",
          contact_no: "9876543210",
          rank: "master",
          is_active: true,
          parent_partner_id: null,
          sales_summary: {
            total_sales: 18,
            total_revenue: 720000,
            active_clients: 15
          },
          children: [
            {
              id: 3,
              partner_id: "PIDIN26053",
              partner_name: "Kajol Mahato",
              organization_name: "BB Locals",
              email: "kajol@gmail.com",
              contact_no: "4875680537",
              rank: "associate",
              is_active: true,
              parent_partner_id: "PIDIN26052",
              sales_summary: {
                total_sales: 12,
                total_revenue: 450000,
                active_clients: 9
              },
              children: [
                {
                  id: 6,
                  partner_id: "PIDIN26056",
                  partner_name: "Rohan Verma",
                  organization_name: "Verma Digital Hub",
                  email: "rohan.verma@example.com",
                  contact_no: "9811223344",
                  rank: "associate",
                  is_active: true,
                  parent_partner_id: "PIDIN26053",
                  sales_summary: {
                    total_sales: 5,
                    total_revenue: 180000,
                    active_clients: 4
                  },
                  children: []
                }
              ]
            },
            {
              id: 4,
              partner_id: "PIDIN26054",
              partner_name: "Vikramaditya Roy",
              organization_name: "Apex Tech Solutions",
              email: "vikram@apextech.in",
              contact_no: "9748291038",
              rank: "master",
              is_active: true,
              parent_partner_id: "PIDIN26052",
              sales_summary: {
                total_sales: 16,
                total_revenue: 680000,
                active_clients: 14
              },
              children: [
                {
                  id: 7,
                  partner_id: "PIDIN26057",
                  partner_name: "Pooja Hegde",
                  organization_name: "Pooja Innovations",
                  email: "pooja@innovations.io",
                  contact_no: "9833445566",
                  rank: "associate",
                  is_active: true,
                  parent_partner_id: "PIDIN26054",
                  sales_summary: {
                    total_sales: 8,
                    total_revenue: 310000,
                    active_clients: 7
                  },
                  children: []
                }
              ]
            },
            {
              id: 5,
              partner_id: "PIDIN26055",
              partner_name: "Sneha Mukherjee",
              organization_name: "CloudScale Systems",
              email: "sneha.m@cloudscale.com",
              contact_no: "9823456789",
              rank: "associate",
              is_active: true,
              parent_partner_id: "PIDIN26052",
              sales_summary: {
                total_sales: 9,
                total_revenue: 230000,
                active_clients: 6
              },
              children: []
            }
          ]
        },
        all_subordinates: [
          {
            id: 3,
            partner_id: "PIDIN26053",
            partner_name: "Kajol Mahato",
            organization_name: "BB Locals",
            email: "kajol@gmail.com",
            contact_no: "4875680537",
            rank: "associate",
            is_active: true,
            sales_summary: {
              total_sales: 12,
              total_revenue: 450000,
              active_clients: 9
            },
            total_subordinates: 1
          },
          {
            id: 4,
            partner_id: "PIDIN26054",
            partner_name: "Vikramaditya Roy",
            organization_name: "Apex Tech Solutions",
            email: "vikram@apextech.in",
            contact_no: "9748291038",
            rank: "master",
            is_active: true,
            sales_summary: {
              total_sales: 16,
              total_revenue: 680000,
              active_clients: 14
            },
            total_subordinates: 1
          },
          {
            id: 5,
            partner_id: "PIDIN26055",
            partner_name: "Sneha Mukherjee",
            organization_name: "CloudScale Systems",
            email: "sneha.m@cloudscale.com",
            contact_no: "9823456789",
            rank: "associate",
            is_active: true,
            sales_summary: {
              total_sales: 9,
              total_revenue: 230000,
              active_clients: 6
            },
            total_subordinates: 0
          }
        ]
      }
    };
  }

  // GET /partner/profile
  if (lowercaseUrl.includes('/partner/profile') && method === 'GET') {
    return {
      success: true,
      data: {
        id: 2,
        partner_id: "PIDIN26052",
        organization_name: "Your Organization Name",
        partner_name: "Your Partner Name",
        partner_type: "associate",
        rank: "master",
        email: "your.email@example.com",
        contact_no: "9876543210",
        is_active: true,
        registration_status: "active",
        total_clients: 18,
        extra_earnings_percentage: 15,
        validity_till: "2027-03-31"
      }
    };
  }

  // GET /partner/commission-report
  if (lowercaseUrl.includes('/partner/commission-report') && method === 'GET') {
    return {
      success: true,
      data: {
        partner_id: "PIDIN26052",
        partner_name: "Your Partner Name",
        rank: "master",
        total_sales: 13660.93,
        total_commission: 683.05,
        total_orders: 2,
        monthly_breakdown: [
          {
            month: "2026-07",
            order_count: 2,
            total_sales: 13660.93,
            commission: 683.05
          },
          {
            month: "2026-06",
            order_count: 3,
            total_sales: 18450.00,
            commission: 922.50
          },
          {
            month: "2026-05",
            order_count: 1,
            total_sales: 6500.00,
            commission: 325.00
          }
        ],
        commission_details: [
          {
            id: 8,
            client_name: "BB Locals Client",
            client_display_id: "AIM9745938",
            cycle: "monthly",
            amount: 2064.21,
            payment_date: "2026-07-11 08:09:55",
            seller_id: "PIDIN26053",
            seller_name: "Kajol Mahato",
            seller_rank: "associate",
            my_commission_rate: "5%",
            my_commission_earned: 103.21,
            downline_commissions: [
              {
                partner_id: "PIDIN26053",
                partner_name: "Kajol Mahato",
                rank: "associate",
                commission_rate: "10%",
                commission_earned: 206.42
              }
            ]
          },
          {
            id: 9,
            client_name: "Apex Pro Institute",
            client_display_id: "AIM9745939",
            cycle: "yearly",
            amount: 11596.72,
            payment_date: "2026-07-15 11:24:10",
            seller_id: "PIDIN26054",
            seller_name: "Vikramaditya Roy",
            seller_rank: "master",
            my_commission_rate: "5%",
            my_commission_earned: 579.84,
            downline_commissions: [
              {
                partner_id: "PIDIN26054",
                partner_name: "Vikramaditya Roy",
                rank: "master",
                commission_rate: "15%",
                commission_earned: 1739.51
              },
              {
                partner_id: "PIDIN26057",
                partner_name: "Pooja Hegde",
                rank: "associate",
                commission_rate: "10%",
                commission_earned: 1159.67
              }
            ]
          }
        ]
      }
    };
  }

  return null
}


