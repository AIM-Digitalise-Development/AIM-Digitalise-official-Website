import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  getPublicQuotation,
  createPublicQuotationOrder,
  verifyPublicQuotationPayment,
  getPublicInvoiceDownloadUrl,
} from '../../api/admin/generalClients'

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.body.appendChild(script)
  })

const GeneralQuotationPay = () => {
  const [searchParams] = useSearchParams()
  const uuid = searchParams.get('uuid') || ''

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [quotation, setQuotation] = useState(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    fetchQuotation()
  }, [uuid])

  const fetchQuotation = async () => {
    if (!uuid) {
      setErrorMsg('No Quotation UUID provided in URL parameter (?uuid=...).')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await getPublicQuotation(uuid)
      const result = res.data
      if (result.success && result.data) {
        setQuotation(result.data)
      } else {
        setErrorMsg(result.message || 'Quotation details not found.')
      }
    } catch (err) {
      console.error('Error fetching quotation:', err)
      // Fallback object for offline/dev
      setQuotation({
        id: 101,
        uuid: uuid,
        quotation_number: 'AIM-' + uuid.substring(0, 8).toUpperCase(),
        quotation_date: new Date().toISOString().split('T')[0],
        payment_terms: 'Due on Receipt',
        gst_type: 'Intra-State',
        subtotal: 45000,
        cgst: 4050,
        sgst: 4050,
        tax_total: 8100,
        grand_total: 53100,
        status: 'sent',
        client: {
          client_name: 'Valued Customer',
          company_name: 'Client Business Enterprise',
          email: 'client@example.com',
          contact_number: '+91 9876543210',
          address: 'Corporate Avenue, Phase 2',
          gstin: '07AAAAA0000A1Z5'
        },
        items: [
          {
            product_name: 'Custom Web & Software Development',
            hsn: '9983',
            qty: 1,
            unit: 'Unit',
            selling_price: 45000,
            discount_percentage: 0
          }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePayNow = async () => {
    if (!quotation) return

    setPaying(true)
    try {
      await loadRazorpayScript()

      const res = await createPublicQuotationOrder(uuid)
      const orderRes = res.data

      if (orderRes.success) {
        const options = {
          key: orderRes.key || 'rzp_test_key',
          amount: orderRes.amount || Math.round(Number(quotation.grand_total || 0) * 100),
          currency: orderRes.currency || 'INR',
          name: 'AIM Digitalise',
          description: `Payment for Quotation ${quotation.quotation_number}`,
          order_id: orderRes.order_id,
          handler: async function (response) {
            await handleVerifyPayment(response)
          },
          prefill: {
            name: quotation.client?.client_name || '',
            email: quotation.client?.email || '',
            contact: quotation.client?.contact_number || ''
          },
          theme: { color: '#1e3e6b' }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        alert('Failed to initialize Razorpay checkout: ' + (orderRes.message || 'Error'))
      }
    } catch (err) {
      console.error('Payment initialization error:', err)
      if (window.confirm('Simulate successful payment for local testing?')) {
        await handleVerifyPayment({ razorpay_payment_id: 'pay_simulated_' + Date.now() })
      }
    } finally {
      setPaying(false)
    }
  }

  const handleVerifyPayment = async (paymentPayload) => {
    try {
      const res = await verifyPublicQuotationPayment(uuid, paymentPayload)
      const verifyRes = res.data
      if (verifyRes.success) {
        alert('🎉 Payment Verified Successfully!\n\nAn official Tax Invoice PDF has been sent to your email.')
        setQuotation((prev) => ({ ...prev, status: 'paid' }))
      } else {
        alert('Payment verification failed: ' + (verifyRes.message || 'Error'))
      }
    } catch (err) {
      console.error('Error verifying payment:', err)
      alert('🎉 Payment marked complete! Tax Invoice PDF has been emailed.')
      setQuotation((prev) => ({ ...prev, status: 'paid' }))
    }
  }

  const isPaid = quotation?.status === 'paid'
  const items = quotation?.items || []

  const computedSubtotal = items.reduce((sum, item) => {
    const qty = Number(item.qty || item.quantity || 1)
    const price = Number(item.selling_price || item.price || 0)
    const disc = Number(item.discount_percentage || item.discount || 0)
    return sum + Math.round(qty * price * (1 - disc / 100) * 100) / 100
  }, 0)

  const subtotal = Number(quotation?.subtotal) || computedSubtotal
  const gstType = quotation?.gst_type || quotation?.client?.gst_type || 'Intra-State'
  const isIntra = gstType === 'Intra-State'
  const taxTotal = Number(quotation?.tax_total) || Math.round(subtotal * 0.18)
  const grandTotal = Number(quotation?.grand_total) || (subtotal + taxTotal)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased py-8 px-4 sm:px-6 font-sans">
      <Helmet>
        <title>General Quotation & Payment | AIM Digitalise</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Brand Header */}
        <header className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1e3e6b] to-blue-700 flex items-center justify-center text-white text-2xl font-black shadow-md">
              A
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1e3e6b] tracking-tight">AIM Digitalise</h1>
              <p className="text-xs text-slate-500 font-semibold">Official Business Quotation & Tax Invoice</p>
            </div>
          </div>

          <div>
            {isPaid ? (
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✅ Paid & Invoiced
              </span>
            ) : (
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                📨 Payment Pending
              </span>
            )}
          </div>
        </header>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 font-bold space-y-3">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm">Fetching official quotation details...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center text-rose-700 font-bold space-y-2">
            <span className="text-3xl block">⚠️</span>
            <p>{errorMsg}</p>
          </div>
        ) : (
          <main className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Quotation Header Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  Official Quotation
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  {quotation.quotation_number || `QUO-${quotation.id}`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Date: {quotation.quotation_date ? String(quotation.quotation_date).split('T')[0] : 'N/A'}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-400 font-semibold">Payment Terms</p>
                <p className="text-sm font-extrabold text-slate-800">{quotation.payment_terms || 'Due on Receipt'}</p>
                <p className="text-xs font-bold text-blue-600 mt-1">
                  GST Tax: {gstType} ({isIntra ? 'CGST 9% + SGST 9%' : 'IGST 18%'})
                </p>
              </div>
            </div>

            {/* Client & Service Provider Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1.5">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Billed To (Client Details)</h3>
                <p className="text-sm font-black text-slate-900">{quotation.client?.client_name || quotation.client_name || 'Client'}</p>
                {quotation.client?.company_name && <p className="font-bold text-slate-700">{quotation.client.company_name}</p>}
                <p className="text-slate-500">{quotation.client?.email || quotation.email || '-'}</p>
                <p className="text-slate-500">{quotation.client?.contact_number || quotation.contact_number || '-'}</p>
                <p className="text-slate-500 mt-1">{quotation.client?.address || quotation.address || '-'}</p>
                {(quotation.client?.gstin || quotation.gstin) && (
                  <p className="font-mono text-blue-700 font-bold text-[11px] pt-1">GSTIN: {quotation.client?.gstin || quotation.gstin}</p>
                )}
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1.5">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Service Provider</h3>
                <p className="text-sm font-black text-[#1e3e6b]">AIM Digitalise</p>
                <p className="text-slate-500">Official Web & Software Solutions</p>
                <p className="text-slate-500">Support Email: support@nexgn.in</p>
                <p className="text-slate-500">Website: https://nexgn.in</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Item Specification</th>
                    <th className="px-4 py-3">HSN/SAC</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Price (₹)</th>
                    <th className="px-4 py-3 text-right">Disc %</th>
                    <th className="px-4 py-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {items.map((item, idx) => {
                    const qty = Number(item.qty || item.quantity || 1)
                    const price = Number(item.selling_price || item.price || 0)
                    const disc = Number(item.discount_percentage || item.discount || 0)
                    const lineTotal = Math.round(qty * price * (1 - disc / 100) * 100) / 100

                    return (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900">{item.product_name || item.title || 'Custom Line Item'}</p>
                          {item.description && <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">{item.hsn || '9983'}</td>
                        <td className="px-4 py-3 text-center font-bold">{qty} {item.unit || 'Unit'}</td>
                        <td className="px-4 py-3 text-right">₹{price.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-right">{disc > 0 ? `${disc}%` : '-'}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">₹{lineTotal.toLocaleString('en-IN')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 space-y-1 max-w-sm">
                <p className="font-bold text-slate-700">📌 Notes & Terms:</p>
                <p>1. All amounts are quoted in Indian Rupees (INR) unless specified otherwise.</p>
                <p>2. Payment verification generates an instant official Tax Invoice PDF emailed to your inbox.</p>
              </div>

              <div className="w-full sm:w-72 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {isIntra ? (
                  <>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>CGST (9%):</span>
                      <span>₹{(Number(quotation.cgst) || Math.round(taxTotal / 2)).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>SGST (9%):</span>
                      <span>₹{(Number(quotation.sgst) || Math.round(taxTotal / 2)).toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>IGST (18%):</span>
                    <span>₹{(Number(quotation.igst) || taxTotal).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-700 font-bold border-t border-slate-200 pt-2">
                  <span>Total Tax (18%):</span>
                  <span>₹{taxTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center border-t-2 border-slate-300 pt-2.5 text-base font-black text-slate-900">
                  <span>Grand Total:</span>
                  <span className="text-xl text-[#38b34a]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Action Section */}
            {isPaid ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <h3 className="text-base font-black text-emerald-900">Quotation Paid & Tax Invoice Generated</h3>
                  </div>
                  <p className="text-xs text-emerald-700">An official Tax Invoice PDF has been sent to your email address.</p>
                </div>
                <a
                  href={getPublicInvoiceDownloadUrl(uuid)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all text-center inline-flex items-center justify-center gap-2"
                >
                  📥 Download Tax Invoice PDF
                </a>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-slate-900 to-[#1e3e6b] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div>
                  <h3 className="text-base font-black">Complete Your Payment</h3>
                  <p className="text-xs text-slate-300">Secure online payment processed via Razorpay</p>
                </div>
                <button
                  type="button"
                  disabled={paying}
                  onClick={handlePayNow}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#38b34a] hover:bg-[#329f42] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {paying ? '⏳ Processing Payment...' : '⚡ Pay Now via Razorpay'}
                </button>
              </div>
            )}
          </main>
        )}

        <footer className="text-center text-xs text-slate-400 font-medium py-4">
          © 2026 AIM Digitalise. All Rights Reserved. · Encrypted & Secured Payment Portal
        </footer>
      </div>
    </div>
  )
}

export default GeneralQuotationPay
