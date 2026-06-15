import { useClientAuthStore } from '../../store/clientAuthStore'

const ClientPageHeader = ({ title }) => {
  const { profileData, clientUser } = useClientAuthStore()
  const displayUser = profileData || clientUser || {}
  const schoolName = displayUser?.company_name || displayUser?.school_name || displayUser?.organization || 'Academic Institute'

  return (
    <div className="relative flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3 min-h-[48px] border-b border-slate-200/80">
      {/* Left Side: Page Title */}
      <h1 className="text-3xl font-black text-[#1e3e6b] tracking-tight">{title}</h1>

      {/* Center: School / Org name and Academic Session */}
      <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2 mt-1 md:mt-0 select-none">
        <h2 className="text-lg font-extrabold text-[#1e3e6b] tracking-tight uppercase">
          {schoolName}
        </h2>
        <p className="text-xs font-bold text-slate-500">Academic Session: 2026-2027</p>
      </div>

      {/* Right Side: Spacer */}
      <div className="w-48 hidden md:block"></div>
    </div>
  )
}

export default ClientPageHeader
