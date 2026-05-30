const Card = ({ children, className = '', hover = false, padding = 'md' }) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div className={`bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl transition-all duration-300 ${hover ? 'hover:border-indigo-500/30 hover:bg-slate-900/60 hover:shadow-[0_0_30px_rgba(99,102,241,0.12)] hover:-translate-y-1' : ''} ${paddings[padding]} ${className}`}>
      {children}
    </div>
  )
}

export default Card