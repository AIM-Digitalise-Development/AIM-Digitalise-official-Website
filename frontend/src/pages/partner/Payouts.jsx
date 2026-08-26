import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import PayoutChart from '../../components/partner/payouts/PayoutChart'
import PayoutHistory from '../../components/partner/payouts/PayoutHistory'
import WithdrawForm from '../../components/partner/payouts/WithdrawForm'
import BankAccountForm from '../../components/partner/payouts/BankAccountForm'
import CommissionDetailsTable from '../../components/partner/payouts/CommissionDetailsTable'
import RankBadge from '../../components/partner/network/RankBadge'
import { getCommissionReport } from '../../api/partner'
import { usePartnerAuthStore } from '../../store/partnerAuthStore'

const INITIAL_PAYOUTS = [
  { id: 'PAY-8921', date: '30 May 2026', amount: '₹9,800', method: 'Bank Transfer', status: 'Paid' },
  { id: 'PAY-8920', date: '15 May 2026', amount: '₹12,400', method: 'Bank Transfer', status: 'Paid' },
  { id: 'PAY-8919', date: '30 Apr 2026', amount: '₹7,200', method: 'Bank Transfer', status: 'Paid' },
  { id: 'PAY-8918', date: '15 Apr 2026', amount: '₹11,500', method: 'Bank Transfer', status: 'Paid' },
  { id: 'PAY-8917', date: '30 Mar 2026', amount: '₹6,400', method: 'Bank Transfer', status: 'Paid' }
]

const PartnerPayouts = () => {
  const { 
    partnerUser,
    payouts, 
    setPayouts, 
    payoutBalance, 
    setPayoutBalance,
    commissionReport,
    setCommissionReport
  } = usePartnerAuthStore()

  const [loading, setLoading] = useState(!commissionReport)
  const [activeTab, setActiveTab] = useState('commissions') // 'commissions' | 'analytics' | 'payouts'

  const fetchCommissions = async () => {
    try {
      const res = await getCommissionReport()
      if (res.data?.success) {
        setCommissionReport(res.data.data)
      }
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommissions()

    if (!payouts) {
      setPayouts(INITIAL_PAYOUTS)
    }
    if (payoutBalance === null) {
      setPayoutBalance(5200)
    }
  }, [])

  const report = commissionReport || {
    partner_id: partnerUser?.partner_id || 'PIDIN26052',
    partner_name: partnerUser?.partner_name || partnerUser?.name || 'Partner',
    rank: partnerUser?.rank || 'master',
    total_sales: 13660.93,
    total_commission: 683.05,
    total_orders: 2,
    monthly_breakdown: [],
    commission_details: []
  }

  const currentPayouts = payouts || INITIAL_PAYOUTS
  const currentBalance = payoutBalance ?? 5200
  const partnerRank = report.rank || partnerUser?.rank || 'master'

  const handleWithdrawalRequest = (amountSubmitted) => {
    setPayoutBalance(currentBalance - amountSubmitted)
    const newRequest = {
      id: `PAY-REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: `₹${amountSubmitted.toLocaleString()}`,
      method: 'Bank Transfer',
      status: 'Processing'
    }
    setPayouts([newRequest, ...currentPayouts])
  }

  const totalPaid = currentPayouts
    .filter(p => p.status === 'Paid')
    .reduce((acc, curr) => acc + parseInt(curr.amount.replace(/[^\d]/g, '')), 0)

  return (
    <>
      <Helmet>
        <title>Commissions & Payouts | AIM Partner</title>
      </Helmet>

      <div className="space-y-6 pb-12">
        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-white">Commissions & Payouts</h1>
              <RankBadge rank={partnerRank} size="sm" />
            </div>
            <p className="text-aim-copy-muted text-xs mt-1">
              Real-time downline commission calculation, monthly sales breakdown, and payout withdrawals.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl self-start sm:self-center">
            <span className="text-aim-copy-muted font-sans font-semibold">Partner ID:</span>
            <span className="text-aim-gold font-bold">{report.partner_id || partnerUser?.partner_id || '—'}</span>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Net Commission */}
          <div className="rounded-2xl border border-emerald-500/30 bg-[#131722]/80 backdrop-blur-md p-4 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider font-bold">Net Commission Earned</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Lifetime
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              ₹{Number(report.total_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Calculated override earnings</p>
          </div>

          {/* Card 2: Total Downline Sales Volume */}
          <div className="rounded-2xl border border-purple-500/30 bg-[#131722]/80 backdrop-blur-md p-4 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider font-bold">Downline Sales Volume</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                Gross
              </span>
            </div>
            <p className="text-2xl font-black text-white mt-1">
              ₹{Number(report.total_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Sum of downline subscriptions</p>
          </div>

          {/* Card 3: Total Paid Cycles / Orders */}
          <div className="rounded-2xl border border-blue-500/30 bg-[#131722]/80 backdrop-blur-md p-4 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider font-bold">Commissioned Cycles</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                Orders
              </span>
            </div>
            <p className="text-2xl font-black text-white mt-1">
              {report.total_orders || 0}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Total active billing cycles</p>
          </div>

          {/* Card 4: Available Withdrawal Balance */}
          <div className="rounded-2xl border border-aim-gold/30 bg-[#131722]/80 backdrop-blur-md p-4 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 rounded-full bg-aim-gold/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider font-bold">Withdrawal Balance</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-aim-gold/10 text-aim-gold border border-aim-gold/20 font-bold">
                Available
              </span>
            </div>
            <p className="text-2xl font-black text-aim-gold mt-1">
              ₹{currentBalance.toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Ready for bank transfer</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-[#131722] border border-white/10 self-start w-fit">
          <button
            onClick={() => setActiveTab('commissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'commissions'
                ? 'bg-aim-gold text-aim-navy shadow-md shadow-aim-gold/20'
                : 'text-aim-copy-muted hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 112-2h2a2 2 0 012 2" />
            </svg>
            Commission Breakdown ({report.commission_details?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-aim-gold text-aim-navy shadow-md shadow-aim-gold/20'
                : 'text-aim-copy-muted hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Monthly Trajectory
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'payouts'
                ? 'bg-aim-gold text-aim-navy shadow-md shadow-aim-gold/20'
                : 'text-aim-copy-muted hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Request Payout & Bank
          </button>
        </div>

        {/* Tab 1: Detailed Commission Ledger */}
        {activeTab === 'commissions' && (
          <CommissionDetailsTable 
            commissionDetails={report.commission_details || []} 
            myRank={partnerRank} 
          />
        )}

        {/* Tab 2: Monthly Aggregate Trajectory Chart */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <PayoutChart monthlyBreakdown={report.monthly_breakdown || []} />

            {/* Monthly Aggregate Table */}
            {report.monthly_breakdown && report.monthly_breakdown.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#131722]/80 backdrop-blur-md overflow-hidden p-5">
                <h3 className="text-sm font-black text-white mb-3">Monthly Commission Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-aim-copy-muted font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Billing Month</th>
                        <th className="py-3 px-4 text-center">Paid Cycles</th>
                        <th className="py-3 px-4 text-right">Total Downline Sales</th>
                        <th className="py-3 px-4 text-right">Commission Earned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/90">
                      {report.monthly_breakdown.map((mb, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-aim-gold">{mb.month}</td>
                          <td className="py-3.5 px-4 text-center font-bold">{mb.order_count || 0}</td>
                          <td className="py-3.5 px-4 text-right font-medium">₹{Number(mb.total_sales || 0).toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-4 text-right font-black text-emerald-400">₹{Number(mb.commission || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Withdrawals & Bank Configuration */}
        {activeTab === 'payouts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - History */}
            <div className="lg:col-span-2 space-y-6">
              <PayoutHistory payouts={currentPayouts} />
            </div>

            {/* Right Column - Forms */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-aim-navy-card/60 p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white">Request Payout</h3>
                  <p className="text-[10px] text-aim-copy-muted mt-0.5">Transfer your commissions directly to bank account.</p>
                </div>
                <WithdrawForm 
                  availableBalance={currentBalance} 
                  onWithdrawSubmitted={handleWithdrawalRequest} 
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-aim-navy-card/60 p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white">Bank Account Configuration</h3>
                  <p className="text-[10px] text-aim-copy-muted mt-0.5">Manage details for automated bank transfers.</p>
                </div>
                <BankAccountForm />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default PartnerPayouts