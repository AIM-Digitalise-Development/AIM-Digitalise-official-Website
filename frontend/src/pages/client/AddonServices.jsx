import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAuthStore } from '../../store/clientAuthStore'
import ClientPageHeader from '../../components/client/ClientPageHeader'

const ClientAddonServices = () => {
  const navigate = useNavigate()
  const { profileData, clientUser, productData } = useClientAuthStore()

  // Service 2-4 states (ID Cards Qty)
  const [qtyA, setQtyA] = useState(100)
  const [qtyB, setQtyB] = useState(100)
  const [qtyC, setQtyC] = useState(100)

  // Service 5-7 availed counts
  const [qtyTransport, setQtyTransport] = useState(50)
  const [qtyHostel, setQtyHostel] = useState(30)
  const [qtyBackup, setQtyBackup] = useState(250)

  const activeProduct = productData?.[0] || {}
  const productName = activeProduct?.product_name || activeProduct?.name || clientUser?.product_name || 'NEXGN Institute Pro'

  // Check if product is NEXGN Institute Pro
  const isNexgnInstitutePro = productName === 'NEXGN Institute Pro'

  const schoolName = profileData?.company_name || profileData?.school_name || profileData?.organization || 'Academic Institute'

  const handleOrder = (serviceName, qty, unitPrice, totalPrice) => {
    alert(`Order request submitted successfully!\n\nService: ${serviceName}\nQuantity: ${qty}\nUnit Price: ₹${unitPrice}\nTotal Est. Cost: ₹${totalPrice.toLocaleString('en-IN')}\n\nOur representative will contact you to verify details.`)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 select-none animate-fade-in text-slate-705" style={{ fontFamily: "'Inter', sans-serif" }}>

      <ClientPageHeader title="Add-on Services" />

      {isNexgnInstitutePro ? (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4.5 text-xs font-semibold leading-relaxed">
            ℹ️ You are subscribed to <strong>NEXGN Institute Pro</strong>. The services catalog below details verified add-on expansions, ID card printing, and infrastructure integrations specifically customized for your organization.
          </div>

          {/* Grid of 7 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Service 1: Domain Services */}
            <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg">🌐</span>
                  <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-[9px] font-black uppercase">Domain</span>
                </div>
                <h3 className="text-sm font-black text-slate-800">Domain Services</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                  Client's own live domain integration on website & Software. Secure SSL connection setup included.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹7,300<span className="text-[10px] font-semibold text-slate-400">/year</span></span>
                </div>
                <button
                  onClick={() => handleOrder('Domain Services', 1, 7300, 7300)}
                  className="px-4 py-2 bg-gradient-to-r from-[#1a3c5e] to-[#2a6f97] hover:opacity-90 text-white text-[10.5px] font-bold rounded-lg transition-opacity cursor-pointer"
                >
                  Order Integration
                </button>
              </div>
            </div>

            {/* Service 2: ID Card Type A */}
            <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="w-10 h-10 rounded-xl bg-[#475569]/10 flex items-center justify-center text-lg">🪪</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-black uppercase">Super PVC</span>
                </div>
                <h3 className="text-sm font-black text-slate-800">Students & Teachers ID Card (Type A)</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                  Ready Card (20 mm Multi color Ribbon, PVC supper Card, Card Holder & clip). High durability gloss finish.
                </p>

                {/* Qty Input */}
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Quantity</span>
                  <input
                    type="number"
                    min="1"
                    value={qtyA}
                    onChange={(e) => setQtyA(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-center font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Total Est. Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹{(qtyA * 60).toLocaleString('en-IN')}.00</span>
                </div>
                <button
                  onClick={() => handleOrder('ID Card Type A (Super PVC)', qtyA, 60, qtyA * 60)}
                  className="px-4 py-2 bg-gradient-to-r from-[#1a3c5e] to-[#2a6f97] hover:opacity-90 text-white text-[10.5px] font-bold rounded-lg transition-opacity cursor-pointer"
                >
                  Order Cards
                </button>
              </div>
            </div>

            {/* Service 3: ID Card Type B */}
            <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="w-10 h-10 rounded-xl bg-[#475569]/10 flex items-center justify-center text-lg">🪪</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[9px] font-black uppercase">Regular PVC</span>
                </div>
                <h3 className="text-sm font-black text-slate-800">Students & Teachers ID Card (Type B)</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                  Ready Card (16 mm Single color Ribbon, PVC Regular Card, Card Holder & clip). Quality thermal printing.
                </p>

                {/* Qty Input */}
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Quantity</span>
                  <input
                    type="number"
                    min="1"
                    value={qtyB}
                    onChange={(e) => setQtyB(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-center font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Total Est. Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹{(qtyB * 42).toLocaleString('en-IN')}.00</span>
                </div>
                <button
                  onClick={() => handleOrder('ID Card Type B (Regular PVC)', qtyB, 42, qtyB * 42)}
                  className="px-4 py-2 bg-gradient-to-r from-[#1a3c5e] to-[#2a6f97] hover:opacity-90 text-white text-[10.5px] font-bold rounded-lg transition-opacity cursor-pointer"
                >
                  Order Cards
                </button>
              </div>
            </div>

            {/* Service 4: ID Card Type C */}
            <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="w-10 h-10 rounded-xl bg-[#475569]/10 flex items-center justify-center text-lg">🪪</span>
                  <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[9px] font-black uppercase">Laminated</span>
                </div>
                <h3 className="text-sm font-black text-slate-800">Students & Teachers ID Card (Type C)</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                  Regular printed Single color Ribbon, Gum Pesting Laminated card with Card Holder & clip.
                </p>

                {/* Qty Input */}
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Quantity</span>
                  <input
                    type="number"
                    min="1"
                    value={qtyC}
                    onChange={(e) => setQtyC(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-center font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Total Est. Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹{(qtyC * 37).toLocaleString('en-IN')}.00</span>
                </div>
                <button
                  onClick={() => handleOrder('ID Card Type C (Laminated)', qtyC, 37, qtyC * 37)}
                  className="px-4 py-2 bg-gradient-to-r from-[#1a3c5e] to-[#2a6f97] hover:opacity-90 text-white text-[10.5px] font-bold rounded-lg transition-opacity cursor-pointer"
                >
                  Order Cards
                </button>
              </div>
            </div>

            {/* Service 5: Transportation Services */}
            <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">🚌</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-black uppercase">Transit</span>
                </div>
                <h3 className="text-sm font-black text-slate-800">Transportation Services</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                  GPS-enabled transportation logging, route tracking, dynamic SMS alerts, and fee management integrations.
                </p>

                {/* Qty Input */}
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Availed Students</span>
                  <input
                    type="number"
                    min="1"
                    value={qtyTransport}
                    onChange={(e) => setQtyTransport(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-center font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Total Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹{(qtyTransport * 36).toLocaleString('en-IN')}<span className="text-[10px] font-semibold text-slate-400">/year</span></span>
                </div>
                <button
                  onClick={() => handleOrder('Transportation Services', qtyTransport, 36, qtyTransport * 36)}
                  className="px-4 py-2 bg-gradient-to-r from-[#1a3c5e] to-[#2a6f97] hover:opacity-90 text-white text-[10.5px] font-bold rounded-lg transition-opacity cursor-pointer"
                >
                  Avail Services
                </button>
              </div>
            </div>

            {/* Service 6: Hostel Services */}
            <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-lg">🏢</span>
                  <span className="bg-violet-100 text-violet-800 px-2 py-0.5 rounded text-[9px] font-black uppercase">Hostel</span>
                </div>
                <h3 className="text-sm font-black text-slate-800">Hostel Services</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                  Dormitory allocation manager, mess billing integration, warden controls, and entry logs tracking software.
                </p>

                {/* Qty Input */}
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Availed Students</span>
                  <input
                    type="number"
                    min="1"
                    value={qtyHostel}
                    onChange={(e) => setQtyHostel(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-center font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Total Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹{(qtyHostel * 60).toLocaleString('en-IN')}<span className="text-[10px] font-semibold text-slate-400">/year</span></span>
                </div>
                <button
                  onClick={() => handleOrder('Hostel Services', qtyHostel, 60, qtyHostel * 60)}
                  className="px-4 py-2 bg-gradient-to-r from-[#1a3c5e] to-[#2a6f97] hover:opacity-90 text-white text-[10.5px] font-bold rounded-lg transition-opacity cursor-pointer"
                >
                  Avail Services
                </button>
              </div>
            </div>

            {/* Service 7: Previous Year Data back-up and record */}
            <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">💾</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[9px] font-black uppercase">Archives</span>
                </div>
                <h3 className="text-sm font-black text-slate-800">Previous Year Data Backup</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                  Secure archival backup database hosting. Retrieve historical student records, attendance, and audit logs.
                </p>

                {/* Qty Input */}
                <div className="pt-2 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Student Database Size</span>
                  <input
                    type="number"
                    min="1"
                    value={qtyBackup}
                    onChange={(e) => setQtyBackup(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-center font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Total Cost</span>
                  <span className="text-base font-black text-slate-800 font-mono">₹{(qtyBackup * 36).toLocaleString('en-IN')}<span className="text-[10px] font-semibold text-slate-400">/year</span></span>
                </div>
                <button
                  onClick={() => handleOrder('Previous Year Data backup and record', qtyBackup, 36, qtyBackup * 36)}
                  className="px-4 py-2 bg-gradient-to-r from-[#1a3c5e] to-[#2a6f97] hover:opacity-90 text-white text-[10.5px] font-bold rounded-lg transition-opacity cursor-pointer"
                >
                  Get Backup
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 text-center max-w-xl mx-auto space-y-4">
          <span className="text-4xl block">🛠️</span>
          <h3 className="text-base font-black text-[#1e3e6b]">Add-on Services Optimization</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The add-on services catalog is currently optimized for organizations subscribed to **NEXGN Institute Pro** plans.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl text-[10.5px] text-slate-500 leading-normal font-semibold">
            To query custom domain settings, transportation addons, or additional laminated card prints for your current package ({productName}), please contact your account manager directly via help desk.
          </div>
          <button
            onClick={() => navigate('/client/portal/support')}
            className="px-5 py-2.5 bg-gradient-to-r from-[#1a3c5e] to-[#2a6f97] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-opacity active:scale-95 cursor-pointer"
          >
            Contact Support Desk
          </button>
        </div>
      )}

    </div>
  )
}

export default ClientAddonServices
