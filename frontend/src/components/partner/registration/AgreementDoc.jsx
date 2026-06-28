import React from 'react'
import logo from '../../../assets/images/logo.png'

const AgreementDoc = ({ partnerData, forPdf = false }) => {
  const today = new Date()
  const dayStr = String(today.getDate()).padStart(2, '0')
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const monthStr = months[today.getMonth()]
  const yearStr = String(today.getFullYear()).slice(-2)
  const fullDateStr = `${dayStr} ${monthStr} 20${yearStr}`

  const getPageStyle = () => ({
    height: '297mm',
    width: '210mm',
    boxSizing: 'border-box',
    pageBreakAfter: 'always',
    breakAfter: 'page',
    boxShadow: forPdf ? 'none' : '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    marginBottom: forPdf ? '0' : '1.5rem',
    position: 'relative',
    backgroundColor: '#ffffff',
    color: '#1e293b'
  })

  // Partner details
  const partnerName = partnerData?.partner_name || '_________________________'
  const orgName = partnerData?.organization_name || '_________________________'
  
  // Format full address
  const addr1 = partnerData?.address_line1 || ''
  const addr2 = partnerData?.address_line2 ? `, ${partnerData.address_line2}` : ''
  const district = partnerData?.district ? `, ${partnerData.district}` : ''
  const state = partnerData?.state ? `, ${partnerData.state}` : ''
  const pin = partnerData?.pin_code ? ` - ${partnerData.pin_code}` : ''
  
  const fullAddress = (addr1 || addr2 || district || state || pin) 
    ? `${addr1}${addr2}${district}${state}${pin}`
    : '________________________________________________________________'

  const Header = () => (
    <div className="agreement-header flex justify-between items-start border-b-2 border-red-500 pb-2.5 mb-6">
      <div className="flex flex-col">
        <img src={logo} alt="AIM Digitalise Logo" className="h-10 w-auto object-contain self-start" />
        <span className="text-[9px] font-black text-red-500 mt-1 italic tracking-wide uppercase">Digital Nation to Developed Nation</span>
      </div>
      <div className="text-right text-[9px] text-slate-700 font-bold leading-normal font-sans">
        <div className="text-slate-900 font-black mb-0.5">Partner ID: {partnerData?.partner_id || 'Draft'}</div>
        <div>#139, 3rd Floor, Rajdanga Main</div>
        <div>Road, Kasba, Kolkata- 700107, WB</div>
        <div className="mt-0.5 text-slate-900 font-black">GSTIN: 19ABCCA9672L1Z0</div>
      </div>
    </div>
  )

  const Footer = () => (
    <div className="agreement-footer absolute bottom-5 left-10 right-10 flex justify-between items-center border-t border-slate-200 pt-2 text-[9px] text-slate-500 font-bold font-sans">
      <span>info@aimdigitalise.com</span>
      <span>www.aimdigitalise.com</span>
    </div>
  )

  const Watermark = () => (
    <div className="agreement-watermark absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 opacity-[0.14] pointer-events-none z-0 flex items-center justify-center">
      <img src={logo} alt="Watermark" className="w-full h-auto object-contain" />
    </div>
  )

  return (
    <div 
      className={forPdf ? "" : "agreement-doc-wrapper bg-slate-900/40 p-4 overflow-x-auto"}
      style={forPdf ? { padding: 0, backgroundColor: 'transparent' } : {}}
    >
      <div 
        id={forPdf ? "agreement-pdf-container" : "agreement-doc-container"} 
        className="mx-auto w-[210mm] text-slate-800 text-[10.5px] leading-relaxed select-text font-sans bg-white text-slate-800"
        style={{
          width: '210mm',
          margin: forPdf ? '0' : 'auto',
          backgroundColor: '#ffffff',
          color: '#1e293b'
        }}
      >
        
        {/* PAGE 1 */}
        <div className="agreement-page bg-white p-10 pr-12 pl-12 box-border flex flex-col justify-between" style={getPageStyle()}>
          <Watermark />
          <div className="relative z-10 flex-grow">
            <Header />
            <div className="space-y-4 text-justify">
              <h2 className="text-center text-sm font-black text-slate-900 uppercase tracking-wider mb-6">
                PARTNERSHIP AGREEMENT<br />
                <span className="underline decoration-slate-900 decoration-1 underline-offset-4">(ASSOCIATE PARTNER)</span>
              </h2>
              
              <p className="font-bold">
                This Agreement is made on this <span className="underline font-black text-blue-900 px-1">{dayStr}</span> day of <span className="underline font-black text-blue-900 px-1">{monthStr}</span>, 20<span className="underline font-black text-blue-900 px-1">{yearStr}</span>
              </p>
              
              <h3 className="font-black text-slate-900 tracking-wide text-xs pt-1">BETWEEN</h3>
              
              <p>
                <strong>AIM Digitalise Private Limited</strong>, a company incorporated under the Companies Act, having its registered office at # 3rd floor, 139 Rajdanga Main Road, Kolkata 700107, hereinafter referred to as the <strong>"Company"</strong>
              </p>
              
              <h3 className="font-black text-slate-900 tracking-wide text-xs pt-1">AND</h3>
              
              <p>
                <strong>Partner' Organization</strong> <span className="underline font-black text-blue-900 px-1">{orgName}</span> in the name of Mr./Ms./M/s <span className="underline font-black text-blue-900 px-1">{partnerName}</span>, having its office at <span className="underline font-black text-blue-900 px-1">{fullAddress}</span>, hereinafter referred to as the <strong>"Associate Partner"</strong>
              </p>
              
              <p>The Company and the Partner are collectively referred to as the <strong>"Parties"</strong>.</p>
              
              <h3 className="font-black text-slate-900 text-xs pt-2">1. PURPOSE OF AGREEMENT</h3>
              <p>
                The Company appoints the Associate Partner as a Non-Exclusive Business Partner for promoting, marketing, generating leads, onboarding to various client, and facilitating sales and implementation of <strong>NEXGN Institute Pro and other products and services</strong>, whereas the SAAS based product and service developed and marketed by AIM Digitalise Pvt. Ltd.
              </p>
              
              <h3 className="font-black text-slate-900 text-xs pt-2">2. SCOPE OF WORK</h3>
              <p>The Associate Partner shall:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Promote NEXGN Institute Pro among schools, colleges, coaching centers, training institutes, and educational organizations along with other products.</li>
                <li>Generate prospective leads and arrange product demonstrations.</li>
                <li>Coordinate with institutions for proposal discussions and onboarding formalities.</li>
                <li>Implementation of software for making live operation.</li>
                <li>Maintain professional conduct while representing the Company.</li>
                <li>Submit lead and sales reports as required by the Company.</li>
              </ul>
              <p>The Partner shall not make any commitment, warranty, or representation beyond the officially approved policies of the Company.</p>
            </div>
          </div>
          <Footer />
        </div>

        {/* PAGE 2 */}
        <div className="agreement-page bg-white p-10 pr-12 pl-12 box-border flex flex-col justify-between" style={getPageStyle()}>
          <Watermark />
          <div className="relative z-10 flex-grow">
            <Header />
            <div className="space-y-4 text-justify">
              <h3 className="font-black text-slate-900 text-xs">3. APPOINTMENT NATURE</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>This appointment is on a <strong>Non-Exclusive Basis</strong>.</li>
                <li>The Company reserves the right to appoint additional partners and reserves territory.</li>
                <li>Unreserved territory will be common working area to all partners.</li>
                <li>Nothing contained herein shall be construed as creating an employer-employee relationship.</li>
              </ul>
              
              <h3 className="font-black text-slate-900 text-xs pt-2">4. REGISTRATION PROCESS</h3>
              <p>Based on the partner registration information published by AIM Digitalise and NEXGN Institute Pro, the Associate Partner registration process can be structured as follows:</p>
              
              <div className="space-y-3.5 pl-3">
                <div>
                  <h4 className="font-bold text-slate-950">Step 1: Eligibility Check</h4>
                  <p className="text-slate-600 mt-1">The applicant should:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Have an active business unit or professional consultancy.</li>
                    <li>Possess experience in B2B sales, educational services, software sales, marketing, or business development.</li>
                    <li>Be willing to promote NEXGN Institute Pro to schools, colleges, coaching centers, and educational institutions.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-slate-950">Step 2: Submit Registration Application</h4>
                  <p className="text-slate-600 mt-1">Provide the following details:</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 list-disc pl-5 mt-1">
                    <li>Organization Name (if applicable)</li>
                    <li>Applicant Name</li>
                    <li>Mobile Number</li>
                    <li>Email ID</li>
                    <li>Complete Address</li>
                    <li>District</li>
                    <li>State</li>
                    <li>PIN Code</li>
                    <li>Country</li>
                    <li>Relationship Manager (if assigned)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-slate-950">Step 3: Upload Documents</h4>
                  <p className="text-slate-600 mt-1">Submit:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>PAN Card</li>
                    <li>Government Photo ID (Aadhaar/Voter ID/Passport/Driving Licence)</li>
                    <li>Organization Proof (GST Certificate, Trade Licence, MSME Certificate, etc., if applicable)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>

        {/* PAGE 3 */}
        <div className="agreement-page bg-white p-10 pr-12 pl-12 box-border flex flex-col justify-between" style={getPageStyle()}>
          <Watermark />
          <div className="relative z-10 flex-grow">
            <Header />
            <div className="space-y-4 text-justify">
              <div className="space-y-3.5 pl-3">
                <div>
                  <h4 className="font-bold text-slate-950">Step 4: Registration Fee</h4>
                  <p className="text-slate-600 mt-1">As per the published referral partner program:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Registration Process Fee: ₹1,000/- for Indian applicants.</li>
                    <li>International applicants: USD 1,000.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-slate-950">Step 5: Agreement Execution</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Read and accept the Terms & Conditions.</li>
                    <li>Download the Partner Agreement.</li>
                    <li>Sign the agreement.</li>
                    <li>Upload the signed agreement through the partner portal.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-slate-950">Step 6: Partner Approval</h4>
                  <p className="text-slate-600 mt-1">After verification:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Partner ID is generated.</li>
                    <li>Relationship Manager is assigned.</li>
                    <li>Login credentials are issued.</li>
                    <li>Sales and product training are provided.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-slate-950">Step 7: Start Business Development</h4>
                  <p className="text-slate-600 mt-1">Associate Partners Does:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Generate leads.</li>
                    <li>Arrange product demonstrations.</li>
                    <li>Coordinate institution onboarding.</li>
                    <li>Assist in documentation and implementation.</li>
                    <li>Earn commissions as per the applicable partner commission structure.</li>
                  </ul>
                </div>
              </div>

              <h3 className="font-black text-slate-900 text-xs pt-2">5. ROLES AND RESPONSIBILITIES</h3>
              <ul className="space-y-3 list-none">
                <li className="flex items-start gap-2">
                  <span className="font-black shrink-0">•</span>
                  <div>
                    <strong>Lead Generation</strong><br />
                    Identify and develop potential business opportunities through networking, referrals, field visits, and digital channels.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black shrink-0">•</span>
                  <div>
                    <strong>Product Demonstration</strong><br />
                    Conduct professional product presentations and demonstrations, both physical and virtual, to prospective clients.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black shrink-0">•</span>
                  <div>
                    <strong>Sales Closure & Client Onboarding</strong><br />
                    Convert prospects into customers and ensure a smooth onboarding process, including documentation and account setup.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black shrink-0">•</span>
                  <div>
                    <strong>Product Implementation & Training</strong><br />
                    Coordinate and support onsite implementation of the software and provide initial user training to client stakeholders.
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <Footer />
        </div>

        {/* PAGE 4 */}
        <div className="agreement-page bg-white p-10 pr-12 pl-12 box-border flex flex-col justify-between" style={getPageStyle()}>
          <Watermark />
          <div className="relative z-10 flex-grow">
            <Header />
            <div className="space-y-4 text-justify">
              <ul className="space-y-3 list-none">
                <li className="flex items-start gap-2">
                  <span className="font-black shrink-0">•</span>
                  <div>
                    <strong>Sales Development & Review Meetings</strong><br />
                    Participate in weekly and monthly sales review meetings to track progress, discuss opportunities, and achieve business goal.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black shrink-0">•</span>
                  <div>
                    <strong>Initial Payment Collection after Registration</strong><br />
                    Facilitate the collection of the first payment as per the assigned pricing structure based on student strength.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black shrink-0">•</span>
                  <div>
                    <strong>Client Relationship Management</strong><br />
                    Build and maintain strong client relationships to ensure customer satisfaction, retention, and business growth.
                  </div>
                </li>
              </ul>
              
              <h3 className="font-black text-slate-900 text-xs pt-2">6. Support by the Company</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>The Company shall provide product training and orientation to the Associate Partner as required.</li>
                <li>Marketing materials, brochures, presentations, and other promotional resources may be provided by the Company from time to time.</li>
                <li>The Company shall extend reasonable pre-sales and post-sales support for customer onboarding and implementation if required.</li>
                <li>Technical support related to the Company's products and services shall be provided through the designated support channels.</li>
                <li>The Company may conduct periodic meetings, webinars, workshops, or training sessions to enhance the Associate Partner's product knowledge and business development capabilities.</li>
                <li>The Company shall provide commission statements and business performance reports through the designated partner portal or communication channels.</li>
                <li>Any additional support shall be provided at the sole discretion of the Company and may be modified, suspended, or withdrawn without prior notice.</li>
              </ul>
              
              <h3 className="font-black text-slate-900 text-xs pt-2">7. COMMISSION & INCENTIVE</h3>
              <p>The Partner shall be entitled to receive commission on successful on-boarding, implementation and first collection completed through the Partner's efforts.</p>
              
              <p className="font-bold text-slate-950 text-[11px]">Commission Structure:</p>
              <p className="italic text-indigo-600 font-semibold pl-2">Life-time Recurring Commission</p>
              
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Initial Commission</strong>
                  <ul className="list-disc pl-4 mt-0.5">
                    <li>The Associate Partner shall be entitled to a <strong>10% commission</strong> on the <strong>total amount collected</strong> from the client for the first <strong>12 months</strong> from the date of onboarding.</li>
                  </ul>
                </li>
                <li>
                  <strong>Recurring Commission</strong>
                  <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                    <li>From the <strong>13th month onwards</strong>, the Associate Partner shall be entitled to a <strong>5% commission</strong> payable <strong>monthly at proportion rate on the relevant total collection amount</strong>.</li>
                    <li>Such commission shall be calculated and paid on a <strong>monthly prorated basis</strong>, subject to the continuation of the client agreement and receipt of payment from the client.</li>
                  </ul>
                </li>
                <li>
                  <strong>Commission Validity</strong>
                  <ul className="list-disc pl-4 mt-0.5">
                    <li>The recurring commission shall continue for as long as the client relationship remains active and the client continues to make payments under the agreement.</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
          <Footer />
        </div>

        {/* PAGE 5 */}
        <div className="agreement-page bg-white p-10 pr-12 pl-12 box-border flex flex-col justify-between" style={getPageStyle()}>
          <Watermark />
          <div className="relative z-10 flex-grow">
            <Header />
            <div className="space-y-4 text-justify">
              <p className="font-bold text-slate-950 text-[11px]">ADDITIONAL INCENTIVE & REWARD PROGRAMS</p>
              
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Additional Commission</strong>
                  <ul className="list-disc pl-4 mt-0.5">
                    <li>The Management may announce additional monetary incentive commissions percentage based on performance, and special promotional schemes from time to time with a specified validity period. Such programs may include Festival Offers, Sales Competitions, Collection Incentives, Performance-Based Rewards, Growth Achievement Awards, or any other special schemes as determined by the Company. The applicable incentive percentage, eligibility criteria, terms, and validity period shall be communicated separately by the Management.</li>
                  </ul>
                </li>
                <li>
                  <strong>International Tour</strong>
                  <ul className="list-disc pl-4 mt-0.5">
                    <li>Eligible Associate Partners who achieve predefined performance milestones may also qualify for special rewards, including domestic or international tour packages, recognition programs, and other non-monetary benefits, subject to the terms and conditions announced by the Company from time to time.</li>
                  </ul>
                </li>
              </ol>
              
              <p className="font-bold">Commission shall be payable only after:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Receipt of full payment from the customer.</li>
                <li>Successful implementation and onboarding.</li>
                <li>Completion of required documentation.</li>
              </ul>
              <p>The Company reserves the right to revise commission structures by providing prior written notice.</p>
              
              <h3 className="font-black text-slate-900 text-xs pt-2">8. PAYMENT TERMS</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Commission payments shall be processed after receipt of customer payment and payment request raised by Associate partner from respective Partner portal.</li>
                <li>Applicable TDS and statutory deductions shall be deducted as per law.</li>
                <li>The Partner shall provide valid bank account details and tax information along with KYC details.</li>
                <li>The renewal of KYC must be done once in every year.</li>
              </ul>
              
              <h3 className="font-black text-slate-900 text-xs pt-2">9. CONFIDENTIALITY</h3>
              <p>The Partner agrees not to disclose any of the followings during or after the term of this Agreement:</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 list-disc pl-5">
                <li>Customer database</li>
                <li>Pricing structure</li>
                <li>Product architecture</li>
                <li>Source code</li>
                <li>Business strategies</li>
                <li>Marketing plans</li>
                <li>Internal documents</li>
              </ul>
              <p>This obligation shall survive termination of the Agreement and punishable under IPC Act.</p>
            </div>
          </div>
          <Footer />
        </div>

        {/* PAGE 6 */}
        <div className="agreement-page bg-white p-10 pr-12 pl-12 box-border flex flex-col justify-between" style={getPageStyle()}>
          <Watermark />
          <div className="relative z-10 flex-grow">
            <Header />
            <div className="space-y-4 text-justify">
              <h3 className="font-black text-slate-900 text-xs">10. INTELLECTUAL PROPERTY RIGHTS</h3>
              <p>All intellectual property rights relating to:</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 list-disc pl-5">
                <li>NXTGN Brand</li>
                <li>Logos</li>
                <li>Trademarks</li>
                <li>Software Codes</li>
                <li>Documentation</li>
                <li>Copyright</li>
                <li>Marketing Materials</li>
              </ul>
              <p>shall remain the exclusive property of AIM Digitalise Pvt. Ltd.</p>
              <p>The Partner shall not claim ownership over any such intellectual property.</p>
              
              <h3 className="font-black text-slate-900 text-xs pt-2">11. TERM OF AGREEMENT</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>This Agreement shall remain valid until and unless the termination by eighter party.</li>
                <li>To maintain an active partnership status, the Associate Partner must onboard a minimum of three (3) products within every consecutive six (6) month period. Non-compliance may lead to deactivation or termination of the partnership agreement by the Company.</li>
              </ul>
              
              <h3 className="font-black text-slate-900 text-xs pt-2">12. TERMINATION</h3>
              <p>Either Party may terminate this Agreement by providing <strong>30 days' written notice</strong>.</p>
              <p>The Company may terminate the Agreement immediately if:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Partner engages in fraud or misconduct.</li>
                <li>Confidential information is disclosed.</li>
                <li>False commitments are made to customers.</li>
                <li>The Company's reputation is adversely affected.</li>
              </ul>
              
              <p>Upon termination:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>All Company materials shall be returned.</li>
                <li>Pending commissions, if any, shall be settled as per Company policy.</li>
                <li>The Associate Partner shall have no claim, right, or interest over the Company's brand name, products, intellectual property, customer database, business information, or any proprietary assets after termination.</li>
                <li>The Associate Partner shall not be entitled to claim any compensation, damages, goodwill value, future commissions, employment benefits, or any other financial or non-financial benefits arising from the termination of this Agreement.</li>
              </ul>
            </div>
          </div>
          <Footer />
        </div>

        {/* PAGE 7 */}
        <div className="agreement-page bg-white p-10 pr-12 pl-12 box-border flex flex-col justify-between" style={getPageStyle()}>
          <Watermark />
          <div className="relative z-10 flex-grow">
            <Header />
            <div className="space-y-4 text-justify">
              <h3 className="font-black text-slate-900 text-xs">13. INDEMNITY</h3>
              <p>The Partner shall indemnify and hold harmless AIM Digitalise Pvt. Ltd. from any loss, claim, damage, liability, or expense arising from:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Unauthorized representations.</li>
                <li>Violation of applicable laws.</li>
                <li>Breach of this Agreement.</li>
              </ul>
              
              <h3 className="font-black text-slate-900 text-xs pt-2">14. GOVERNING LAW & JURISDICTION</h3>
              <p>This Agreement shall be governed by and construed in accordance with the laws of India. Any dispute arising out of this Agreement shall be subject to the exclusive jurisdiction of the courts at <strong>Kolkata, West Bengal</strong>.</p>
              
              <h3 className="font-black text-slate-900 text-xs pt-2">15. ENTIRE AGREEMENT</h3>
              <p>This Agreement constitutes the entire understanding between the Parties and supersedes all previous communications, discussions, and understandings relating to the subject matter. Any amendment shall be valid only if made in writing and signed by both Parties.</p>
              
              <h4 className="text-center text-xs font-black text-slate-900 uppercase tracking-wider mt-6 mb-4">SIGNATURES</h4>
              
              <div className="grid grid-cols-2 gap-8 text-[10px]">
                <div className="space-y-2">
                  <p className="font-bold text-slate-950">For AIM Digitalise Pvt. Ltd.</p>
                  <p className="pt-1 text-[9px] text-slate-500">Authorized Signatory</p>
                  <p className="flex items-center gap-1">
                    <span>Name:</span>
                    <span className="font-bold text-slate-900 underline">Sabyasachi Pal</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <span>Designation:</span>
                    <span className="font-medium text-slate-800 underline">Managing Director</span>
                  </p>
                  <div className="flex items-center gap-1 py-1">
                    <span>Signature:</span>
                    <div className="inline-flex items-center justify-center border border-indigo-100 rounded px-2 py-0.5 bg-indigo-50/50 select-none">
                      <span style={{ fontFamily: "'Brush Script MT', cursive, sans-serif", fontSize: '13px', color: '#1e3a8a', letterSpacing: '0.5px' }}>Sabyasachi Pal</span>
                    </div>
                  </div>
                  <p className="flex items-center gap-1">
                    <span>Date:</span>
                    <span className="font-semibold text-slate-800 underline">{fullDateStr}</span>
                  </p>
                  <div className="flex items-start gap-2 pt-1">
                    <span className="mt-2.5">Seal:</span>
                    <div className="inline-flex flex-col items-center justify-center border-2 border-indigo-700/60 rounded-full w-[54px] h-[54px] p-0.5 text-center bg-indigo-50/20 select-none shadow-sm">
                      <span className="text-[5.5px] font-black uppercase text-indigo-700 leading-none tracking-tight">AIM DIGITALISE</span>
                      <span className="text-[4.5px] text-indigo-600/80 leading-none font-bold">PVT. LTD.</span>
                      <span className="text-[4.5px] text-indigo-500 leading-none font-black mt-0.5">KOLKATA</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-950">Partner’ Organization</p>
                  <p className="pt-2 font-bold text-blue-900 underline">{orgName}</p>
                  <p>Name: <span className="font-bold text-blue-900 underline">{partnerName}</span></p>
                  <p>Email: <span className="font-bold text-blue-900 underline">{partnerData?.email || '________________'}</span></p>
                  <p>Contact No: <span className="font-bold text-blue-900 underline">{partnerData?.contact_no || '________________'}</span></p>
                  <p>Address: <span className="text-[9.5px] text-blue-900 underline block leading-tight">{fullAddress}</span></p>
                  <p>Signature: ______________________</p>
                  <p>Date: <span className="font-bold text-blue-900 underline">{fullDateStr}</span></p>
                  <p>Seal: <span className="font-bold text-blue-900 underline">{orgName}</span></p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 pt-6 text-[10px] border-t border-dashed border-slate-200 mt-6">
                <div>
                  <p className="font-bold text-slate-950">Witness 1</p>
                  <p className="mt-3 flex items-center gap-1">
                    <span>Name:</span>
                    <span className="font-bold text-slate-900 underline">Shyamal Dutta</span>
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <span>Signature:</span>
                    <div className="inline-flex items-center justify-center border border-indigo-100 rounded px-2 py-0.5 bg-indigo-50/50 select-none">
                      <span style={{ fontFamily: "'Brush Script MT', cursive, sans-serif", fontSize: '13px', color: '#1e3a8a', letterSpacing: '0.5px' }}>Shyamal Dutta</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-slate-950">Witness 2</p>
                  <p className="mt-4">Name: _________________________</p>
                  <p className="mt-1">Signature: _____________________</p>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>

      </div>
    </div>
  )
}

export default AgreementDoc
