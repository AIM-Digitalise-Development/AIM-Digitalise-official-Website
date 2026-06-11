import { useState } from 'react'
import { motion } from 'framer-motion'

// Array of clients so the user can manually delete or add one company at a time
const clientList = [
  { id: 1, name: 'State Bank of India', shortName: 'SBI', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 2, name: 'Coal India', shortName: 'Coal India', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 3, name: 'Tata Teleservices Limited', shortName: 'TATA', color: 'bg-sky-50 text-sky-600 border-sky-200' },
  { id: 4, name: 'NSI (India) Ltd', shortName: 'NSI', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { id: 5, name: 'Baltic Control', shortName: 'Baltic Control', color: 'bg-teal-50 text-teal-600 border-teal-200' },
  { id: 6, name: 'WBSIDC', shortName: 'WBSIDC', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  { id: 7, name: 'Blue Mark Services', shortName: 'Blue Mark', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { id: 8, name: 'Indian Bank', shortName: 'Indian Bank', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  
  { id: 9, name: 'Spectrum Petromac', shortName: 'Spectrum', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  { id: 10, name: 'BMS Constructions', shortName: 'BMS', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 11, name: 'HZ', shortName: 'HZ', color: 'bg-red-50 text-red-600 border-red-200' },
  { id: 12, name: 'Nortech', shortName: 'Nortech', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  { id: 13, name: 'Samadhan Consulting', shortName: 'Samadhan', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 14, name: 'Samadhan Recruitment', shortName: 'Recruitment', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 15, name: 'Fundage', shortName: 'Fundage', color: 'bg-green-50 text-green-600 border-green-200' },
  { id: 16, name: 'S. Baksi & Co.', shortName: 'S.Baksi', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  
  { id: 17, name: 'Shiv Shivam', shortName: 'Shiv Shivam', color: 'bg-red-50 text-red-600 border-red-200' },
  { id: 18, name: 'TWPS', shortName: 'TWPS', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { id: 19, name: 'Blue Birds Machinery', shortName: 'Blue Birds', color: 'bg-sky-50 text-sky-600 border-sky-200' },
  { id: 20, name: 'Nasha Mukti Kendra', shortName: 'Nesha Mukti', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  { id: 21, name: 'Banzara', shortName: 'Banzara', color: 'bg-green-50 text-green-600 border-green-200' },
  { id: 22, name: 'Diamond Pest Control', shortName: 'Diamond', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { id: 23, name: 'Printopia World', shortName: 'Printopia', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  { id: 24, name: 'Atlas Health Point', shortName: 'Atlas Health', color: 'bg-red-50 text-red-600 border-red-200' },
  
  { id: 25, name: 'Dawn Investments Ltd.', shortName: 'DAWN', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 26, name: 'SEBA', shortName: 'SEBA', color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200' },
  { id: 27, name: 'Mumu', shortName: 'Mumu', color: 'bg-red-50 text-red-600 border-red-200' },
  { id: 28, name: 'Subhoma', shortName: 'Subhoma', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 29, name: 'Esbee', shortName: 'Esbee', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  { id: 30, name: 'Dr. Tushar Kanti Patra', shortName: 'Dr. Patra', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 31, name: 'Anandamoyee Ananda Niwas (AAN)', shortName: 'AAN', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 32, name: 'Ten-D', shortName: 'Ten-D', color: 'bg-red-50 text-red-600 border-red-200' },
  
  { id: 33, name: 'Suswastha Clinic', shortName: 'Suswastha', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 34, name: 'ANHI', shortName: 'ANHI', color: 'bg-pink-50 text-pink-600 border-pink-200' },
  { id: 35, name: 'Bengal Fire Preservation', shortName: 'Bengal Fire', color: 'bg-red-50 text-red-600 border-red-200' },
  { id: 36, name: 'Coaltronics Service Center', shortName: 'Coaltronics', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 37, name: 'Fourclips Magma', shortName: 'Fourclips', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  { id: 38, name: 'HN Infotech', shortName: 'HN Infotech', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 39, name: 'Indibizz', shortName: 'Indibizz', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 40, name: 'Legal Taxation', shortName: 'Legal Tax', color: 'bg-red-50 text-red-600 border-red-200' },
  
  { id: 41, name: 'Logix Time Automation', shortName: 'Logix', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 42, name: 'GSTax', shortName: 'GSTax', color: 'bg-violet-50 text-violet-600 border-violet-200' },
  { id: 43, name: 'SXRC', shortName: 'SXRC', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  { id: 44, name: 'Sparsh', shortName: 'Sparsh', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 45, name: 'A.E.C. Infrastructure', shortName: 'AEC', color: 'bg-teal-50 text-teal-600 border-teal-200' },
  { id: 46, name: 'Star Cooling Service Center', shortName: 'Star Cooling', color: 'bg-green-50 text-green-600 border-green-200' },
  { id: 47, name: 'Zingcare Biotech Pvt. Ltd.', shortName: 'Zingcare', color: 'bg-red-50 text-red-600 border-red-200' },
  { id: 48, name: 'Feminine Fit', shortName: 'Feminine Fit', color: 'bg-pink-50 text-pink-600 border-pink-200' }
]

const getClientAccent = (id) =>
  id % 2 === 1
    ? 'bg-aim-gold/15 text-aim-gold border-aim-gold/30'
    : 'bg-aim-purple/15 text-aim-purple border-aim-purple/30'

const OurClientsSection = () => {
  const [clients] = useState(clientList)

  return (
    <section className="py-24 section-tinted relative">
      <div className="ambient-glows" aria-hidden />

      <div className="container-custom relative z-10">
        <div className="text-center mb-16 flex flex-col items-center gap-3">
          <div className="badge-pill">
            <span className="badge-pill-dot" />
            Trusted Partners
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-wider text-aim-copy uppercase">
            OUR <span className="text-gradient">CLIENTS</span>
          </h2>
          <div className="flex h-1.5 w-32 rounded-full overflow-hidden shadow-sm">
            <div className="w-1/2 bg-aim-gold" />
            <div className="w-1/2 bg-aim-purple" />
          </div>
        </div>

        {/* Grid of Individual Glass Client Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 justify-items-center">
          {clients.map((client) => (
            <motion.div
              key={client.id}
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-full h-32 flex flex-col items-center justify-center p-4 rounded-2xl card-elevated shadow-sm hover:shadow-aim-gold/15 hover:border-aim-gold/40 hover:bg-aim-gold/5 transition-all duration-300 cursor-pointer group relative"
            >
              {/* Image element (attempts to load real logo; applies grayscale & opacity transitions in dark mode) */}
              <img
                src={`/src/assets/images/clients/client_${client.id}.png`}
                alt={client.name}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
                className="max-h-12 max-w-full object-contain mb-2 filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              />

              {/* Stylized Text Logo Mockup (replaces ugly solid squares with premium outline glass circles) */}
              <div className="flex flex-col items-center justify-center">
                {/* Round initial badge with thin border and subtle glass background */}
                <div className={`w-11 h-11 rounded-full ${getClientAccent(client.id)} border flex items-center justify-center text-xs font-black shadow-md mb-2 group-hover:scale-110 transition-all duration-300`}>
                  {client.shortName.substring(0, 2).toUpperCase()}
                </div>
                {/* Company title */}
                <span className="text-[10px] font-bold text-aim-copy-muted tracking-tight text-center uppercase leading-tight group-hover:text-aim-highlight transition-colors duration-200">
                  {client.shortName}
                </span>
              </div>

              {/* Nice clean hover tooltip showing full client name */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900 text-white text-[10px] font-semibold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-xl border border-slate-700">
                {client.name}
                {/* Tooltip caret */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default OurClientsSection
