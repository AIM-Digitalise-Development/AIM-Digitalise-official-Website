import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const INITIAL_TICKETS = [
  { 
    id: 'TK-7051', 
    client: 'Sunrise Academy', 
    product: 'School MS', 
    subject: 'Student marks report showing incorrect grand total', 
    category: 'Bug', 
    severity: 'High', 
    dateLogged: '19 May 2025, 10:30 AM', 
    status: 'OPEN', 
    description: 'The report card generator is miscalculating the grand total by adding grace marks twice. Need immediate hotfix as report cards are being issued this week.',
    assignee: 'Rohan Verma'
  },
  { 
    id: 'TK-7052', 
    client: 'Blue Hill Institute', 
    product: 'College Portal', 
    subject: 'SSL handshake failed on custom domain integration', 
    category: 'Setup', 
    severity: 'Medium', 
    dateLogged: '18 May 2025, 02:15 PM', 
    status: 'IN PROGRESS', 
    description: 'Configured CNAME pointing to our portal servers but HTTPS throws SSL_ERROR_BAD_CERT_DOMAIN. Cloudflare proxy is active.',
    assignee: 'Unassigned'
  },
  { 
    id: 'TK-7053', 
    client: 'Apex Retailers', 
    product: 'GST Billing Tool', 
    subject: 'Invoice PDF fails to download with 500 error', 
    category: 'Billing', 
    severity: 'High', 
    dateLogged: '19 May 2025, 11:00 AM', 
    status: 'OPEN', 
    description: 'The PDF generation times out after 30 seconds and returns a 500 server error for invoices containing more than 50 items.',
    assignee: 'Unassigned'
  },
  { 
    id: 'TK-7054', 
    client: 'Nova Tech Solutions', 
    product: 'CRM Enterprise', 
    subject: 'API webhook rate limits and retry thresholds', 
    category: 'Inquiry', 
    severity: 'Low', 
    dateLogged: '15 May 2025, 04:30 PM', 
    status: 'IN PROGRESS', 
    description: 'Need clarification on the rate limiting policy for webhooks. Currently getting 429 status codes during peak traffic.',
    assignee: 'Aman Gupta'
  },
  { 
    id: 'TK-7055', 
    client: 'Greenfield School', 
    product: 'School MS', 
    subject: 'SMS Gateway DLT Template approval sync', 
    category: 'Setup', 
    severity: 'Medium', 
    dateLogged: '17 May 2025, 01:20 PM', 
    status: 'RESOLVED', 
    description: 'DLT template registration approved but sms-gateway still reports template unverified. Sync required.',
    assignee: 'Neha Sharma'
  },
  { 
    id: 'TK-7056', 
    client: 'City Mart Group', 
    product: 'E-Commerce Hub', 
    subject: 'Integrate local delivery partner API endpoint', 
    category: 'Customization', 
    severity: 'High', 
    dateLogged: '12 May 2025, 09:10 AM', 
    status: 'RESOLVED', 
    description: 'Need to add customized webhook listener for shadowfax delivery agent tracking events.',
    assignee: 'Vikram Malhotra'
  }
]

export const useSupportStore = create(
  persist(
    (set) => ({
      tickets: INITIAL_TICKETS,
      ticketReplies: {},
      auditLogs: {},

      addTicket: (ticket) => set((state) => {
        const updatedTickets = [{ assignee: 'Unassigned', ...ticket }, ...state.tickets];
        const currentLogs = state.auditLogs[ticket.id] || [];
        const updatedLogs = {
          ...state.auditLogs,
          [ticket.id]: [
            ...currentLogs,
            {
              action: 'Ticket Created',
              date: ticket.dateLogged,
              description: `System recorded ticket submission. Assigned to: ${ticket.assignee || 'Unassigned'}`
            }
          ]
        };
        return { tickets: updatedTickets, auditLogs: updatedLogs };
      }),

      addReply: (ticketId, reply) => set((state) => {
        const replies = state.ticketReplies[ticketId] || [];
        const updatedReplies = {
          ...state.ticketReplies,
          [ticketId]: [...replies, reply]
        };
        return { ticketReplies: updatedReplies };
      }),

      resolveTicket: (ticketId) => set((state) => {
        const updatedTickets = state.tickets.map((t) => 
          t.id === ticketId ? { ...t, status: 'RESOLVED' } : t
        );
        const logs = state.auditLogs[ticketId] || [];
        const updatedLogs = {
          ...state.auditLogs,
          [ticketId]: [
            ...logs,
            {
              action: 'Status Changed to Resolved',
              date: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) + `, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
              description: 'Issue resolved.'
            }
          ]
        };
        return { tickets: updatedTickets, auditLogs: updatedLogs };
      }),

      updateTicketStatus: (ticketId, status) => set((state) => {
        const updatedTickets = state.tickets.map((t) => 
          t.id === ticketId ? { ...t, status } : t
        );
        const logs = state.auditLogs[ticketId] || [];
        const updatedLogs = {
          ...state.auditLogs,
          [ticketId]: [
            ...logs,
            {
              action: `Status Changed to ${status}`,
              date: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) + `, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
              description: `Status updated to ${status}.`
            }
          ]
        };
        return { tickets: updatedTickets, auditLogs: updatedLogs };
      }),

      assignTicket: (ticketId, employeeName) => set((state) => {
        const updatedTickets = state.tickets.map((t) => 
          t.id === ticketId ? { ...t, assignee: employeeName } : t
        );
        const logs = state.auditLogs[ticketId] || [];
        const updatedLogs = {
          ...state.auditLogs,
          [ticketId]: [
            ...logs,
            {
              action: `Ticket Assigned`,
              date: new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) + `, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
              description: `Ticket assigned to ${employeeName}.`
            }
          ]
        };
        return { tickets: updatedTickets, auditLogs: updatedLogs };
      })
    }),
    { name: 'aim-support-storage' }
  )
)
