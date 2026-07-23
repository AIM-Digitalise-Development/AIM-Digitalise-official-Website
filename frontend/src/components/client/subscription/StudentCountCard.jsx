import { motion } from 'framer-motion'

const StudentCountCard = ({ studentCount }) => {
  if (!studentCount) return null

  const unpaidCount = studentCount.min_students !== undefined
    ? Math.max(0, (studentCount.student_count || 0) - (studentCount.min_students || 0))
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #ebedf0' }}>
        <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#1a6b54' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#1a6b54' }} />
              Connected Database
            </span>
            <h3 className="text-[15px] font-bold text-gray-800 leading-tight">
              {studentCount.school_name || 'Organization Database'}
            </h3>
            <p className="text-[11px] text-gray-400 font-medium">
              Active student count synced from ERP backend
            </p>
          </div>
          
          <div className="text-left sm:text-right space-y-1">
            <div className="text-2xl font-bold text-gray-800 tracking-tight flex items-baseline gap-1.5 sm:justify-end">
              {studentCount.student_count || 0}
              <span className="text-[11px] text-gray-400 font-medium uppercase">Total Students</span>
            </div>
            {unpaidCount > 0 && (
              <div className="text-sm font-bold text-rose-600 tracking-tight flex items-baseline gap-1.5 sm:justify-end">
                {unpaidCount}
                <span className="text-[10px] text-rose-500 font-medium uppercase">Unpaid Students</span>
              </div>
            )}
            {studentCount.last_updated && (
              <p className="text-[10px] text-gray-400 font-mono">
                Updated: {new Date(studentCount.last_updated).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default StudentCountCard
