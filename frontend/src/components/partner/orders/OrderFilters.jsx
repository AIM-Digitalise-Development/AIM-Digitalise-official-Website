import { useState } from 'react'

const OrderFilters = ({ onFilterChange }) => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  const handleSearch = (val) => {
    setSearch(val)
    onFilterChange({ search: val, status })
  }

  const handleStatus = (val) => {
    setStatus(val)
    onFilterChange({ search, status: val })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Bar */}
      <div className="relative flex-1">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-aim-copy-muted">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by Order ID or Client Name..."
          className="w-full bg-aim-navy-light/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-aim-copy-muted focus:outline-none focus:border-aim-gold/60 focus:ring-1 focus:ring-aim-gold/30 transition-all"
        />
      </div>

      {/* Status Selector */}
      <div className="w-full sm:w-48">
        <select
          value={status}
          onChange={(e) => handleStatus(e.target.value)}
          className="w-full bg-aim-navy-light/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-aim-gold/60 focus:ring-1 focus:ring-aim-gold/30 transition-all"
        >
          <option value="All" className="bg-aim-navy">All Statuses</option>
          <option value="Active" className="bg-aim-navy">Active</option>
          <option value="Pending" className="bg-aim-navy">Pending</option>
          <option value="Completed" className="bg-aim-navy">Completed</option>
          <option value="Cancelled" className="bg-aim-navy">Cancelled</option>
        </select>
      </div>
    </div>
  )
}

export default OrderFilters