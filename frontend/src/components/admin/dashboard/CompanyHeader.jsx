const CompanyHeader = ({ companyName, financialYear }) => (
    <div className="text-center bg-white rounded-2xl border border-slate-200 py-4 px-3 shadow-md shadow-slate-200/50">
        <h2 className="text-3xl font-black text-slate-800">{companyName}</h2>
        <p className="text-sm text-slate-500 font-semibold">Financial Year: {financialYear}</p>
    </div>
)

export default CompanyHeader