import os

leads_path = r"d:\AIM-Digitalise-official-Website\frontend\src\pages\partner\Leads.jsx"

with open(leads_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
old_api_import = """  createPartnerGeneralClient,
  updatePartnerGeneralClient,
  getPartnerGeneralClients,
  getPartnerGeneralServices
} from '../../api/partner'"""

new_api_import = """  createPartnerGeneralClient,
  updatePartnerGeneralClient,
  getPartnerGeneralClientById,
  getPartnerGeneralClients,
  getPartnerGeneralServices,
  createPartnerQuotation,
  updatePartnerQuotation,
  sendPartnerQuotationEmail,
  getPartnerClientQuotations,
  recordPartnerQuotationPayment
} from '../../api/partner'
import companyLogo from '../../assets/images/logo.png'
import payQrCode from '../../assets/images/payqr.png'"""

if old_api_import in content:
    content = content.replace(old_api_import, new_api_import)

# 2. Add numberToIndianWords helper if missing
words_helper = """
const numberToIndianWords = (num) => {
  if (!num || isNaN(num)) return 'Rupees Zero Only'
  const n = Math.round(Number(num))
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const inWords = (count) => {
    if (count < 20) return a[count]
    return b[Math.floor(count / 10)] + (count % 10 !== 0 ? ' ' + a[count % 10] : '')
  }
  let str = ''
  let crore = Math.floor(n / 10000000)
  let lakh = Math.floor((n % 10000000) / 100000)
  let thousand = Math.floor((n % 100000) / 1000)
  let hundred = Math.floor((n % 1000) / 100)
  let rest = n % 100
  if (crore > 0) str += inWords(crore) + ' Crore '
  if (lakh > 0) str += inWords(lakh) + ' Lakh '
  if (thousand > 0) str += inWords(thousand) + ' Thousand '
  if (hundred > 0) str += inWords(hundred) + ' Hundred '
  if (rest > 0) str += (str !== '' ? 'and ' : '') + inWords(rest) + ' '
  return 'Rupees ' + (str.trim() || 'Zero') + ' Only'
}
"""

if "numberToIndianWords" not in content:
    content = content.replace("export const isGeneralClientLead", words_helper + "\nexport const isGeneralClientLead")

# 3. Add Quotation state variables
old_state_anchor = "  const [loadingGeneralServices, setLoadingGeneralServices] = useState(false)"

new_state_additions = """  const [loadingGeneralServices, setLoadingGeneralServices] = useState(false)

  // Quotations List & Proforma Invoice Viewer State
  const [showQuotationsListModal, setShowQuotationsListModal] = useState(false)
  const [selectedClientQuotations, setSelectedClientQuotations] = useState([])
  const [showQuotationDocModal, setShowQuotationDocModal] = useState(false)
  const [viewingQuotationDoc, setViewingQuotationDoc] = useState(null)
  const [copiedPayLink, setCopiedPayLink] = useState(false)
  const [loadingQuotations, setLoadingQuotations] = useState(false)

  // Payment Recording Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentQuotation, setPaymentQuotation] = useState(null)
  const [paymentForm, setPaymentForm] = useState({
    payment_amount: '',
    payment_date: new Date().toISOString().substring(0, 10),
    payment_mode: 'Bank Transfer',
    transaction_reference: '',
    notes: 'Offline payment recorded via Partner Portal'
  })
  const [recordingPayment, setRecordingPayment] = useState(false)

  // Quotation Builder State
  const [showQuotationBuilder, setShowQuotationBuilder] = useState(false)
  const [editingQuotationId, setEditingQuotationId] = useState(null)
  const [savingQuotation, setSavingQuotation] = useState(false)
  const [selectedGenClient, setSelectedGenClient] = useState(null)

  const [quotationForm, setQuotationForm] = useState({
    quotation_number: '',
    quotation_date: new Date().toISOString().split('T')[0],
    po_number: '',
    po_date: '',
    gst_type: 'Intra-State',
    gstin: '',
    payment_terms: 'Full payments in Advanced',
    discount_description: 'Corporate Consideration',
    anexture: 'NO',
    anexture_content: '',
  })
  const [quotationItems, setQuotationItems] = useState([])"""

if old_state_anchor in content and "showQuotationDocModal" not in content:
    content = content.replace(old_state_anchor, new_state_additions)

# 4. Add action buttons in table row
old_action_buttons = """                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">"""

new_action_buttons = """                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {isGeneralClientLead(lead) && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenQuotationBuilder(lead)}
                                title="Create Quotation"
                                className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer transition shadow-xs"
                              >
                                <span>📝</span>
                                <span>+ Quotation</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleViewClientQuotations(lead)}
                                title="View Client Quotations"
                                className="text-[10px] font-bold text-blue-400 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer transition shadow-xs"
                              >
                                <span>📋</span>
                                <span>Quotes</span>
                              </button>
                            </>
                          )}"""

if old_action_buttons in content:
    content = content.replace(old_action_buttons, new_action_buttons)

with open(leads_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Imports, state, and buttons updated!")
