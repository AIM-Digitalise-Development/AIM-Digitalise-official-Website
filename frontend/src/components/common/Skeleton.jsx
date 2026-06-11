export const SectionSkeleton = ({ height = '400px' }) => {
  return (
    <div className="py-20 bg-slate-50">
      <div className="container-custom">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-12"></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
                <div className="h-32 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
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
    <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
      <div className="h-20 bg-slate-200 rounded mb-4"></div>
      <div className="h-10 bg-slate-200 rounded"></div>
    </div>
  )
}