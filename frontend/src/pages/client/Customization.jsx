import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useClientAuthStore } from '../../store/clientAuthStore'
import { getClientCustomizationRequests, submitClientCustomizationRequest } from '../../api/clientPortal'

const ClientCustomization = () => {
  const { profileData, clientToken, isClientAuthenticated } = useClientAuthStore()
  const [customType, setCustomType] = useState('')
  const [customDesc, setCustomDesc] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [customRequests, setCustomRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  const fetchRequests = async () => {
    if (!isClientAuthenticated || !clientToken) return
    setLoadingRequests(true)
    setErrorMsg('')
    try {
      const res = await getClientCustomizationRequests(clientToken)
      if (res.success) {
        const processedRequests = (res.data?.requests || []).map(req => {
          let amountValue = null;
          if (req.amount) {
            amountValue = typeof req.amount === 'string' ? parseFloat(req.amount) : req.amount;
          } else if (req.amount_value) {
            amountValue = typeof req.amount_value === 'string' ? parseFloat(req.amount_value) : req.amount_value;
          }
          
          return {
            ...req,
            amount: amountValue,
            amount_value: amountValue,
            amount_formatted: amountValue ? `₹ ${amountValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null,
          };
        });
        setCustomRequests(processedRequests)
      } else {
        setErrorMsg(res.message || 'Failed to load customization requests.')
      }
    } catch (err) {
      console.error('Failed to load customizations:', err)
      setErrorMsg('Failed to load customization requests.')
    } finally {
      setLoadingRequests(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [clientToken, isClientAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customDesc.trim() || customDesc.length < 10) {
      setErrorMsg('Please enter at least 10 characters describing your customization needs.')
      return
    }
    
    setIsSubmitting(true)
    setSuccessMsg('')
    setErrorMsg('')
    
    // Combine fields into customization_text
    const combinedText = `[${customType}] (Target Rollout: ${targetDate})\n\n${customDesc}`
    
    try {
      const res = await submitClientCustomizationRequest(combinedText, clientToken)
      if (res.success) {
        setSuccessMsg('Your customization request has been successfully recorded. Our representative will contact you shortly.')
        setCustomType('')
        setCustomDesc('')
        setTargetDate('')
        await fetchRequests()
        setTimeout(() => setSuccessMsg(''), 6000)
      } else {
        setErrorMsg(res.message || 'Failed to submit customization request.')
      }
    } catch (err) {
      console.error('Failed to submit customization:', err)
      setErrorMsg('Failed to submit request: ' + (err?.response?.data?.message || err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  const parseCustomizationText = (text) => {
    if (!text) return { title: 'Custom Upgrade', description: '' }
    const match = text.match(/^\[(.*?)\]\s*(?:\(Target Rollout:\s*(.*?)\))?\s*\n*([\s\S]*)$/)
    if (match) {
      return {
        title: match[1],
        rollout: match[2] || '',
        description: match[3].trim()
      }
    }
    return { title: 'Custom Upgrade', description: text }
  }

  const getStatusDetails = (status) => {
    const details = {
      'pending': { text: 'Under Review', className: 'bg-amber-50 text-amber-600 border border-amber-100' },
      'amount_set': { text: 'Amount Set', className: 'bg-blue-50 text-blue-600 border border-blue-100' },
      'approved': { text: 'Approved', className: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
      'rejected': { text: 'Rejected', className: 'bg-rose-50 text-rose-600 border border-rose-100' }
    };
    return details[status?.toLowerCase()] || { text: status || 'Under Review', className: 'bg-amber-50 text-amber-600 border border-amber-100' };
  }

  const schoolName = profileData?.company_name || profileData?.school_name || profileData?.organization || 'Academic Institute'

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 select-none animate-fade-in text-slate-700" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Centered Page Header */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px] border-b border-slate-200/80">
        <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">Customizations</h1>

        <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0 select-none">
          <h2 className="text-lg font-extrabold text-[#1e3e6b] tracking-tight uppercase">
            {schoolName}
          </h2>
          <p className="text-xs font-bold text-slate-500">Academic Session: 2026-2027</p>
        </div>
        <div className="w-48 hidden md:block"></div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-600 animate-fade-in">
          ✅ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl text-xs font-bold bg-rose-50 border border-rose-200 text-rose-600 animate-fade-in">
          ❌ {errorMsg}
        </div>
      )}

      {/* Main Grid: Request form + History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Request Form (Col Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-md border border-slate-100 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Request Custom Upgrade</h3>
            <p className="text-[11px] text-slate-400">Request special website, features, or software additions.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1.5">
              <label className="text-slate-500 uppercase tracking-wide">Customization Title</label>
              <input
                type="text"
                required
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="e.g. Dedicated iOS App, Custom Domain Integration"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 uppercase tracking-wide">Expected Rollout Date</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 uppercase tracking-wide">Detailed Description</label>
              <textarea
                required
                rows="4"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Please describe your requirements, layout preferences, and workflow updates..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black rounded-xl shadow-md transition-colors active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </form>
        </div>

        {/* Requests History List (Col Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
          <div className="bg-slate-800 text-white font-black px-6 py-4.5 text-sm flex items-center gap-2">
            <span>⚙️</span> Customization Overview
          </div>
          
          <div className="overflow-x-auto">
            {loadingRequests ? (
              <div className="flex justify-center items-center py-20 bg-slate-50/10">
                <svg className="w-5 h-5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            ) : customRequests.length > 0 ? (
              <table className="w-full text-left border-collapse text-[11px] font-semibold">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Submitted</th>
                    <th className="px-5 py-4">Requested Service</th>
                    <th className="px-5 py-4">Quote Cost</th>
                    <th className="px-5 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {customRequests.map((req) => {
                    const parsed = parseCustomizationText(req.customization_text)
                    const statusObj = getStatusDetails(req.status)
                    const displayCost = req.amount_formatted || (req.cost ? `₹ ${req.cost}` : 'Pending Quote')

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-slate-500">#{req.id}</td>
                        <td className="px-5 py-4 font-sans text-slate-400">
                          {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN') : req.date || '—'}
                        </td>
                        <td className="px-5 py-4 max-w-[180px]">
                          <div className="font-bold text-slate-800 truncate">{parsed.title}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 font-sans">{parsed.description}</div>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600">{displayCost}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusObj.className}`}>
                            {statusObj.text}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-20 text-slate-400 bg-slate-50/30">
                <span className="text-3xl block">⚙️</span>
                <p className="font-bold mt-2 text-xs">No customizations requested yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}

export default ClientCustomization
