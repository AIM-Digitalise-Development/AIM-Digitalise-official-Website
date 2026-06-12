import { motion } from 'framer-motion'

const PaymentCyclesCard = ({ paymentCycles, selectedCycle, onCycleChange }) => {
  if (!paymentCycles || !paymentCycles.cycles) return null

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #ebedf0' }}>
      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-[13px] font-bold text-gray-800">Select Billing Cycle</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Choose a longer billing cycle for additional discounts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(paymentCycles.cycles).map(([cycle, data]) => {
            const isSelected = selectedCycle === cycle

            return (
              <motion.div
                key={cycle}
                onClick={() => onCycleChange(cycle)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-lg transition-all duration-200 text-center cursor-pointer flex flex-col justify-between p-4"
                style={{
                  border: isSelected ? '2px solid #1a6b54' : '1px solid #ebedf0',
                  background: isSelected ? '#f0fdf9' : '#fafafa',
                }}
              >
                <div className="space-y-2">
                  <h4 className={`text-[13px] font-bold capitalize ${isSelected ? '' : 'text-gray-700'}`}
                    style={isSelected ? { color: '#1a6b54' } : {}}
                  >
                    {cycle} {data.multiplier > 1 && `(${data.multiplier} mo)`}
                  </h4>
                  
                  {data.discount > 0 ? (
                    <span className="inline-block text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
                      {data.discount}% OFF
                    </span>
                  ) : (
                    <span className="inline-block text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-400">
                      Base Rate
                    </span>
                  )}
                  
                  <div className="pt-1">
                    <span className="text-lg font-bold text-gray-800">₹{data.discounted_monthly?.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">/month</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 space-y-1 text-[11px] text-gray-400 text-left" style={{ borderTop: '1px solid #ebedf0' }}>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-gray-600 font-medium">₹{data.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span className="text-gray-600 font-medium">₹{data.gst_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 text-[12px] text-gray-800 mt-1" style={{ borderTop: '1px solid #ebedf0' }}>
                    <span>Total</span>
                    <span style={isSelected ? { color: '#1a6b54' } : {}}>
                      ₹{data.total?.toLocaleString()}
                    </span>
                  </div>
                  {data.savings > 0 && (
                    <div className="text-[10px] text-emerald-500 font-bold text-right pt-0.5">
                      Save ₹{data.savings?.toLocaleString()}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PaymentCyclesCard
