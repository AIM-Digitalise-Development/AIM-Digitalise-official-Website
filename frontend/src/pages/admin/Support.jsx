import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'

const AdminSupport = () => {
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('Technical')
  const [priority, setPriority] = useState('Medium')
  const [message, setMessage] = useState('')
  const [tickets, setTickets] = useState([
    { id: 'TK-1024', subject: 'Partner portal login delay', category: 'Technical', priority: 'High', status: 'IN_PROGRESS', date: '06 Jun 2026' },
    { id: 'TK-1021', subject: 'Invoice generation failing for GST', category: 'Billing', priority: 'Critical', status: 'OPEN', date: '05 Jun 2026' },
    { id: 'TK-1015', subject: 'Bulk upload client verification fail', category: 'General', priority: 'Medium', status: 'RESOLVED', date: '01 Jun 2026' }
  ])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!subject || !message) {
      alert('Please fill out all fields.')
      return
    }
    const newTicket = {
      id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject,
      category,
      priority,
      status: 'OPEN',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    setTickets([newTicket, ...tickets])
    setSubject('')
    setMessage('')
    alert('Support ticket created successfully!')
  }

  return (
    <>
      <Helmet>
        <title>System Support | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Header containing page title, centered company header */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Support</h1>

          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          <div className="w-48"></div>
        </div>

        {/* Support Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Form and Tickets */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Create Ticket Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Create New Support Ticket</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#38b34a] focus:ring-1 focus:ring-[#38b34a]/10"
                    >
                      <option value="Technical">Technical Issue</option>
                      <option value="Billing">Billing & Subscription</option>
                      <option value="Partner">Partner Queries</option>
                      <option value="General">General Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#38b34a] focus:ring-1 focus:ring-[#38b34a]/10"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Short description of the problem..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#38b34a] focus:ring-1 focus:ring-[#38b34a]/10"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Detailed Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                    placeholder="Please explain the issue or request in detail..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#38b34a] focus:ring-1 focus:ring-[#38b34a]/10"
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Submit Ticket</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Support Ticket Logs */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Recent Support Tickets Log</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Ticket ID</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-500">{t.id}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{t.subject}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold">
                            {t.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          <span className={`${
                            t.priority === 'Critical' ? 'text-rose-600 font-black' :
                            t.priority === 'High' ? 'text-orange-500' : 'text-slate-600'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-medium">{t.date}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            t.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Column 3: System Status & Contacts */}
          <div className="space-y-6">
            
            {/* Health & Performance Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <span>System Status</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-100 bg-emerald-50/70">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800">All Systems Operational</h4>
                    <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Vite Dev Server, API gateway and DB connections active.</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-2.5">
                    <span className="font-bold text-slate-400">Response SLA</span>
                    <span className="font-black text-slate-700">&lt; 15 mins</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="font-bold text-slate-400">API Health</span>
                    <span className="font-black text-[#38b34a]">99.98% Uptime</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="font-bold text-slate-400">Server Location</span>
                    <span className="font-black text-slate-700">Mumbai AWS APAC</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="font-bold text-slate-400">Database Engine</span>
                    <span className="font-black text-slate-700">MySQL 8.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contacts Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <span>Emergency Support</span>
              </h3>

              <div className="space-y-3.5 text-xs font-sans">
                <div>
                  <span className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest mb-1">Sales Escalation</span>
                  <a href="tel:+919875592050" className="text-sm font-bold text-indigo-600 hover:underline">+91 98755 92050</a>
                </div>
                <div>
                  <span className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest mb-1">Technical Desk</span>
                  <a href="tel:03366182659" className="text-sm font-bold text-indigo-600 hover:underline">033 6618 2659</a>
                </div>
                <div>
                  <span className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest mb-1">Developer Mailbox</span>
                  <a href="mailto:support@aimdigitalise.com" className="text-sm font-bold text-indigo-600 hover:underline">support@aimdigitalise.com</a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  )
}

export default AdminSupport
