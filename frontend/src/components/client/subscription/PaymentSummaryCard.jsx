const PaymentSummaryCard = ({ calculatedAmount, processingPayment, onPaymentSubmit }) => {
  if (!calculatedAmount) return null

  const { calculation, breakdown } = calculatedAmount

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #ebedf0' }}>
      <div className="p-5 space-y-5">
        <div style={{ borderBottom: '1px solid #ebedf0', paddingBottom: '12px' }}>
          <h3 className="text-[13px] font-bold text-gray-800">Payment Invoice Summary</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Review your breakdown before proceeding to checkout.
          </p>
        </div>

        {/* Calculation Table */}
        <div className="space-y-2.5 text-[12px]">
          <div className="flex justify-between items-center text-gray-400">
            <span>ERP Student Enrollment</span>
            <strong className="text-gray-700">{calculation?.student_count} students</strong>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span>Base Monthly Subscription</span>
            <strong className="text-gray-700">₹{calculation?.base_monthly_amount?.toLocaleString()}</strong>
          </div>
          
          {(calculation?.discount_percentage > 0) && (
            <div className="flex justify-between items-center text-gray-400">
              <span>Cycle Discount ({calculation?.discount_percentage}%)</span>
              <strong className="text-emerald-500">
                -₹{((calculation?.base_monthly_amount || 0) - (calculation?.discounted_monthly_amount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
          )}

          <div className="flex justify-between items-center text-gray-400">
            <span>Discounted Monthly Rate</span>
            <strong className="text-gray-700">₹{calculation?.discounted_monthly_amount?.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span>Billing Interval</span>
            <strong className="text-gray-700 capitalize">{calculation?.cycle} ({calculation?.multiplier} Months)</strong>
          </div>
          
          <div style={{ borderTop: '1px solid #ebedf0', margin: '6px 0' }} />

          <div className="flex justify-between items-center text-gray-400">
            <span>Interval Subtotal</span>
            <strong className="text-gray-700">₹{calculation?.subtotal?.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span>CGST/SGST ({calculation?.gst_percentage}%)</span>
            <strong style={{ color: '#1a6b54' }}>₹{calculation?.gst_amount?.toLocaleString()}</strong>
          </div>

          {/* Grand Total */}
          <div className="p-4 rounded-lg flex justify-between items-center mt-2" style={{ background: '#f5f6fa', border: '1px solid #ebedf0' }}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Total (incl. GST)
            </span>
            <strong className="text-xl font-bold text-gray-800">
              ₹{calculation?.total_amount?.toLocaleString()}
            </strong>
          </div>

          {calculation?.savings > 0 && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-between text-[11px] font-semibold">
              <span>💰 Net Term Savings</span>
              <span>Save ₹{calculation?.savings?.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Formula Breakdown */}
        {breakdown && (
          <div className="p-4 rounded-lg text-left space-y-1 font-mono text-[10px] text-gray-400" style={{ background: '#f5f6fa', border: '1px solid #ebedf0' }}>
            <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-gray-600 mb-2">Formula Breakdown</p>
            <p className="truncate"><span className="text-gray-600">Rate:</span> {breakdown.formula}</p>
            <p className="truncate"><span className="text-gray-600">Discount:</span> {breakdown.with_discount}</p>
            <p className="truncate"><span className="text-gray-600">Subtotal:</span> {breakdown.subtotal}</p>
            <p className="truncate"><span className="text-gray-600">Tax:</span> {breakdown.gst}</p>
            <p className="text-gray-700 font-bold truncate mt-1.5 pt-1.5 text-[11px]" style={{ borderTop: '1px solid #ebedf0' }}>
              {breakdown.total_for_cycle}
            </p>
          </div>
        )}

        {/* Pay Button */}
        <button
          type="button"
          onClick={onPaymentSubmit}
          disabled={processingPayment}
          className="w-full py-3 rounded-lg text-white font-bold text-[13px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90 active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, #1a3c5e 0%, #2a6f97 100%)' }}
        >
          {processingPayment ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Securing Checkout...
            </span>
          ) : (
            `Proceed to Pay ₹${calculation?.total_amount?.toLocaleString()}`
          )}
        </button>
      </div>
    </div>
  )
}

export default PaymentSummaryCard
