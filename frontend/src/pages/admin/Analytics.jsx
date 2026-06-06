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
              
              {/* Row: Payment Received Title */}
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  {/* Rupee icon */}
                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-sm font-black flex items-center justify-center">
                    ₹
                  </span>
                  <span>Payment Received</span>
                </h3>
              </div>

              {/* Centered card placeholder */}
              <div className="border border-slate-200/60 bg-slate-50/50 rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4 shadow-inner min-h-[260px]">
                {/* Wallet or Document folder icon */}
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/60 shadow-sm flex items-center justify-center shrink-0">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-400 font-sans">
                  Payment received records will be displayed here.
                </p>
              </div>

            </div>
          )}

          {/* Other tab placeholders */}
          {activeTab !== 'payment_received' && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3.5">
              <span className="text-4xl">📊</span>
              <h4 className="text-base font-bold text-slate-800 capitalize">{activeTab.replace('_', ' ')} Records</h4>
              <p className="text-xs text-slate-400 font-medium max-w-sm leading-relaxed font-sans">
                Financial records, ledgers, accounts balances, and statements for this tab will be displayed here.
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default AdminAnalytics