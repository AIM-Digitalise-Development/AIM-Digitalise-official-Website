import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'

const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState('payment_received')

  return (
    <>
      <Helmet>
        <title>Accounts | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Header containing page title, centered company header */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          {/* Left Side: Page Title */}
          <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Accounts</h1>

          {/* Center: Company Banner */}
          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          <div className="w-48"></div>
        </div>

        {/* White container card for tabs and content */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
          
          {/* Tabs row */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            {[
              { id: 'payment_received', label: 'Payment Received' },
              { id: 'due_payment', label: 'Due Payment' },
              { id: 'total_sales', label: 'Total Sales' },
              { id: 'petty_cash', label: 'Petty Cash' },
              { id: 'expenditure', label: 'Expenditure' },
              { id: 'balance_sheet', label: 'Balance Sheet' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                  activeTab === tab.id
                    ? 'bg-white border-[#ef4444] text-[#ef4444] -mb-[13px] z-10'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content 1: Payment Received */}
          {activeTab === 'payment_received' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-sm font-black flex items-center justify-center">
                    ₹
                  </span>
                  <span>Payment Received Log</span>
                </h3>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Payment ID</th>
                        <th className="px-6 py-4">Remitter Entity</th>
                        <th className="px-6 py-4 text-right">Amount Received</th>
                        <th className="px-6 py-4">Received Date</th>
                        <th className="px-6 py-4">Payment Channel</th>
                        <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-500">PAY-918231</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">Greenfield School</td>
                        <td className="px-6 py-4 text-right font-black text-emerald-600">₹30,000.00</td>
                        <td className="px-6 py-4 text-slate-400">12 May 2026</td>
                        <td className="px-6 py-4 text-slate-600">Razorpay API Link</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Clear
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-500">PAY-918228</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">Partner: Apex Sales Agency</td>
                        <td className="px-6 py-4 text-right font-black text-emerald-600">₹14,999.00</td>
                        <td className="px-6 py-4 text-slate-400">10 May 2026</td>
                        <td className="px-6 py-4 text-slate-600">Bank IMPS / UPI</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Clear
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Due Payment */}
          {activeTab === 'due_payment' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-sm font-black flex items-center justify-center">
                    ₹
                  </span>
                  <span>Dues Ledger</span>
                </h3>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Invoice ID</th>
                        <th className="px-6 py-4">Debtor Entity</th>
                        <th className="px-6 py-4 text-right">Outstanding Amount</th>
                        <th className="px-6 py-4">Due Date</th>
                        <th className="px-6 py-4 text-center">Ageing Period</th>
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-500">INV-2026-102</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">Sunrise Academy</td>
                        <td className="px-6 py-4 text-right font-black text-rose-600">₹15,000.00</td>
                        <td className="px-6 py-4 text-slate-400">15 May 2026</td>
                        <td className="px-6 py-4 text-center text-rose-500 font-bold">22 Days Overdue</td>
                        <td className="px-6 py-4 text-center">
                          <button className="px-2 py-1 bg-red-50 text-rose-600 border border-red-200 hover:bg-red-100 rounded font-bold transition-all text-[10px]">
                            Notify Finance
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 3: Total Sales */}
          {activeTab === 'total_sales' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-sm font-black flex items-center justify-center">
                    📈
                  </span>
                  <span>Total Sales Report</span>
                </h3>
              </div>

              {/* Stats Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Monthly Closed Deals</span>
                  <span className="text-2xl font-black text-slate-800 mt-1 block">₹2,45,000.00</span>
                </div>
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">FY Target Completion</span>
                  <span className="text-2xl font-black text-slate-800 mt-1 block">72.4%</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Deal Reference</th>
                        <th className="px-6 py-4">Acquired Client</th>
                        <th className="px-6 py-4">Product Instance</th>
                        <th className="px-6 py-4 text-right">Closed Deal Value</th>
                        <th className="px-6 py-4">Closing Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-500">SAL-2026-092</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">Blue Hill Institute</td>
                        <td className="px-6 py-4">College Portal (Enterprise Plan)</td>
                        <td className="px-6 py-4 text-right font-black text-slate-800">₹1,20,000.00</td>
                        <td className="px-6 py-4 text-slate-400">05 Jun 2026</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-500">SAL-2026-089</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">Nova Tech Solutions</td>
                        <td className="px-6 py-4">CRM Enterprise</td>
                        <td className="px-6 py-4 text-right font-black text-slate-800">₹85,000.00</td>
                        <td className="px-6 py-4 text-slate-400">22 May 2026</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 4: Petty Cash */}
          {activeTab === 'petty_cash' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-sm font-black flex items-center justify-center">
                    💵
                  </span>
                  <span>Petty Cash Book</span>
                </h3>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Voucher ID</th>
                        <th className="px-6 py-4">Expense Particulars</th>
                        <th className="px-6 py-4 text-right">Debit Amount</th>
                        <th className="px-6 py-4">Voucher Date</th>
                        <th className="px-6 py-4 text-center">Approved By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-500">PV-2026-056</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">Office Coffee, Sugar & Pantry Supplies</td>
                        <td className="px-6 py-4 text-right font-black text-slate-800">₹450.00</td>
                        <td className="px-6 py-4 text-slate-400">06 Jun 2026</td>
                        <td className="px-6 py-4 text-center text-slate-500">Admin</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-500">PV-2026-055</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">Postage & Courier Charges (Client Agreements)</td>
                        <td className="px-6 py-4 text-right font-black text-slate-800">₹120.00</td>
                        <td className="px-6 py-4 text-slate-400">03 Jun 2026</td>
                        <td className="px-6 py-4 text-center text-slate-500">Admin</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 5: Expenditure */}
          {activeTab === 'expenditure' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-sm font-black flex items-center justify-center">
                    📉
                  </span>
                  <span>Operational Expenditures</span>
                </h3>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Head of Account</th>
                        <th className="px-6 py-4">Expense Category</th>
                        <th className="px-6 py-4 text-right">Debit Amount</th>
                        <th className="px-6 py-4">Billing Frequency</th>
                        <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">AWS Server Cloud Hosting</td>
                        <td className="px-6 py-4 text-slate-500">IT Infrastructure</td>
                        <td className="px-6 py-4 text-right font-black text-slate-800">₹18,500.00</td>
                        <td className="px-6 py-4 text-slate-400">Monthly Billing</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            PAID
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">Office Workspace Lease Rent</td>
                        <td className="px-6 py-4 text-slate-500">Office Administration</td>
                        <td className="px-6 py-4 text-right font-black text-slate-800">₹45,000.00</td>
                        <td className="px-6 py-4 text-slate-400">Monthly Billing</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            DUE
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 6: Balance Sheet */}
          {activeTab === 'balance_sheet' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-sm font-black flex items-center justify-center">
                    ⚖️
                  </span>
                  <span>Balance Sheet Statement (Audited)</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">As of 06 June 2026</span>
              </div>

              {/* Grid: Liabilities and Assets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Liabilities Panel */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px] text-slate-500 flex justify-between">
                    <span>Liabilities & Equity</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs p-4 space-y-2.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">Shareholder Capital</span>
                      <span className="font-bold text-slate-900">₹5,00,000.00</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2">
                      <span className="text-slate-700">Reserves & Surplus (Profit/Loss A/C)</span>
                      <span className="font-bold text-slate-900">₹8,45,000.00</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2">
                      <span className="text-slate-700">Secured Bank Loans</span>
                      <span className="font-bold text-slate-900">₹1,50,000.00</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2">
                      <span className="text-slate-700">Outstanding Partner Commission Accruals</span>
                      <span className="font-bold text-slate-900">₹50,000.00</span>
                    </div>
                    <div className="flex justify-between font-black border-t border-slate-200 pt-3 text-sm text-[#ef4444]">
                      <span>Total Liabilities & Equity</span>
                      <span>₹15,45,000.00</span>
                    </div>
                  </div>
                </div>

                {/* Assets Panel */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px] text-slate-500 flex justify-between">
                    <span>Assets & Dues</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs p-4 space-y-2.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">Cash-at-Bank (Current Account)</span>
                      <span className="font-bold text-slate-900">₹10,50,000.00</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2">
                      <span className="text-slate-700">Cash-in-Hand (Petty Cash Vault)</span>
                      <span className="font-bold text-slate-900">₹15,000.00</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2">
                      <span className="text-slate-700">Outstanding Client Receivables (Dues)</span>
                      <span className="font-bold text-slate-900">₹1,80,000.00</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2">
                      <span className="text-slate-700">Office Equipment & Assets Block</span>
                      <span className="font-bold text-slate-900">₹3,00,000.00</span>
                    </div>
                    <div className="flex justify-between font-black border-t border-slate-200 pt-3 text-sm text-[#38b34a]">
                      <span>Total Assets</span>
                      <span>₹15,45,000.00</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default AdminAnalytics