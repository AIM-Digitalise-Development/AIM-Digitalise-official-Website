import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import PayoutChart from '../../components/partner/payouts/PayoutChart'
import PayoutHistory from '../../components/partner/payouts/PayoutHistory'
import WithdrawForm from '../../components/partner/payouts/WithdrawForm'
import BankAccountForm from '../../components/partner/payouts/BankAccountForm'
import { usePartnerAuthStore } from '../../store/partnerAuthStore'

const INITIAL_PAYOUTS = [
  { id: 'PAY-8921', date: '30 May 2026', amount: '₹9,800', method: 'Bank Transfer', status: 'Paid' },
  { id: 'PAY-8920', date: '15 May 2026', amount: '₹12,400', method: 'Bank Transfer', status: 'Paid' },
  { id: 'PAY-8919', date: '30 Apr 2026', amount: '₹7,200', method: 'Bank Transfer', status: 'Paid' },
  { id: 'PAY-8918', date: '15 Apr 2026', amount: '₹11,500', method: 'Bank Transfer', status: 'Paid' },
  { id: 'PAY-8917', date: '30 Mar 2026', amount: '₹6,400', method: 'Bank Transfer', status: 'Paid' }
]

const PartnerPayouts = () => {
  const { payouts, setPayouts, payoutBalance, setPayoutBalance } = usePartnerAuthStore()

  // Initialize store if null
  useEffect(() => {
    if (!payouts) {
      setPayouts(INITIAL_PAYOUTS)
    }
    if (payoutBalance === null) {
      setPayoutBalance(5200)
    }
  }, [payouts, payoutBalance, setPayouts, setPayoutBalance])

  const currentPayouts = payouts || INITIAL_PAYOUTS
  const currentBalance = payoutBalance ?? 5200

  const handleWithdrawalRequest = (amountSubmitted) => {
    // Reduce balance
    setPayoutBalance(currentBalance - amountSubmitted)
    // Add to payout history as pending
    const newRequest = {
      id: `PAY-REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: `₹${amountSubmitted.toLocaleString()}`,
      method: 'Bank Transfer',
      status: 'Processing'
    }
    setPayouts([newRequest, ...currentPayouts])
  }

  // Calculate statistics
  const totalPaid = currentPayouts
    .filter(p => p.status === 'Paid')
    .reduce((acc, curr) => acc + parseInt(curr.amount.replace(/[^\d]/g, '')), 0)
  
  const pendingClearances = currentPayouts
    .filter(p => p.status === 'Processing')
    .reduce((acc, curr) => acc + parseInt(curr.amount.replace(/[^\d]/g, '')), 0)

  return (
    <>
      <Helmet>
        <title>Payouts & Payout Methods | AIM Partner</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white">Payout Management</h1>
          <p className="text-aim-copy-muted text-xs mt-1">
            Request withdrawals, link bank accounts, and view historical transaction receipts.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Total Withdrawn</span>
            <p className="text-2xl font-black text-white mt-1">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Processing Clearance</span>
            <p className="text-2xl font-black text-yellow-400 mt-1">
              {pendingClearances > 0 ? `₹${pendingClearances.toLocaleString()}` : '₹0'}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-aim-navy-light/40 p-4">
            <span className="text-[10px] text-aim-copy-muted uppercase tracking-wider block">Withdrawal Balance</span>
            <p className="text-2xl font-black text-aim-gold mt-1">₹{currentBalance.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart & History */}
          <div className="lg:col-span-2 space-y-6">
            <PayoutChart />
            <PayoutHistory payouts={currentPayouts} />
          </div>

          {/* Right Column - Forms */}
          <div className="space-y-6">
            {/* Withdraw form wrapper */}
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

            {/* Bank account form wrapper */}
            <div className="rounded-2xl border border-white/10 bg-aim-navy-card/60 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-black text-white">Bank Account Configuration</h3>
                <p className="text-[10px] text-aim-copy-muted mt-0.5">Manage details for automated bank transfers.</p>
              </div>
              <BankAccountForm />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PartnerPayouts