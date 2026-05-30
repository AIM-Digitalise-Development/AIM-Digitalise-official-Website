export const SectionSkeleton = ({ height = '400px' }) => {
  return (
    <div className="py-20 bg-slate-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-slate-800 rounded w-1/2 mx-auto mb-12"></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                <div className="h-32 bg-slate-800 rounded mb-4"></div>
                <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const CardSkeleton = () => {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-3/4 mb-4"></div>
      <div className="h-20 bg-slate-800 rounded mb-4"></div>
      <div className="h-10 bg-slate-800 rounded"></div>
    </div>
  )
}