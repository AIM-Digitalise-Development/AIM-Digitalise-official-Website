$path = "d:\AIM-Digitalise-official-Website\frontend\src\pages\partner\Leads.jsx"

$content = [System.IO.File]::ReadAllText($path)

# 1. Imports
if (-not $content.Contains("getPartnerClientQuotations")) {
    $content = $content.Replace("getPartnerGeneralServices", "getPartnerGeneralServices,`n  getPartnerGeneralClientById,`n  createPartnerQuotation,`n  updatePartnerQuotation,`n  sendPartnerQuotationEmail,`n  getPartnerClientQuotations,`n  recordPartnerQuotationPayment")
}

if (-not $content.Contains("import companyLogo")) {
    $content = $content.Replace("import { usePartnerAuthStore }", "import companyLogo from '../../assets/images/logo.png'`nimport payQrCode from '../../assets/images/payqr.png'`nimport { usePartnerAuthStore }")
}

# 2. Add numberToIndianWords
$wordsHelper = @"

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
"@

if (-not $content.Contains("numberToIndianWords")) {
    $content = $content.Replace("export const isGeneralClientLead", $wordsHelper + "`nexport const isGeneralClientLead")
}

[System.IO.File]::WriteAllText($path, $content)
Write-Host "PS1_UPDATE_SUCCESS"
