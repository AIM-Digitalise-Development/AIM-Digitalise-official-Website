import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'

const DUMMY_AUDITS = [
  { id: 1, audit_id: 'AUD-2026-001', title: 'Financial Tax Audit FY 25-26', type: 'Tax & Finance', auditor: 'Singhal & Associates', date: '2026-05-12', status: 'Approved', remarks: 'Fully compliant, minor advice on asset depreciation entries' },
  { id: 2, audit_id: 'AUD-2026-002', title: 'Information Security & Cyber Audit', type: 'Data Security', auditor: 'SecureNet Labs', date: '2026-04-22', status: 'Approved', remarks: 'Vulnerability scan complete. High-priority recommendations resolved' },
  { id: 3, audit_id: 'AUD-2026-003', title: 'ESIC & PF Labor Compliance Audit', type: 'HR & Labor Laws', auditor: 'EPFO Inspectorate', date: '2026-03-10', status: 'Approved', remarks: 'All contributions paid before deadline. Employee records updated' },
  { id: 4, audit_id: 'AUD-2026-004', title: 'ISO 9001:2015 Quality Systems Audit', type: 'Operations', auditor: 'QMS Global Certification', date: '2026-02-05', status: 'Action Required', remarks: '1 minor non-conformity in documentation revision controls' },
]

const DUMMY_GST_FILINGS = [
  { id: 301, period: 'May 2026', return_type: 'GSTR-1 (Outward Supplies)', file_date: '2026-06-10', taxable_value: 1250000, tax_liability: 225000, itc_claimed: 0, status: 'Filed', ack_no: 'ACK-GST-99214' },
  { id: 302, period: 'May 2026', return_type: 'GSTR-3B (Summary Return)', file_date: '2026-06-20', taxable_value: 1250000, tax_liability: 225000, itc_claimed: 85000, status: 'Filed', ack_no: 'ACK-GST-99285' },
  { id: 303, period: 'April 2026', return_type: 'GSTR-1 (Outward Supplies)', file_date: '2026-05-11', taxable_value: 1080000, tax_liability: 194400, itc_claimed: 0, status: 'Filed', ack_no: 'ACK-GST-97810' },
  { id: 304, period: 'April 2026', return_type: 'GSTR-3B (Summary Return)', file_date: '2026-05-20', taxable_value: 1080000, tax_liability: 194400, itc_claimed: 70000, status: 'Filed', ack_no: 'ACK-GST-97892' },
]

const AdminCompliance = () => {
  const [activePageTab, setActivePageTab] = useState('gst_report')
  const [audits, setAudits] = useState(DUMMY_AUDITS)
  const [filings, setFilings] = useState(DUMMY_GST_FILINGS)

  // GST interactive calculator states
  const [selectedMonth, setSelectedMonth] = useState('May 2026')
  const [outwardSales, setOutwardSales] = useState(1250000)
  const [inputTaxCredit, setInputTaxCredit] = useState(85000)
  const [taxRate, setTaxRate] = useState(18) // GST rate in % (usually 18% for IT/Agency services)
  
  // Calculations
  const calculatedTaxLiability = Math.round(outwardSales * (taxRate / 100))
  const netGstPayable = Math.max(0, calculatedTaxLiability - inputTaxCredit)

  // Mock download trigger
  const handleDownloadReport = (title) => {
    alert(`Downloading ${title} PDF report... (Demo feature)`)
  }

  // File new mock return
  const handleFileReturnMock = () => {
    alert(`Submitting GSTR filing for ${selectedMonth} to GST Portal... (Filing successful! Return receipt added to logs below)`)
    
    // Add GSTR-1 & GSTR-3B mock filings to the state logs
    const month = selectedMonth.split(' ')[0]
    const year = selectedMonth.split(' ')[1]
    const gstr1Obj = {
      id: Date.now(),
      period: selectedMonth,
      return_type: 'GSTR-1 (Outward Supplies)',
      file_date: new Date().toISOString().split('T')[0],
      taxable_value: outwardSales,
      tax_liability: calculatedTaxLiability,
      itc_claimed: 0,
      status: 'Filed',
      ack_no: `ACK-GST-${Math.floor(10000 + Math.random() * 90000)}`
    }
    const gstr3BObj = {
      id: Date.now() + 1,
      period: selectedMonth,
      return_type: 'GSTR-3B (Summary Return)',
      file_date: new Date().toISOString().split('T')[0],
      taxable_value: outwardSales,
      tax_liability: calculatedTaxLiability,
      itc_claimed: inputTaxCredit,
      status: 'Filed',
      ack_no: `ACK-GST-${Math.floor(10000 + Math.random() * 90000)}`
    }

    setFilings([gstr1Obj, gstr3BObj, ...filings])
  }

  return (
    <>
      <Helmet>
        <title>Compliance & Filings | Admin Panel</title>
      </Helmet>

      <div className="space-y-6 select-none text-slate-700 animate-fade-in">
        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px]">
          <div>
            <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Compliance & Audits</h1>
            <p className="text-xs text-slate-400 font-bold mt-1">Review internal audit registries, ISO assessments, and file monthly/quarterly GST returns</p>
          </div>

          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0">
            <h2 className="text-lg font-extrabold text-[#1e3e6b]">AIM Digitalise pvt. ltd.</h2>
            <p className="text-xs font-bold text-slate-500">Financial Year: 2026-2027</p>
          </div>

          <div className="w-48 flex justify-end">
            <span className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-[#38b34a] shadow-sm">
              🟢 Live Demo Data
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
          
          {/* Tabs Navigation Row */}
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/60 pb-3 mb-6">
            {[
              { id: 'gst_report', label: 'GST Filings & Returns' },
              { id: 'audit_report', label: 'Corporate Audit Reports' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePageTab(tab.id)}
                className={`px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all cursor-pointer border-t-2 ${
                  activePageTab === tab.id
                    ? 'bg-white border-[#38b34a] text-[#38b34a] -mb-[13px] z-10'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: GST Filings & Tax calculation */}
          {activePageTab === 'gst_report' && (
            <div className="space-y-6">
              
              {/* GST Calc Module */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-5">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <span>📊</span>
                    <span>GST Calculation & Filing Portal</span>
                  </h4>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#ff6600]">GST Portal Simulator</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Filing Month</label>
                    <select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#38b34a] font-bold font-sans text-slate-700 shadow-sm"
                    >
                      <option value="June 2026">June 2026 (Unfiled)</option>
                      <option value="May 2026">May 2026 (Filed)</option>
                      <option value="April 2026">April 2026 (Filed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Outward Sales Supply (Gross)</label>
                    <input
                      type="number"
                      value={outwardSales}
                      onChange={e => setOutwardSales(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#38b34a] font-bold font-sans text-slate-700 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Eligible Input Tax Credit (ITC)</label>
                    <input
                      type="number"
                      value={inputTaxCredit}
                      onChange={e => setInputTaxCredit(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#38b34a] font-bold font-sans text-slate-700 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tax Rate (IT Services)</label>
                    <select
                      value={taxRate}
                      onChange={e => setTaxRate(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#38b34a] font-bold font-sans text-slate-700 shadow-sm"
                    >
                      <option value={18}>18% (Service Industry)</option>
                      <option value={12}>12% (Goods Plan A)</option>
                      <option value={5}>5% (Essential Goods)</option>
                    </select>
                  </div>
                </div>

                {/* GST Liability results */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-slate-200">
                  <div className="bg-white border p-4 rounded-xl shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Output GST Liability</span>
                    <span className="text-xl font-black text-slate-800 mt-1 block">₹{calculatedTaxLiability.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white border p-4 rounded-xl shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Eligible ITC Offset</span>
                    <span className="text-xl font-black text-blue-600 mt-1 block">₹{inputTaxCredit.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-white border-2 border-[#1e3e6b] p-4 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#1e3e6b] font-black uppercase tracking-wider block">Net Cash Payable</span>
                      <span className="text-2xl font-black text-[#1e3e6b] mt-0.5 block">₹{netGstPayable.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      onClick={handleFileReturnMock}
                      className="px-4 py-2 bg-[#ff6600] hover:bg-[#e05500] text-white font-bold rounded-lg text-xs uppercase tracking-wide cursor-pointer transition-all shadow-md active:scale-95"
                    >
                      File Return
                    </button>
                  </div>
                </div>
              </div>

              {/* GST returns filings log */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">GST Filing History Logs</h4>
                  <span className="text-xs text-slate-400 font-medium">Auto-generated return acknowledgements</span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Filing Period</th>
                          <th className="px-6 py-4">GST Return Type</th>
                          <th className="px-6 py-4 text-right">Taxable Outward Sales</th>
                          <th className="px-6 py-4 text-right">Output GST Liability</th>
                          <th className="px-6 py-4 text-right">ITC offset</th>
                          <th className="px-6 py-4">Filing Date</th>
                          <th className="px-6 py-4 font-mono">GST Ack Number</th>
                          <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {filings.map(fil => (
                          <tr key={fil.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-slate-800 font-bold">{fil.period}</td>
                            <td className="px-6 py-4 text-slate-500 font-bold">{fil.return_type}</td>
                            <td className="px-6 py-4 text-right font-black">₹{fil.taxable_value.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-4 text-right font-black">₹{fil.tax_liability.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-4 text-right font-black text-blue-600">
                              {fil.itc_claimed > 0 ? `₹${fil.itc_claimed.toLocaleString('en-IN')}` : '—'}
                            </td>
                            <td className="px-6 py-4 text-slate-500">{new Date(fil.file_date).toLocaleDateString('en-IN')}</td>
                            <td className="px-6 py-4 font-mono text-[10px] text-slate-400 font-bold">{fil.ack_no}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[10px] uppercase tracking-wider">
                                {fil.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Corporate Audit reports */}
          {activePageTab === 'audit_report' && (
            <div className="space-y-6">
              
              {/* Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Audits Completed</span>
                    <span className="text-xl font-black text-slate-800 mt-1 block">{audits.length}</span>
                  </div>
                  <span className="text-xl">✅</span>
                </div>
                <div className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Compliance Health</span>
                    <span className="text-xl font-black text-emerald-600 mt-1 block">96%</span>
                  </div>
                  <span className="text-xl text-emerald-500">🛡️</span>
                </div>
                <div className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Actions</span>
                    <span className="text-xl font-black text-amber-500 mt-1 block">1</span>
                  </div>
                  <span className="text-xl text-amber-500">⏳</span>
                </div>
                <div className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Last Review Date</span>
                    <span className="text-xs font-bold text-slate-700 mt-1.5 block">12 May 2026</span>
                  </div>
                  <span className="text-xl">📅</span>
                </div>
              </div>

              {/* Audit history list */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Audit ID</th>
                        <th className="px-6 py-4">Audit Assessment</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Assigned Auditor</th>
                        <th className="px-6 py-4">Inspection Date</th>
                        <th className="px-6 py-4">Remarks & Findings</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {audits.map(aud => (
                        <tr key={aud.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-400">{aud.audit_id}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-800">{aud.title}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 font-bold text-[9px] uppercase tracking-wide">
                              {aud.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{aud.auditor}</td>
                          <td className="px-6 py-4 text-slate-500">{new Date(aud.date).toLocaleDateString('en-IN')}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium italic max-w-xs truncate">"{aud.remarks}"</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              aud.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                            }`}>
                              {aud.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDownloadReport(aud.title)}
                              className="text-blue-600 hover:text-blue-800 font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                            >
                              📥 PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default AdminCompliance
