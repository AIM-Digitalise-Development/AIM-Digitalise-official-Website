const CompanyHeader = ({ companyName, financialYear }) => (
    <div className="text-center select-none">
        <h2 className="text-2xl font-bold text-[#2d3a66] tracking-tight">{companyName}</h2>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Financial Year: {financialYear}</p>
    </div>
)

export default CompanyHeader