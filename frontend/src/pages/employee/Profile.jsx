import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getEmployeeProfile, updateEmployeeProfile } from '../../api/employee'
import { useAuth } from '../../hooks/useAuth'

const EmployeeProfile = () => {
  const { updateUser } = useAuth()
  
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    phone: '',
    alternate_phone: '',
    current_address: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: '',
  })
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await getEmployeeProfile()
      if (res.data?.success) {
        const profileData = res.data.data
        setProfile(profileData)
        // Set form details
        setEditForm({
          phone: profileData.phone || '',
          alternate_phone: profileData.alternate_phone || '',
          current_address: profileData.current_address || '',
          bank_name: profileData.bank_name || '',
          account_number: profileData.account_number || '',
          ifsc_code: profileData.ifsc_code || '',
          upi_id: profileData.upi_id || '',
        })
        // Sync full_name etc. back to AuthStore if changed
        updateUser({
          full_name: profileData.full_name,
          email: profileData.email,
        })
      } else {
        setError('Failed to fetch profile details.')
      }
    } catch (err) {
      console.error('Error fetching employee profile:', err)
      setError(err?.response?.data?.message || 'Could not retrieve employee profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setEditError('')
      const res = await updateEmployeeProfile(editForm)
      if (res.data?.success) {
        setSuccess('Profile updated successfully!')
        setIsEditOpen(false)
        fetchProfile() // Reload details
        setTimeout(() => setSuccess(''), 4000)
      } else {
        setEditError('Update failed. Please check inputs.')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setEditError(err?.response?.data?.message || 'Could not update profile on server.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <svg className="w-10 h-10 animate-spin text-[#38b34a]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Loading employee profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6 bg-[#1a1d2b] rounded-2xl border border-white/5 shadow-xl text-center">
        <span className="inline-flex p-4 rounded-full bg-red-500/10 text-red-500 mb-4 text-2xl">⚠️</span>
        <h3 className="text-base font-black text-white">Connection Error</h3>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{error}</p>
        <button
          onClick={fetchProfile}
          className="mt-6 px-5 py-2.5 bg-[#38b34a] hover:bg-[#38b34a]/85 text-black rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  const detailLabelClass = "text-[10px] font-black text-gray-500 uppercase tracking-widest"
  const detailValClass = "text-xs font-bold text-gray-200 mt-1"

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none animate-fade-in text-gray-400 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-3 text-left">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Employee Profile</h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">Review your personal records, job metadata, and financial accounts.</p>
        </div>
        <button
          onClick={() => setIsEditOpen(true)}
          className="px-4 py-2 bg-[#38b34a] text-black hover:bg-[#38b34a]/85 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          ✏️ Edit Profile Info
        </button>
      </div>

      {success && (
        <div className="p-3.5 bg-green-500/10 border border-green-500/20 text-[#38b34a] rounded-xl text-xs font-bold text-center animate-fade-in">
          {success}
        </div>
      )}

      {/* Grid containing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Basic Personal Card */}
        <div className="bg-[#1a1d2b] rounded-2xl border border-white/5 shadow-sm p-6 space-y-5 md:col-span-1 text-left">
          <div className="text-center pb-5 border-b border-white/5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#38b34a] to-[#22d3ee] text-white flex items-center justify-center text-3xl font-black mx-auto shadow-md">
              {(profile.full_name || 'E').charAt(0).toUpperCase()}
            </div>
            <h2 className="text-base font-black text-white mt-4 leading-none">{profile.full_name}</h2>
            <p className="text-[11px] text-gray-500 font-bold tracking-wider uppercase mt-1">ID: {profile.employee_id}</p>
            <span className="mt-3.5 inline-flex text-[9px] font-black uppercase tracking-wider bg-green-400/10 text-green-400 border border-green-400/20 rounded-md px-2 py-0.5 select-none">
              {profile.employment_status || 'Active'}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <p className={detailLabelClass}>Primary Email</p>
              <p className="text-xs font-bold text-[#38b34a] truncate mt-1">{profile.email}</p>
            </div>
            <div>
              <p className={detailLabelClass}>Primary Mobile</p>
              <p className={detailValClass}>{profile.phone || 'N/A'}</p>
            </div>
            <div>
              <p className={detailLabelClass}>Alternate Phone</p>
              <p className={detailValClass}>{profile.alternate_phone || 'N/A'}</p>
            </div>
            <div>
              <p className={detailLabelClass}>Office Timings</p>
              <p className="text-xs font-bold text-gray-300 mt-1 font-mono">
                {profile.office_start_time} - {profile.office_end_time}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Records Container */}
        <div className="md:col-span-2 space-y-6 text-left">
          
          {/* Detailed Info Card */}
          <div className="bg-[#1a1d2b] rounded-2xl border border-white/5 shadow-sm p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-3 mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className={detailLabelClass}>First Name</p>
                <p className={detailValClass}>{profile.first_name || 'N/A'}</p>
              </div>
              <div>
                <p className={detailLabelClass}>Last Name</p>
                <p className={detailValClass}>{profile.last_name || 'N/A'}</p>
              </div>
              <div>
                <p className={detailLabelClass}>Date of Birth</p>
                <p className={detailValClass}>{profile.dob || 'N/A'}</p>
              </div>
              <div>
                <p className={detailLabelClass}>Gender</p>
                <p className={`${detailValClass} capitalize`}>{profile.gender || 'N/A'}</p>
              </div>
              <div>
                <p className={detailLabelClass}>Aadhar Number</p>
                <p className={detailValClass}>{profile.aadhar_number || 'N/A'}</p>
              </div>
              <div>
                <p className={detailLabelClass}>PAN Number</p>
                <p className={detailValClass}>{profile.pan_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Job and Contract info */}
          <div className="bg-[#1a1d2b] rounded-2xl border border-white/5 shadow-sm p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-3 mb-4">Employment & Career</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className={detailLabelClass}>Department</p>
                <p className={detailValClass}>{profile.department?.name || 'N/A'}</p>
              </div>
              <div>
                <p className={detailLabelClass}>Designation</p>
                <p className={detailValClass}>{profile.designation?.name || 'N/A'}</p>
              </div>
              <div>
                <p className={detailLabelClass}>Joining Date</p>
                <p className={detailValClass}>{profile.joining_date || 'N/A'}</p>
              </div>
              <div>
                <p className={detailLabelClass}>Confirmation Date</p>
                <p className={detailValClass}>{profile.confirmation_date || 'N/A'}</p>
              </div>
              {profile.last_company_name && (
                <>
                  <div>
                    <p className={detailLabelClass}>Last Company</p>
                    <p className={detailValClass}>{profile.last_company_name}</p>
                  </div>
                  <div>
                    <p className={detailLabelClass}>Last Designation</p>
                    <p className={detailValClass}>{profile.last_company_designation}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Addressing & Banks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Address Info */}
            <div className="bg-[#1a1d2b] rounded-2xl border border-white/5 shadow-sm p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-3 mb-4">Address Details</h3>
              <div className="space-y-4">
                <div>
                  <p className={detailLabelClass}>Current Residence</p>
                  <p className="text-xs font-bold text-gray-300 mt-1 leading-relaxed">{profile.current_address || 'N/A'}</p>
                </div>
                <div>
                  <p className={detailLabelClass}>Permanent Address</p>
                  <p className="text-xs font-bold text-gray-300 mt-1 leading-relaxed">{profile.permanent_address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="bg-[#1a1d2b] rounded-2xl border border-white/5 shadow-sm p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-3 mb-4">Bank Accounts</h3>
              <div className="space-y-4">
                <div>
                  <p className={detailLabelClass}>Bank Name</p>
                  <p className={detailValClass}>{profile.bank_name || 'N/A'}</p>
                </div>
                <div>
                  <p className={detailLabelClass}>Account Number</p>
                  <p className="text-xs font-bold text-gray-200 font-mono mt-1">{profile.account_number || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className={detailLabelClass}>IFSC Code</p>
                    <p className="text-xs font-bold text-gray-200 font-mono mt-1">{profile.ifsc_code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={detailLabelClass}>UPI ID</p>
                    <p className="text-xs font-bold text-gray-200 mt-1">{profile.upi_id || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Edit Profile Modal Drawer (Dark Mode) ── */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end text-left">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
            />
            {/* Form Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden"
              style={{ background: '#13151f', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between" style={{ background: '#1a1d2b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h3 className="text-base font-black text-white">Edit Profile Info</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Editable details only</p>
                </div>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Form */}
              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                {editError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold text-center">
                    {editError}
                  </div>
                )}

                {/* Mobile Numbers */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Primary Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Alternate Phone</label>
                  <input
                    type="text"
                    value={editForm.alternate_phone}
                    onChange={(e) => setEditForm({ ...editForm, alternate_phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-bold"
                  />
                </div>

                {/* Current address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Current Residence Address</label>
                  <textarea
                    value={editForm.current_address}
                    onChange={(e) => setEditForm({ ...editForm, current_address: e.target.value })}
                    rows="3"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] leading-relaxed font-semibold"
                  />
                </div>

                <div className="my-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#38b34a] mb-4">Financial & Banking Setup</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Bank Name</label>
                      <input
                        type="text"
                        value={editForm.bank_name}
                        onChange={(e) => setEditForm({ ...editForm, bank_name: e.target.value })}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Account Number</label>
                      <input
                        type="text"
                        value={editForm.account_number}
                        onChange={(e) => setEditForm({ ...editForm, account_number: e.target.value })}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#38b34a] font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">IFSC Code</label>
                        <input
                          type="text"
                          value={editForm.ifsc_code}
                          onChange={(e) => setEditForm({ ...editForm, ifsc_code: e.target.value.toUpperCase() })}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#38b34a] font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">UPI ID</label>
                        <input
                          type="text"
                          value={editForm.upi_id}
                          onChange={(e) => setEditForm({ ...editForm, upi_id: e.target.value })}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#38b34a] font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spacer */}
                <div className="h-10" />
              </form>

              {/* Action Buttons */}
              <div className="px-6 py-4 flex items-center justify-end gap-3 shrink-0" style={{ background: '#1a1d2b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#38b34a] text-black hover:bg-[#38b34a]/85 rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin text-black" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default EmployeeProfile
