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
  }
  const lowercaseUrl = normalizedUrl
  if (!data) data = {}

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

    // POST /employee/leads (Create)
    if (method === 'POST') {
      const newId = leadsList.length > 0 ? Math.max(...leadsList.map(l => l.id)) + 1 : 1
      const leadId = `LEAD26${String(newId).padStart(5, '0')}`
      const followUp = data.follow_up_date || data.expected_close_date || null
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
        lead_source: data.lead_source || 'Website',
        lead_status: data.lead_status || 'new',
        lead_priority: data.lead_priority || 'medium',
        assigned_to: data.assigned_to || null,
        assigned_by: data.assigned_to ? getLoggedInMockEmployee().id : null,
        follow_up_date: followUp,
        next_follow_up: followUp,
        notes: data.notes || null,
        remarks: null,
        product_interest: data.product_interest || null,
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

  if (lowercaseUrl.includes('/client/customization/pending-payments')) {
    return {
      success: true,
      data: {
        pending_requests: [
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
          }
        ]
      }
    }
  }

  if (lowercaseUrl.includes('/client/customization/payment-history')) {
    return {
      success: true,
      data: {
        payments: [
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
    }
  }

  if (lowercaseUrl.includes('/client/customization/create-payment-order')) {
    return {
      success: true,
      simulated: true,
      amount: data?.amount || 5000,
      order_id: 'order_cust_' + Math.random().toString(36).substring(2, 12),
      payment_record_id: 'record_' + Math.random().toString(36).substring(2, 12),
      key: 'rzp_test_mockkey123',
      currency: 'INR',
      client_name: 'Demo Client School',
      client_email: 'client@demo.com'
    }
  }

  if (lowercaseUrl.includes('/client/customization/verify-payment')) {
    return {
      success: true,
      message: 'Customization payment verified successfully (Mock Mode).'
    }
  }

  if (lowercaseUrl.includes('/client/customization/requests')) {
    return {
      success: true,
      data: {
        requests: [
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
    }
  }

  if (lowercaseUrl.includes('/client/customization/submit')) {
    return {
      success: true,
      message: 'Customization request submitted successfully.'
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

  return null
}

