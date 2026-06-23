import React from 'react'

const OfferLetterModal = ({ isOpen, onClose, employeeData, departments, designations }) => {
  if (!isOpen || !employeeData) return null

  const {
    first_name = '',
    last_name = '',
    email = '',
    phone = '',
    current_address = '',
    joining_date = '',
    employment_type = 'full_time',
    current_salary = 0,
    department_id = '',
    designation_id = '',
  } = employeeData

  // Resolve department and designation names
  const deptName = departments.find(d => String(d.id) === String(department_id))?.name || '—'
  const desigName = designations.find(d => String(d.id) === String(designation_id))?.name || '—'

  // Calculations
  const monthlySalary = parseFloat(current_salary) || 0
  const annualSalary = monthlySalary * 12

  // CTC components
  const basicMonthly = Math.round(monthlySalary * 0.50)
  const basicAnnual = basicMonthly * 12

  const hraMonthly = Math.round(monthlySalary * 0.25)
  const hraAnnual = hraMonthly * 12

  const specialMonthly = monthlySalary - (basicMonthly + hraMonthly)
  const specialAnnual = specialMonthly * 12

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)
  }

  const formatEmploymentType = (type) => {
    switch (type) {
      case 'full_time': return 'Full Time'
      case 'part_time': return 'Part Time'
      case 'contractual': return 'Contractual'
      default: return 'Full Time'
    }
  }

  const getRefNumber = () => {
    const year = new Date().getFullYear()
    // Deterministic random code based on employee details
    const seed = (first_name.length + last_name.length) * 100
    const code = Math.floor(1000 + (seed % 9000))
    return `AIM/OL/${year}/${code}`
  }

  const handlePrint = () => {
    const printContent = document.getElementById('offer-letter-content').innerHTML
    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.width = '0px'
    iframe.style.height = '0px'
    iframe.style.border = '0px'
    document.body.appendChild(iframe)
    
    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(`
      <html>
        <head>
          <title>Offer Letter - ${first_name} ${last_name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              line-height: 1.6;
              padding: 40px;
              background: #fff;
            }
            .letterhead {
              text-align: center;
              border-bottom: 2px solid #1e3e6b;
              padding-bottom: 16px;
              margin-bottom: 30px;
            }
            .letterhead h1 {
              color: #1e3e6b;
              font-size: 26px;
              margin: 0;
              font-weight: 900;
              letter-spacing: -0.5px;
            }
            .letterhead p {
              font-size: 11px;
              color: #64748b;
              margin: 4px 0 0 0;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 24px;
              font-size: 12px;
              font-weight: 600;
              color: #475569;
            }
            .recipient {
              margin-bottom: 24px;
              font-size: 13px;
              color: #334155;
            }
            .recipient strong {
              color: #0f172a;
            }
            .salutation {
              margin-bottom: 16px;
              font-weight: 700;
              color: #0f172a;
            }
            .body-text {
              font-size: 13px;
              margin-bottom: 20px;
              text-align: justify;
              color: #334155;
            }
            .table-title {
              font-size: 12px;
              font-weight: 700;
              color: #1e3e6b;
              margin-top: 24px;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 10px 14px;
              text-align: left;
            }
            th {
              background-color: #f8fafc;
              font-weight: 700;
              color: #1e3e6b;
            }
            .total-row td {
              font-weight: 700;
              background-color: #f1f5f9;
              color: #0f172a;
            }
            .signatures {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              font-size: 13px;
            }
            .signature-block {
              width: 220px;
              border-top: 1px dashed #94a3b8;
              padding-top: 8px;
              text-align: center;
              font-weight: 600;
              color: #475569;
            }
            .signature-block strong {
              color: #0f172a;
              display: block;
              margin-bottom: 2px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.frameElement.remove();
              }, 100);
            }
          </script>
        </body>
      </html>
    `)
    doc.close()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in z-10 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div>
            <h3 className="text-base font-black text-[#1e3e6b] uppercase tracking-wider flex items-center gap-2">
              <span>📄</span> Offer Letter Generator
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Review company branding, CTC distribution, and select to Print or Save as PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Letter Preview Area */}
        <div className="overflow-y-auto flex-grow p-8 bg-slate-100/50 flex justify-center">
          <div 
            id="offer-letter-content" 
            className="bg-white w-full max-w-[800px] border border-slate-200 shadow-sm p-12 text-slate-800 leading-relaxed font-sans text-sm rounded-xl"
          >
            {/* Letterhead */}
            <div className="letterhead text-center border-b-2 border-[#1e3e6b] pb-4 mb-6">
              <h1 className="text-2xl font-black text-[#1e3e6b] tracking-tight uppercase">AIM Digitalise Pvt. Ltd.</h1>
              <p className="text-[10px] text-slate-400 font-black tracking-widest mt-1 uppercase">Innovative Digital Solutions & Technology Partners</p>
            </div>

            {/* Meta Row */}
            <div className="meta-row flex justify-between mb-6 text-xs font-bold text-slate-500">
              <div>Ref: {getRefNumber()}</div>
              <div>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>

            {/* Recipient info */}
            <div className="recipient mb-6 text-xs text-slate-600 space-y-1">
              <div>To,</div>
              <div className="text-sm font-bold text-slate-800">{first_name} {last_name}</div>
              {phone && <div>Phone: {phone}</div>}
              {email && <div>Email: {email}</div>}
              {current_address && <div className="whitespace-pre-line max-w-sm mt-1 text-slate-500 font-semibold">{current_address}</div>}
            </div>

            {/* Salutation */}
            <div className="salutation font-bold text-slate-800 mb-4 text-sm">
              Dear {first_name},
            </div>

            {/* Letter Body */}
            <div className="body-text text-xs text-slate-600 text-justify space-y-4">
              <p>
                Following our recent discussions, we are absolutely delighted to offer you employment with{' '}
                <strong>AIM Digitalise Pvt. Ltd.</strong> in the position of <strong>{desigName}</strong> in our{' '}
                <strong>{deptName}</strong> department.
              </p>
              <p>
                Your employment type will be <strong>{formatEmploymentType(employment_type)}</strong>. We expect you to start
                your journey with us on <strong>{joining_date ? new Date(joining_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}</strong>.
              </p>
              <p>
                The details of your compensation structure, totaling a monthly CTC of <strong>{formatCurrency(monthlySalary)}</strong>{' '}
                and an annual CTC of <strong>{formatCurrency(annualSalary)}</strong>, are outlined below:
              </p>
            </div>

            {/* Salary Breakdown Table */}
            <div className="table-container my-6">
              <div className="table-title text-[10px] font-black text-[#1e3e6b] mb-2 uppercase tracking-wide">
                Salary Structure (Annexure A)
              </div>
              <table className="w-full text-left border-collapse text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-[#1e3e6b]">
                    <th className="p-2.5 border-r border-slate-200">Salary Component</th>
                    <th className="p-2.5 text-right border-r border-slate-200">Monthly (INR)</th>
                    <th className="p-2.5 text-right">Annualized (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <td className="p-2.5 border-r border-slate-200">Basic Salary (50%)</td>
                    <td className="p-2.5 text-right border-r border-slate-200">{formatCurrency(basicMonthly)}</td>
                    <td className="p-2.5 text-right">{formatCurrency(basicAnnual)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 border-r border-slate-200">House Rent Allowance (HRA) (25%)</td>
                    <td className="p-2.5 text-right border-r border-slate-200">{formatCurrency(hraMonthly)}</td>
                    <td className="p-2.5 text-right">{formatCurrency(hraAnnual)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 border-r border-slate-200">Special Allowance (25%)</td>
                    <td className="p-2.5 text-right border-r border-slate-200">{formatCurrency(specialMonthly)}</td>
                    <td className="p-2.5 text-right">{formatCurrency(specialAnnual)}</td>
                  </tr>
                  <tr className="total-row bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
                    <td className="p-2.5 border-r border-slate-200">Total CTC (Cost to Company)</td>
                    <td className="p-2.5 text-right border-r border-slate-200">{formatCurrency(monthlySalary)}</td>
                    <td className="p-2.5 text-right">{formatCurrency(annualSalary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Rules */}
            <div className="body-text text-xs text-slate-600 text-justify space-y-4">
              <p>
                By accepting this offer, you agree to adhere to the company's code of conduct, intellectual property policies,
                and confidentiality agreements. A detailed appointment letter containing complete terms of service will be provided
                to you on your joining date.
              </p>
              <p>
                Please sign and date the duplicate copy of this letter as a token of your acceptance and return it to us.
              </p>
            </div>

            {/* Signature Block */}
            <div className="signatures mt-12 flex justify-between text-xs text-slate-700 pt-10 border-t border-slate-100">
              <div className="signature-block w-48 text-center pt-8 border-t border-dashed border-slate-300">
                <strong>AIM Digitalise Pvt. Ltd.</strong>
                <span className="text-[10px] text-slate-400">Authorized Signatory</span>
              </div>
              <div className="signature-block w-48 text-center pt-8 border-t border-dashed border-slate-300">
                <strong>Candidate Acceptance</strong>
                <span className="text-[10px] text-slate-400">Signature & Date</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 px-5 py-3 bg-[#38b34a] hover:bg-[#2e9e3e] text-white font-bold rounded-xl shadow-md text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <span>🖨️</span> Print / Save as PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}

export default OfferLetterModal
