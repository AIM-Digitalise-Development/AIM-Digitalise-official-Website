const offices = [
  {
    label: 'Corporate Office',
    region: 'India',
    regionClass: 'bg-blue-50 text-blue-700 border-blue-200',
    address: '#139, 3rd Floor, Rajdanga Main Road, Kolkata - 700107',
  },
  {
    label: 'Branch Office',
    region: 'India',
    regionClass: 'bg-blue-50 text-blue-700 border-blue-200',
    address: '21/1F, Fern Road, 1st Floor Lalvilla, Ballygunge Kolkata - 700019',
  },
  {
    label: 'Branch Office',
    region: 'USA',
    regionClass: 'bg-red-50 text-red-700 border-red-200',
    address: '5916 Frio Dr, Midland, TX 79707, USA',
  },
]

const OfficeInfo = () => (
  <div className="card-elevated p-8">
    <h2 className="text-2xl font-bold text-slate-900 mb-6">Office locations</h2>
    <div className="space-y-4">
      {offices.map((office) => (
        <div
          key={`${office.label}-${office.region}`}
          className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{office.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${office.regionClass}`}>
              {office.region}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{office.address}</p>
        </div>
      ))}
    </div>
    <div className="mt-6 pt-6 border-t border-slate-200 space-y-2 text-sm">
      <p>
        <span className="font-semibold text-slate-800">Email: </span>
        <a href="mailto:support@aimdigitalise.com" className="link-brand">
          support@aimdigitalise.com
        </a>
      </p>
      <p>
        <span className="font-semibold text-slate-800">Sales: </span>
        <a href="tel:+919875592050" className="link-brand">
          +91 98755 92050
        </a>
      </p>
      <p className="text-slate-500 text-xs">Office hours: 10:00 AM – 7:00 PM IST</p>
    </div>
  </div>
)

export default OfficeInfo
