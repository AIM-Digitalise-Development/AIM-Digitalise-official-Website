import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'

const AdminSettings = () => {
  const [productFilter, setProductFilter] = useState('All')
  const [clientSearch, setClientSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [activeTab, setActiveTab] = useState('client_list')

  // High fidelity dataset matching the screenshot exactly
  const mockSubscriptions = [
    { id: 'SUB-001', name: 'Sunrise Academy', product: 'School MS', plan: 'Gold', amount: 45000, startDate: '10 Apr 2025', endDate: '09 Apr 2026', status: 'ACTIVE' },
    { id: 'SUB-002', name: 'Greenfield School', product: 'School MS', plan: 'Silver', amount: 30000, startDate: '12 May 2025', endDate: '11 May 2026', status: 'ACTIVE' },
    { id: 'SUB-003', name: 'Blue Hill Institute', product: 'College Portal', plan: 'Enterprise', amount: 120000, startDate: '15 Sep 2024', endDate: '14 Sep 2025', status: 'ACTIVE' },
    { id: 'SUB-004', name: 'Apex Retailers', product: 'GST Billing Tool', plan: 'Bronze', amount: 12500, startDate: '20 Jan 2025', endDate: '19 Jan 2026', status: 'ACTIVE' },
    { id: 'SUB-005', name: 'Nova Tech Solutions', product: 'CRM Enterprise', plan: 'Gold', amount: 85000, startDate: '05 Feb 2025', endDate: '04 Feb 2026', status: 'ACTIVE' },
  ]

  // Filter subscription rows
  const filteredSubs = mockSubscriptions.filter(sub => {
    const matchesProduct = productFilter === 'All' || sub.product === productFilter
    const matchesStatus = statusFilter === 'All' || sub.status === statusFilter
    const matchesSearch = sub.name.toLowerCase().includes(clientSearch.toLowerCase()) || sub.id.toLowerCase().includes(clientSearch.toLowerCase())
    return matchesProduct && matchesStatus && matchesSearch
  })

  return (
    <>
      <Helmet>
        <title>Subscription | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          {/* Left Title */}
          <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Subscription</h1>

          {/* Center Branding */}
          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          <div className="w-48"></div>
        </div>

        {/* Filters Panel Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md flex flex-col md:flex-row gap-5 items-end">
          {/* Product dropdown */}
          <div className="w-full md:flex-grow">
            <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Product Wise Search</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
              >
                <option value="All">All Products</option>
                <option value="School MS">School MS</option>
                <option value="College Portal">College Portal</option>
                <option value="GST Billing Tool">GST Billing Tool</option>
                <option value="CRM Enterprise">CRM Enterprise</option>
              </select>
            </div>
          </div>

          {/* Client Search */}
          <div className="w-full md:flex-grow">
            <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Client Name / Search</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Type to search client..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-sans"
              />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="w-full md:w-56 shrink-0">
            <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#38b34a] focus:ring-2 focus:ring-[#38b34a]/10 transition-all font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        {/* Content Card Panel */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
          
          {/* Navigation Tabs Row */}
          <div className="flex items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            <button
              onClick={() => setActiveTab('client_list')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'client_list'
                  ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Client List
            </button>
            <button
              onClick={() => setActiveTab('customization')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'customization'
                  ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Customization
            </button>
            <button
              onClick={() => setActiveTab('due_payment')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'due_payment'
                  ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Due Payment
            </button>
            <button
              onClick={() => setActiveTab('payment_report')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'payment_report'
                  ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Payment Report
            </button>
            <button
              onClick={() => setActiveTab('next_renewal')}
              className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                activeTab === 'next_renewal'
                  ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
              }`}
            >
              Next Renewal
            </button>
          </div>

          {/* Tab 1 Content: Client List Table */}
          {activeTab === 'client_list' && (
            <div className="space-y-6">
              
              {/* Table Subtitle Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  {/* List bullet icon in red/orange */}
                  <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>Subscription Client List</span>
                </h3>
                {/* Export List blue button */}
                <button
                  type="button"
                  onClick={() => alert('Exporting subscriptions...')}
                  className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export List</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Sub ID</th>
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Plan</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4">Start Date</th>
                        <th className="px-6 py-4">End Date</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredSubs.length > 0 ? (
                        filteredSubs.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-slate-500">{sub.id}</td>
                            <td className="px-6 py-4 font-bold text-slate-800 text-sm">{sub.name}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded bg-[#e2e8f0] text-slate-700 font-bold text-[10px] uppercase">
                                {sub.product}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-blue-600">{sub.plan}</td>
                            <td className="px-6 py-4 text-right font-black text-slate-800 text-sm">
                              ₹{sub.amount.toLocaleString('en-IN')}.00
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-500">{sub.startDate}</td>
                            <td className="px-6 py-4 font-medium text-slate-500">{sub.endDate}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider bg-emerald-100 text-emerald-800 border-emerald-200">
                                {sub.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => alert(`Showing details for ${sub.name}`)}
                                className="px-3 py-1.5 rounded-lg border border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-600 font-bold cursor-pointer transition-all flex items-center gap-1 mx-auto"
                              >
                                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Details</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-12 text-slate-400">
                            <span className="text-3xl block">📁</span>
                            <p className="font-bold mt-2">No subscriptions match search criteria</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Inactive Tab Placeholders */}
          {activeTab !== 'client_list' && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3.5">
              <span className="text-4xl">📄</span>
              <h4 className="text-base font-bold text-slate-800 capitalize">{activeTab.replace('_', ' ')} Tab Content</h4>
              <p className="text-xs text-slate-400 font-medium max-w-sm leading-relaxed font-sans">
                Dynamic configuration, custom fields, billing details, and reports for this tab will be displayed here.
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default AdminSettings