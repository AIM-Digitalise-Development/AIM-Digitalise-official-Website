/**
 * agreementFiller.js
 * Frontend helper to dynamically load pdf-lib and fill partner agreement PDF.
 */

// Dynamically load pdf-lib from CDN
export const loadPdfLib = () => {
  return new Promise((resolve, reject) => {
    if (window.PDFLib) {
      resolve(window.PDFLib)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js'
    script.onload = () => resolve(window.PDFLib)
    script.onerror = () => reject(new Error('Failed to load pdf-lib from CDN'))
    document.body.appendChild(script)
  })
}

/**
 * Fills the partner agreement PDF template with details provided in Step 1.
 * 
 * @param {string} pdfUrl - The download URL of the original PDF agreement.
 * @param {Object} partnerData - Partner details returned by Step 1 registration API or form state.
 * @returns {Promise<Blob>} - The filled PDF document as a Blob.
 */
export const fillPartnerAgreement = async (pdfUrl, partnerData) => {
  if (!partnerData) {
    throw new Error('No partner details provided to fill the agreement')
  }

  // Load pdf-lib
  const PDFLib = await loadPdfLib()
  const { PDFDocument, rgb, StandardFonts } = PDFLib

  // Fetch original PDF bytes
  const response = await fetch(pdfUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch original agreement PDF: ${response.statusText}`)
  }
  const existingPdfBytes = await response.arrayBuffer()

  // Load PDF document
  const pdfDoc = await PDFDocument.load(existingPdfBytes)

  // Embed font
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Get pages
  const pages = pdfDoc.getPages()
  if (pages.length === 0) {
    throw new Error('PDF has no pages')
  }

  const firstPage = pages[0]
  const lastPage = pages[pages.length - 1]

  // Prepare filled fields
  const today = new Date()
  const dayStr = String(today.getDate()).padStart(2, '0')
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const monthStr = months[today.getMonth()]
  const yearStr = String(today.getFullYear()).slice(-2)
  const fullDateStr = `${dayStr} ${monthStr} 20${yearStr}`

  // Format full address
  const addr2 = partnerData.address_line2 ? `, ${partnerData.address_line2}` : ''
  const fullAddress = `${partnerData.address_line1}${addr2}, ${partnerData.district}, ${partnerData.state} - ${partnerData.pin_code}`

  // TEXT DRAWING CONFIGURATION (using dark navy/black for filled details)
  const textColor = rgb(0.07, 0.15, 0.3) // dark navy
  const fontSizeNormal = 10
  const fontSizeSmall = 8

  // --- PAGE 1 DRAWINGS ---
  // Line 1: "This Agreement is made on this ___ day of _______, 20"
  // Draw Day (e.g. "26")
  firstPage.drawText(dayStr, {
    x: 252,
    y: 621,
    size: fontSizeNormal,
    font: helveticaFont,
    color: textColor,
  })

  // Draw Month (e.g. "June")
  firstPage.drawText(monthStr, {
    x: 320,
    y: 621,
    size: fontSizeNormal,
    font: helveticaFont,
    color: textColor,
  })

  // Draw Year (e.g. "26")
  firstPage.drawText(yearStr, {
    x: 405,
    y: 621,
    size: fontSizeNormal,
    font: helveticaFont,
    color: textColor,
  })

  // Line 2: "Partner’ Organization ------------------------------------------"
  if (partnerData.organization_name) {
    firstPage.drawText(partnerData.organization_name, {
      x: 185,
      y: 496,
      size: fontSizeNormal,
      font: helveticaFont,
      color: textColor,
    })
  }

  // Line 3: "in the name of Mr./Ms./M/s _________ ______________________, having its office at ..."
  // Draw Partner Name (we start on the blank line of the continuation line)
  if (partnerData.partner_name) {
    firstPage.drawText(partnerData.partner_name, {
      x: 60,
      y: 477,
      size: fontSizeNormal,
      font: helveticaFont,
      color: textColor,
    })
  }

  // Draw Address
  if (fullAddress) {
    // If address is extremely long, use a smaller font size
    const addrSize = fullAddress.length > 55 ? fontSizeSmall : fontSizeNormal
    firstPage.drawText(fullAddress, {
      x: 315,
      y: 477,
      size: addrSize,
      font: helveticaFont,
      color: textColor,
    })
  }


  // --- PAGE 7 (LAST PAGE) SIGNATURES ---
  // Left Column (Authorized Signatory)
  // (Optional: can fill AIM details if needed, but usually signed by hand)

  // Right Column (Partner details under signatures)
  // Name: _________________________
  if (partnerData.partner_name) {
    lastPage.drawText(partnerData.partner_name, {
      x: 425,
      y: 596,
      size: fontSizeNormal,
      font: helveticaFont,
      color: textColor,
    })
  }

  // Address: _________________
  if (fullAddress) {
    const addrSize = fullAddress.length > 40 ? fontSizeSmall : fontSizeNormal
    lastPage.drawText(fullAddress, {
      x: 435,
      y: 562,
      size: addrSize,
      font: helveticaFont,
      color: textColor,
    })
  }

  // Date: _____________________
  lastPage.drawText(fullDateStr, {
    x: 415,
    y: 495,
    size: fontSizeNormal,
    font: helveticaFont,
    color: textColor,
  })

  // Save the PDF document to bytes
  const pdfBytes = await pdfDoc.save()

  // Return as Blob
  return new Blob([pdfBytes], { type: 'application/pdf' })
}
