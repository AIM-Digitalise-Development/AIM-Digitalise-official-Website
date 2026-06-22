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
      follow_up_date: "2026-06-23 10:00:00",
      next_follow_up: "2026-06-23 10:00:00",
      notes: "Interested in our enterprise solution",
      remarks: null,
      product_interest: "Institute Pro",
      budget: "1000000.00",
      expected_close_date: "2026-07-15",
      conversion_date: null,
      converted_to_client_id: null,
      is_converted: false,
      is_active: true,
      lost_reason: null,
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
      follow_up_date: "2026-06-25 10:00:00",
      next_follow_up: "2026-06-25 10:00:00",
      notes: "Looking for custom LMS solution for their school",
      remarks: null,
      product_interest: "Custom Solution",
      budget: "2500000.00",
      expected_close_date: "2026-08-30",
      conversion_date: null,
      converted_to_client_id: null,
      is_converted: false,
      is_active: true,
      lost_reason: null,
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
      follow_up_date: null,
      next_follow_up: null,
      notes: "Follow up after initial call",
      remarks: null,
      product_interest: "ERP System",
      budget: "1500000.00",
      expected_close_date: "2026-09-15",
      conversion_date: null,
      converted_to_client_id: null,
      is_converted: false,
      is_active: true,
      lost_reason: null,
      created_at: "2026-06-19T09:15:00.000000Z",
      updated_at: "2026-06-19T09:15:00.000000Z",
      employee: {
        id: 1,
        employee_id: "AIM260001",
        full_name: "John Doe"
      },
      activities: []
    }
  ]
}

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

      const todayStr = '2026-06-22'
      const followUpToday = leadsList.filter(l => l.follow_up_date && l.follow_up_date.startsWith(todayStr)).length
      const pendingFollowUp = leadsList.filter(l => {
        if (!l.follow_up_date) return false
        const dateStr = l.follow_up_date.split(' ')[0]
        return dateStr < todayStr && l.lead_status !== 'converted' && l.lead_status !== 'lost' && l.lead_status !== 'junk'
      }).length

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
            budget: data.budget !== undefined ? String(data.budget) : l.budget,
            expected_close_date: data.expected_close_date !== undefined ? data.expected_close_date : l.expected_close_date,
            notes: data.notes || l.notes,
            updated_at: new Date().toISOString()
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
        follow_up_date: data.follow_up_date || null,
        next_follow_up: data.follow_up_date || null,
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
      if (followUpTodayFlag) {
        const todayStr = '2026-06-22'
        filtered = filtered.filter(l => l.follow_up_date && l.follow_up_date.startsWith(todayStr))
      }
      if (pendingFollowUpFlag) {
        const todayStr = '2026-06-22'
        filtered = filtered.filter(l => {
          if (!l.follow_up_date) return false
          const dateStr = l.follow_up_date.split(' ')[0]
          return dateStr < todayStr && l.lead_status !== 'converted' && l.lead_status !== 'lost' && l.lead_status !== 'junk'
        })
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
