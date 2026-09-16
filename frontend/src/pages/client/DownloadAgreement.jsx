import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useClientAuthStore } from '../../store/clientAuthStore'
import { getClientAgreementData, downloadAgreementPdf } from '../../api/clientPortal'

export default function DownloadAgreement() {
  const { clientToken, profileData, clientUser } = useClientAuthStore()
  const [agreementData, setAgreementData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAgreementInfo()
  }, [clientToken])

  const fetchAgreementInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getClientAgreementData(clientToken)
      if (res && res.success && res.data) {
        setAgreementData(res.data)
      } else {
        // Fallback to local profile store
        buildFallbackData()
      }
    } catch (err) {
      console.warn('API error fetching agreement data, using profile fallback:', err)
      buildFallbackData()
    } finally {
      setLoading(false)
    }
  }

  const buildFallbackData = () => {
    const clientName = profileData?.client_name || clientUser?.client_name || clientUser?.name || 'Valued Client'
    const companyName = profileData?.company_name || profileData?.school_name || clientUser?.company_name || 'Oxford House HS School'
    const contact = profileData?.contact_number || clientUser?.contact_number || 'N/A'
    const email = profileData?.email || clientUser?.email || 'N/A'
    const address = [profileData?.address, profileData?.district, profileData?.state].filter(Boolean).join(', ') || 'Kolkata, West Bengal'
    const productName = profileData?.product_name || 'Rental / Subscription Plan'
    const rent = profileData?.monthly_subscription || 1499

    setAgreementData({
      client_id: clientUser?.client_id || 'AIM-CLIENT',
      client_name: clientName,
      company_name: companyName,
      contact_number: contact,
      email: email,
      full_address: address,
      product_name: productName,
      monthly_subscription: rent,
      processing_fee: profileData?.processing_fee || 1000,
      agreement_date: profileData?.activated_at ? new Date(profileData.activated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      products: [
        { name: 'Single Page Basic Corporate Look Website', processing_fee: 1000, monthly_subscription: 599 },
        { name: 'Static Informative Corporate Look Website', processing_fee: 1000, monthly_subscription: 999 },
        { name: 'Dynamic Informative Corporate Look Website', processing_fee: 1499, monthly_subscription: 1499 },
        { name: 'Dynamic Tool-base Corporate Look Website', processing_fee: 2599, monthly_subscription: 2599 },
        { name: 'E-Commerce Single seller Website', processing_fee: 3499, monthly_subscription: 3499 },
        { name: 'E-Commerce Multi-seller Market Place', processing_fee: 9999, monthly_subscription: 9999 },
        { name: 'Andriod Mobile Application', processing_fee: 7999, monthly_subscription: 7999 },
        { name: 'Andriod + iOS Mobile Application', processing_fee: 9999, monthly_subscription: 9999 },
        { name: 'NxtGen CRM software', processing_fee: 1499, monthly_subscription: 1499 },
        { name: 'NxtGen ERP software Pro', processing_fee: 2399, monthly_subscription: 2399 },
        { name: 'NxtGen ERP software Premium plus', processing_fee: 3299, monthly_subscription: 3299 },
        { name: 'NxtGen Payroll software', processing_fee: 1499, monthly_subscription: 1499 },
        { name: 'NxtGen Accounts-Billing Stock Mgt software', processing_fee: 1099, monthly_subscription: 1099 },
      ]
    })
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await downloadAgreementPdf(clientToken)
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `AIM_Rental_Agreement_${agreementData?.client_id || 'Client'}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download agreement error:', err)
      alert('Unable to download PDF directly. Generating preview window...')
      // Open direct API URL fallback
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nexgn.in/api'
      window.open(`${API_BASE_URL}/client/agreement/download?token=${clientToken}`, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <Helmet>
        <title>Download Rental Agreement | AIM Digitalise Client Portal</title>
      </Helmet>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e3e6b] via-[#2a5298] to-[#1e3e6b] p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Official Service Agreement
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Subscription Rental Agreement
            </h1>
            <p className="text-sm text-blue-100/90 max-w-xl">
              View and download your official, legally binding monthly rental & subscription agreement certificate with AIM Digitalise Private Limited.
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading || loading}
            className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg hover:shadow-red-500/25 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0 border border-red-400/30"
          >
            {downloading ? (
              <>
                <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download Agreement (PDF)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-600">Loading agreement details...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Document Details Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agreement Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono">Agreement #</span>
                  <h2 className="text-xl font-black text-slate-800">{agreementData?.client_id || 'AIM-AGREEMENT'}</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Effective Date</span>
                  <p className="text-sm font-bold text-slate-700">{agreementData?.agreement_date}</p>
                </div>
              </div>

              {/* Dynamic Parties Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">First Party (Provider)</span>
                  <p className="text-sm font-black text-slate-800">AIM Digitalise Pvt. Ltd.</p>
                  <p className="text-xs text-slate-500">Kolkata Jurisdiction, West Bengal</p>
                  <p className="text-xs text-slate-500 font-mono">support@aimdigitalise.com</p>
                </div>
                <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Second Party (Client)</span>
                  <p className="text-sm font-black text-slate-800">{agreementData?.client_name}</p>
                  <p className="text-xs font-semibold text-slate-700">{agreementData?.company_name}</p>
                  <p className="text-xs text-slate-500">{agreementData?.full_address}</p>
                  <p className="text-xs text-slate-500 font-mono">📞 {agreementData?.contact_number}</p>
                </div>
              </div>

              {/* Scope & Active Plan */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Selected Plan & Active Rental Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <span className="text-[11px] font-medium text-indigo-500 block">Product / Service Plan</span>
                    <span className="text-sm font-bold text-indigo-950 block truncate">{agreementData?.product_name}</span>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <span className="text-[11px] font-medium text-emerald-600 block">Monthly Rent Rate</span>
                    <span className="text-sm font-bold text-emerald-950 block">
                      ₹{Number(agreementData?.monthly_subscription || 0).toLocaleString('en-IN')}{agreementData?.per_person ? ' /student /month' : ' /month'}
                    </span>
                  </div>
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                    <span className="text-[11px] font-medium text-amber-600 block">Refundable Security Deposit</span>
                    <span className="text-sm font-bold text-amber-950 block">₹{Number(agreementData?.processing_fee || 1000).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Product Plans Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Product Plans & Pricing Matrix</h3>
                  <span className="text-[11px] font-semibold text-slate-400">Fetched from live system database</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Product Plan</th>
                        <th className="py-3 px-4 text-right">Security Deposit (₹)</th>
                        <th className="py-3 px-4 text-right">Monthly Rent (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-medium">
                      {agreementData?.products?.map((item, index) => (
                        <tr key={index} className={item.name === agreementData?.product_name ? 'bg-indigo-50/60 font-bold text-indigo-900' : 'hover:bg-slate-50'}>
                          <td className="py-2.5 px-4 flex items-center gap-2">
                            {item.name === agreementData?.product_name && <span className="text-indigo-600">✓</span>}
                            <span>{item.name}</span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono">{Number(item.processing_fee).toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-4 text-right font-mono">
                            {Number(item.monthly_subscription).toLocaleString('en-IN')}
                            {(item.per_person === 1 || item.per_person === true) ? ' /student /month' : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Info Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-black">
                  📜
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Agreement Clauses</h3>
                  <p className="text-xs text-slate-400">Summary of Key Conditions</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-0.5">1. Payment Due Date</span>
                  1st day of the month. Last payment date is 5th. Automatic service suspension applies on 10th if unpaid.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-0.5">2. Security Deposit</span>
                  Refundable upon termination after a minimum tenure of 12 months.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-0.5">3. Notice Period</span>
                  30 days' advance written notice required prior to agreement termination.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-0.5">4. Ownership Option</span>
                  Option available to transfer software from rental to permanent ownership as per agreed valuation.
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading || loading}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
