import { useState } from 'react'
import { motion } from 'framer-motion'

// Array of clients so the user can manually delete or add one company at a time
const clientList = [
  { id: 1, name: 'State Bank of India', shortName: 'SBI', color: 'bg-blue-600/20 text-blue-400 border-blue-500/30' },
  { id: 2, name: 'Coal India', shortName: 'Coal India', color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' },
  { id: 3, name: 'Tata Teleservices Limited', shortName: 'TATA', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  { id: 4, name: 'NSI (India) Ltd', shortName: 'NSI', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { id: 5, name: 'Baltic Control', shortName: 'Baltic Control', color: 'bg-teal-600/20 text-teal-400 border-teal-500/30' },
  { id: 6, name: 'WBSIDC', shortName: 'WBSIDC', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { id: 7, name: 'Blue Mark Services', shortName: 'Blue Mark', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { id: 8, name: 'Indian Bank', shortName: 'Indian Bank', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  
  { id: 9, name: 'Spectrum Petromac', shortName: 'Spectrum', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { id: 10, name: 'BMS Constructions', shortName: 'BMS', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 11, name: 'HZ', shortName: 'HZ', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 12, name: 'Nortech', shortName: 'Nortech', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { id: 13, name: 'Samadhan Consulting', shortName: 'Samadhan', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 14, name: 'Samadhan Recruitment', shortName: 'Recruitment', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 15, name: 'Fundage', shortName: 'Fundage', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { id: 16, name: 'S. Baksi & Co.', shortName: 'S.Baksi', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  
  { id: 17, name: 'Shiv Shivam', shortName: 'Shiv Shivam', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 18, name: 'TWPS', shortName: 'TWPS', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20' },
  { id: 19, name: 'Blue Birds Machinery', shortName: 'Blue Birds', color: 'bg-sky-400/20 text-sky-400 border-sky-400/30' },
  { id: 20, name: 'Nasha Mukti Kendra', shortName: 'Nesha Mukti', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { id: 21, name: 'Banzara', shortName: 'Banzara', color: 'bg-green-600/20 text-green-400 border-green-600/30' },
  { id: 22, name: 'Diamond Pest Control', shortName: 'Diamond', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { id: 23, name: 'Printopia World', shortName: 'Printopia', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { id: 24, name: 'Atlas Health Point', shortName: 'Atlas Health', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  
  { id: 25, name: 'Dawn Investments Ltd.', shortName: 'DAWN', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 26, name: 'SEBA', shortName: 'SEBA', color: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30' },
  { id: 27, name: 'Mumu', shortName: 'Mumu', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 28, name: 'Subhoma', shortName: 'Subhoma', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 29, name: 'Esbee', shortName: 'Esbee', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { id: 30, name: 'Dr. Tushar Kanti Patra', shortName: 'Dr. Patra', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 31, name: 'Anandamoyee Ananda Niwas (AAN)', shortName: 'AAN', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 32, name: 'Ten-D', shortName: 'Ten-D', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  
  { id: 33, name: 'Suswastha Clinic', shortName: 'Suswastha', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 34, name: 'ANHI', shortName: 'ANHI', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { id: 35, name: 'Bengal Fire Preservation', shortName: 'Bengal Fire', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 36, name: 'Coaltronics Service Center', shortName: 'Coaltronics', color: 'bg-amber-600/20 text-amber-400 border-amber-500/30' },
  { id: 37, name: 'Fourclips Magma', shortName: 'Fourclips', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { id: 38, name: 'HN Infotech', shortName: 'HN Infotech', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 39, name: 'Indibizz', shortName: 'Indibizz', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 40, name: 'Legal Taxation', shortName: 'Legal Tax', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  
  { id: 41, name: 'Logix Time Automation', shortName: 'Logix', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 42, name: 'GSTax', shortName: 'GSTax', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  { id: 43, name: 'SXRC', shortName: 'SXRC', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  { id: 44, name: 'Sparsh', shortName: 'Sparsh', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 45, name: 'A.E.C. Infrastructure', shortName: 'AEC', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { id: 46, name: 'Star Cooling Service Center', shortName: 'Star Cooling', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { id: 47, name: 'Zingcare Biotech Pvt. Ltd.', shortName: 'Zingcare', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 48, name: 'Feminine Fit', shortName: 'Feminine Fit', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' }
]

const OurClientsSection = () => {
  const [clients] = useState(clientList)

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden border-t border-slate-900">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Styled Underline */}
        <div className="text-center mb-16 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-wider text-white uppercase">
            OUR <span className="text-indigo-400">CLIENTS</span>
          </h2>
          <div className="flex h-1.5 w-32 mt-3 rounded-full overflow-hidden">
            <div className="w-1/2 bg-blue-600" />
            <div className="w-1/2 bg-red-500" />
          </div>
        </div>

        {/* Grid of Individual Glass Client Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 justify-items-center">
          {clients.map((client) => (
            <motion.div
              key={client.id}
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-full h-32 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/60 shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/30 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer group relative"
            >
              {/* Image element (attempts to load real logo; applies grayscale & opacity transitions in dark mode) */}
              <img
                src={`/src/assets/images/clients/client_${client.id}.png`}
                alt={client.name}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
                className="max-h-12 max-w-full object-contain mb-2 filter grayscale opacity-60 brightness-200 hover:grayscale-0 hover:opacity-100 hover:brightness-100 transition-all duration-300"
              />

              {/* Stylized Text Logo Mockup (replaces ugly solid squares with premium outline glass circles) */}
              <div className="flex flex-col items-center justify-center">
                {/* Round initial badge with thin border and subtle glass background */}
                <div className={`w-11 h-11 rounded-full ${client.color} border flex items-center justify-center text-xs font-black shadow-md mb-2 group-hover:scale-110 transition-all duration-300`}>
                  {client.shortName.substring(0, 2).toUpperCase()}
                </div>
                {/* Company title */}
                <span className="text-[10px] font-bold text-slate-400 tracking-tight text-center uppercase leading-tight group-hover:text-indigo-400 transition-colors duration-200">
                  {client.shortName}
                </span>
              </div>

              {/* Nice clean hover tooltip showing full client name */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900 text-white text-[10px] font-semibold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-xl border border-slate-800">
                {client.name}
                {/* Tooltip caret */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-800" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default OurClientsSection
