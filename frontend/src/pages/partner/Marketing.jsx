import { useState } from 'react'
import { Helmet } from 'react-helmet-async'

const DUMMY_BROCHURES = [
  { id: 1, title: 'NexGen ERP Enterprise Brochure', description: 'Complete details on inventory, purchase records, HR operations, and sales tracking.', size: '2.4 MB', type: 'PDF' },
  { id: 2, title: 'NEXGN School Suite Flyer', description: 'Pamphlet for schools showcasing fee records, marksheet reports, and student logs.', size: '1.8 MB', type: 'PDF' },
  { id: 3, title: 'NEXGN Hospital MS Details', description: 'Product outline for medical centers, clinical reports, and patient database integrations.', size: '3.1 MB', type: 'PDF' },
  { id: 4, title: 'Retail Billing & POS Catalog', description: 'Quick specs for general stores, pharmacies, and outlets needing GST billing.', size: '1.2 MB', type: 'PDF' },
]

const PartnerMarketing = () => {
  const [copied, setCopied] = useState(false)
  const [salesCount, setSalesCount] = useState(12) // Current sales level

  const refCode = 'REF-GG-HADID'
  const referralUrl = `https://aimdigitalise.com/ref?code=${refCode}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      })
      .catch(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      })
  }

  const handleDownload = (title) => {
    alert(`Downloading ${title}... (Demo feature)`)
  }

  // Tier configuration
  const tiers = [
    { name: 'Bronze', range: '1-5 Sales', rate: '10% Commission', minSales: 0 },
    { name: 'Silver', range: '6-15 Sales', rate: '15% Commission', minSales: 6 },
    { name: 'Gold', range: '16-30 Sales', rate: '20% Commission', minSales: 16 },
    { name: 'Platinum', range: '31+ Sales', rate: '25% Commission', minSales: 31 }
  ]

  // Determine current tier
  let currentTierIndex = 0
  if (salesCount >= 31) currentTierIndex = 3
  else if (salesCount >= 16) currentTierIndex = 2
  else if (salesCount >= 6) currentTierIndex = 1

  const currentTier = tiers[currentTierIndex]
  const nextTier = currentTierIndex < 3 ? tiers[currentTierIndex + 1] : null
  const salesToNextTier = nextTier ? nextTier.minSales - salesCount : 0

  return (
    <>
      <Helmet>
        <title>Promo Kit & Tiers | AIM Partner</title>
      </Helmet>

      <div className="space-y-6 text-white">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white">Promo Kit & Tiers</h1>
          <p className="text-aim-copy-muted text-xs mt-1">
            Access brochures, generate your unique tracking link, and monitor your commission multiplier tiers.
          </p>
        </div>

        {/* Section 1: Referral Link Generator */}
        <div className="rounded-2xl border border-white/10 bg-aim-navy-card/60 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-black text-white">Custom Referral Link</h3>
            <p className="text-[10px] text-aim-copy-muted mt-0.5">Share this link to automatically attribute clients and lead purchases to your account.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-aim-gold font-bold select-all flex items-center justify-between min-h-[44px] overflow-hidden">
              <span className="break-all">{referralUrl}</span>
            </div>
            <button
              onClick={handleCopyLink}
              className={`px-6 py-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center gap-1.5 min-w-[120px] ${
                copied
                  ? 'bg-green-600 text-white shadow-green-500/10'
                  : 'bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy hover:brightness-110 shadow-aim-gold/15'
              }`}
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Commission Tier Progress */}
        <div className="rounded-2xl border border-white/10 bg-aim-navy-card/60 p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-black text-white">Commission Multiplier Progress</h3>
              <p className="text-[10px] text-aim-copy-muted mt-0.5">Your commission rate increases dynamically as you hit aggregate sales targets.</p>
            </div>
            <div className="px-3 py-1 bg-aim-purple/20 border border-aim-purple/35 text-aim-purple-light rounded-full text-[10px] font-black uppercase tracking-wider">
              Current Sales: {salesCount}
            </div>
          </div>

          {/* Progress visual bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-aim-copy-muted">
              <span>Bronze (10%)</span>
              <span>Silver (15%)</span>
              <span>Gold (20%)</span>
              <span>Platinum (25%)</span>
            </div>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 flex relative p-[2px]">
              {/* Silver Progress indicator (salesCount / 31) */}
              <div 
                className="h-full rounded-full bg-gradient-to-r from-aim-gold via-aim-purple to-aim-purple-light transition-all duration-500 shadow-md"
                style={{ width: `${Math.min(100, (salesCount / 31) * 100)}%` }}
              />
            </div>
            {nextTier ? (
              <div className="text-[10.5px] text-aim-copy-muted font-bold pt-1">
                You are currently in <span className="text-white font-black">{currentTier.name} Tier</span> ({currentTier.rate}). 
                Complete <span className="text-aim-gold font-black">{salesToNextTier} more sales</span> to unlock <span className="text-white font-black">{nextTier.name} Tier</span> ({nextTier.rate}).
              </div>
            ) : (
              <div className="text-[10.5px] text-green-400 font-bold pt-1">
                🏆 Congratulations! You have reached <span className="text-white font-black">Platinum Tier</span> ({currentTier.rate}) and unlocked maximum commission rates.
              </div>
            )}
          </div>

          {/* Tier specs grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/5">
            {tiers.map((t, idx) => (
              <div 
                key={t.name}
                className={`rounded-xl border p-4 transition-all ${
                  idx === currentTierIndex
                    ? 'border-aim-gold bg-aim-gold/5 shadow-md shadow-aim-gold/5'
                    : 'border-white/5 bg-white/[0.02] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-white">{t.name}</span>
                  {idx === currentTierIndex && (
                    <span className="text-[9px] bg-aim-gold text-aim-navy px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Active</span>
                  )}
                </div>
                <p className="text-aim-gold text-xs font-black">{t.rate}</p>
                <p className="text-[10px] text-aim-copy-muted font-bold mt-1">{t.range}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Promotional Flyers grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white">Promotional brochures & brochures</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DUMMY_BROCHURES.map(brochure => (
              <div 
                key={brochure.id}
                className="rounded-2xl border border-white/10 bg-aim-navy-card/40 p-5 flex flex-col justify-between gap-4 hover:border-white/20 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-aim-copy-muted">{brochure.type}</span>
                    <span className="text-[10px] font-black text-aim-copy-muted">{brochure.size}</span>
                  </div>
                  <h4 className="text-xs font-black text-white">{brochure.title}</h4>
                  <p className="text-[10px] text-aim-copy-muted font-medium mt-1 leading-relaxed">{brochure.description}</p>
                </div>
                <button
                  onClick={() => handleDownload(brochure.title)}
                  className="w-full py-2 border border-white/10 hover:border-aim-gold hover:bg-aim-gold/10 text-white hover:text-aim-gold rounded-xl text-[10px] font-black transition-all cursor-pointer uppercase tracking-wider"
                >
                  Download Brochure
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default PartnerMarketing
