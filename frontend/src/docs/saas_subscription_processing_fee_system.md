# AIM Digitalise — SaaS & Subscription Processing Fee Payment System (Consolidated Architecture & Codebase)

> **Important Architecture Clarification (Dynamic vs. Static):**  
> Products, country pricing (INR, NPR, BTN), processing fees, and tax rates in this system are **100% Dynamic**. They are stored in the database, managed dynamically through the Admin Control Panel, and fetched at runtime via the public API based on the visitor's detected country (`GET /public/subcategories-with-products?country=IN|NP|BT`).  
> The hardcoded `subscriptionPlans` array in the frontend code is **strictly an initial client-side fallback / bootstrap placeholder** to ensure instant hydration before the live API response loads.

---

## 1. Dynamic Architecture & Data Flow Diagram

```
+-----------------------------------------------------------------------------------+
|                            DATABASE & ADMIN CONTROL PANEL                         |
|                                                                                   |
|  - Products Table (Base INR Processing Fee & Monthly Fee)                         |
|  - Country Prices Table (Overrides for NP/NPR, BT/BTN, IN/INR)                    |
|  - Country Taxes Table (IN 18% GST, NP 13% VAT, BT 7% Sales Tax)                  |
|  - Admin Endpoints:                                                               |
|      • POST /api/admin/products/{id}/country-price                                |
|      • PUT  /api/admin/country-taxes/{id}                                         |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                           DYNAMIC PUBLIC API ENDPOINT                             |
|                                                                                   |
|   GET /public/subcategories-with-products?country=IN | NP | BT                    |
|   Returns: Live category catalog, country-overridden processing fees,             |
|            currency symbols (₹, Rs, Nu), and localized tax rates.                 |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                         CLIENT-SIDE BROWSER EXECUTION                             |
|                                                                                   |
|  1. Geo-IP Detection: Automatically resolves visitor to 'IN', 'NP', or 'BT'       |
|  2. API Fetch: Calls /public/subcategories-with-products?country={detectedCountry}|
|  3. Dynamic Overwrite: Overwrites initial fallback state with live DB data        |
|  4. Processing Fee Calculation: Math.round(processing_fee * (1 + tax_rate/100))  |
|  5. Checkout Order: POST /public/create-order -> Razorpay Gateway -> Verification |
+-----------------------------------------------------------------------------------+
```

---

## 2. Multi-Country & Dynamic Currency Tax Matrix

The backend database contains dynamic tax rules and currency configurations for South Asian markets:

| Country | Code | Currency Code | Currency Symbol | Tax Name | Standard Tax Rate | Tax ID Label | Form Payload Field |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **India** | `IN` | `INR` | `₹` | GST | `18.0%` (Configurable) | GSTIN | `gstin` |
| **Nepal** | `NP` | `NPR` | `Rs` / `NRs` | VAT | `13.0%` (Configurable) | PAN / VAT No | `vat_pan_number` |
| **Bhutan** | `BT` | `BTN` | `Nu` | Sales Tax | `7.0%` (Configurable) | TPN / BIT | `vat_pan_number` |

---

## 3. Dynamic Product Catalog & Live Database Schema

In the live database and API responses, products are categorized into 5 subcategories with dynamic attributes:

### Dynamic Product Data Structure (JSON Schema returned by API):
```json
{
  "id": 9,
  "name": "NEXGN Accounts & Billing",
  "category_id": 1,
  "sub_category_id": 1,
  "sub_category_name": "SaaS Based CLOUD",
  "processing_fee": 2000,
  "monthly_subscription": 799,
  "per_person": false,
  "country_code": "IN",
  "tax": {
    "country_code": "IN",
    "country_name": "India",
    "currency": "INR",
    "currency_symbol": "₹",
    "tax_name": "GST",
    "tax_rate": 18.0,
    "tax_label": "18% GST"
  },
  "discounts": {
    "monthly": 0,
    "quarterly": 5,
    "half_yearly": 10,
    "annual": 15
  },
  "description": "Complete cloud invoicing, purchase orders, expenses, and ledger system.",
  "customization": "Custom invoice templates, barcode scanning, multi-currency support.",
  "complimentary": "Free ESS software for one year.",
  "support": "Dedicated Relationship Manager Assigned"
}
```

### Products Handled by the Payment & Processing Fee Engine:
1. **SaaS Based CLOUD (NEXGN Suite)**:
   - NEXGN Accounts & Billing (Processing Fee + Monthly Recurring)
   - NEXGN Payroll (Processing Fee + Monthly Recurring)
   - NEXGN ERP Pro (Processing Fee + Monthly Recurring)
   - NEXGN ERP Premium Plus (Processing Fee + Monthly Recurring)
   - NEXGN Hotel Pro (Processing Fee + Monthly Recurring)
   - NEXGN Hospital Plus (Processing Fee + Monthly Recurring)
   - NEXGN Institute Pro (Processing Fee + **Dynamic Student Count Multiplier**: `monthly_rate * total_students`)
   - NEXGN Parking Pro (Processing Fee + Monthly Recurring)
2. **Static Web Products**:
   - Single Page Basic Corporate Look Website
   - Static Informative Corporate Look Website
3. **Dynamic Web Products**:
   - Dynamic Informative Corporate Look Website
   - Dynamic Tool-Base Corporate Look Website
4. **E-Commerce Web Products**:
   - E-Commerce Single Seller Website
   - E-Commerce Multi-Seller Market Place
5. **Mobile Applications**:
   - Android Mobile Application
   - Android + iOS Mobile Application

---

## 4. Dynamic API Integration Layer (`src/api/purchase.js`)

This module communicates with the backend to fetch live products, create gateway orders, and verify signatures:

```javascript
/**
 * purchase.js
 * Public purchase API — no auth token required.
 * Base URL: https://api.nexgn.in/api
 */
import client from './client'

/**
 * Fetch live products and subcategories dynamically for a given country (IN, NP, BT)
 * GET /public/subcategories-with-products?country=IN|NP|BT
 */
export const fetchSubcategoriesWithProducts = (country) =>
  client.get('/public/subcategories-with-products' + (country ? `?country=${country}` : '')).then((r) => r.data)

/**
 * Fetch available Relationship Managers / Partners
 * GET /public/partners
 */
export const fetchPartners = () =>
  client.get('/public/partners').then((r) => r.data)

/**
 * Create a dynamic Razorpay order with country currency (INR, NPR, BTN)
 * POST /public/create-order
 */
export const createOrder = (payload) =>
  client.post('/public/create-order', payload).then((r) => r.data)

/**
 * Verify payment signature after gateway transaction
 * POST /public/verify-payment
 */
export const verifyPayment = (payload) =>
  client.post('/public/verify-payment', payload).then((r) => r.data)
```

---

## 5. Dynamic Geo-IP Country Detection & Live Product Hydration

Extracted from `src/pages/website/SaasBasedSoftware.jsx`:

```javascript
// 1. Live Country Auto-Detection via Geo-IP
const [detectedCountry, setDetectedCountry] = useState('IN')

useEffect(() => {
  fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
      const code = data.country_code
      if (['IN', 'NP', 'BT'].includes(code)) {
        setDetectedCountry(code)
      } else {
        setDetectedCountry('IN')
      }
    })
    .catch(err => {
      console.error('GeoIP lookup failed, defaulting to IN:', err)
      setDetectedCountry('IN')
    })
}, [])

// 2. Fetch Live Dynamic Product Catalog with Country Overrides & Symbols
useEffect(() => {
  setLoadingProducts(true)
  purchaseApi.fetchSubcategoriesWithProducts(detectedCountry)
    .then(result => {
      if (result.success && result.data?.length) {
        const allProducts = []

        const mapCategory = (categoryName, categoryId) => {
          const name = (categoryName || '').toLowerCase()
          const id = Number(categoryId)
          if (name.includes('saas') || name.includes('nexgn') || id === 1) return 'nexgn'
          if (name.includes('static') || id === 2) return 'static'
          if (name.includes('dynamic') || id === 3) return 'dynamic'
          if (name.includes('e-commerce') || name.includes('ecommerce') || id === 4) return 'ecommerce'
          if (name.includes('mobile') || name.includes('android') || name.includes('ios') || id === 5) return 'mobile'
          return 'nexgn'
        }

        // Live formatting with currency symbols from DB: INR = ₹, NPR = Rs / NRs, BTN = Nu
        const formatSecurityDeposit = (fee, pObj) => {
          const symbol = pObj.tax?.currency_symbol || (detectedCountry === 'NP' ? 'Rs' : (detectedCountry === 'BT' ? 'Nu' : '₹'))
          return `${symbol}${fee}/-`
        }

        const formatMonthlySubscription = (sub, perPerson, pObj) => {
          const symbol = pObj.tax?.currency_symbol || (detectedCountry === 'NP' ? 'Rs' : (detectedCountry === 'BT' ? 'Nu' : '₹'))
          if (perPerson === true || perPerson === 1) return `${symbol}${sub}/-/student/month`
          return `${symbol}${sub}/-`
        }

        result.data.forEach(sub => {
          if (sub.products && Array.isArray(sub.products)) {
            sub.products.forEach(p => {
              allProducts.push({
                ...p,
                category: mapCategory(p.sub_category_name || sub.name, p.sub_category_id || sub.id),
                categoryLabel: (p.sub_category_name || sub.name || '').toUpperCase(),
                securityDeposit: formatSecurityDeposit(p.processing_fee, p),
                monthlySubscription: formatMonthlySubscription(p.monthly_subscription, p.per_person, p),
              })
            })
          }
        })

        // Live products state updated dynamically from Database
        if (allProducts.length) {
          setProducts(allProducts)
        }
      }
    })
    .catch(err => console.error('Failed to load live products from API:', err))
    .finally(() => setLoadingProducts(false))
}, [detectedCountry])
```

---

## 6. Dynamic Tax & Processing Fee Math

```javascript
// Tax Rate extracted from live API data (18% for IN, 13% for NP, 7% for BT)
const taxRate = activePlan.tax?.tax_rate ?? (detectedCountry === 'NP' ? 13 : (detectedCountry === 'BT' ? 7 : 18))
const currencySymbol = activePlan.tax?.currency_symbol || (detectedCountry === 'NP' ? 'Rs' : (detectedCountry === 'BT' ? 'Nu' : '₹'))

// 1. Base Processing Fee (Fetched dynamically from Database)
const baseFee = customProcessingFee || activePlan.processing_fee

// 2. Computed Tax Amount
const calculatedTaxAmount = Math.round(baseFee * (taxRate / 100))

// 3. Gross Total Processing Fee (Payable in Gateway)
const totalGrossProcessingFee = Math.round(baseFee * (1 + taxRate / 100))

// 4. Dynamic Student Count Multiplier (for Institute Pro ERP)
const totalStudents = parseInt(checkoutData.total_students, 10) || 0
const instituteMonthlyRecurring = (activePlan.monthly_subscription || 10) * totalStudents
```

---

## 7. Dynamic Gateway Checkout & Verification (Razorpay)

```javascript
const handleCheckoutSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)
  setApiError('')
  setValidationErrors({})
  setPaymentStep('processing')

  // Calculated gross processing fee inclusive of country tax
  const grossProcessingFee = Math.round(customProcessingFee * (1 + (activePlan.tax?.tax_rate || 18) / 100))

  const payload = {
    client_name: checkoutData.client_name,
    contact_number: checkoutData.contact_number,
    email: checkoutData.email,
    partner_id: checkoutData.partner_id,
    district: checkoutData.district,
    state: checkoutData.state,
    pin_code: checkoutData.pin_code,
    address: checkoutData.address,
    product_id: activePlan.id,
    product_name: activePlan.name,
    product_category: activePlan.category,
    country_code: detectedCountry, // 'IN', 'NP', or 'BT'
    processing_fee: grossProcessingFee,
    monthly_subscription: customMonthlySubscription,
  }

  // Country Tax ID mapping
  if (detectedCountry === 'IN') {
    payload.gstin = checkoutData.gstin || null
    payload.vat_pan_number = null
  } else {
    payload.gstin = null
    payload.vat_pan_number = checkoutData.gstin || null
  }

  if (isInstitutePro) {
    payload.school_name = checkoutData.school_name
    payload.school_short_name = checkoutData.school_short_name
    payload.school_session = checkoutData.school_session
    payload.total_students = parseInt(checkoutData.total_students, 10)
  } else {
    payload.company_name = checkoutData.company_name || null
  }

  try {
    // 1. Dynamic Order Creation on Backend
    const orderResult = await purchaseApi.createOrder(payload)

    if (!orderResult.success) {
      setApiError(orderResult.message || 'Failed to create order.')
      setPaymentStep('form')
      setIsSubmitting(false)
      return
    }

    await loadRazorpayScript()

    // 2. Open Gateway Modal with Dynamic Currency (INR, NPR, BTN)
    const options = {
      key: orderResult.key,
      amount: Math.round(orderResult.amount * 100),
      currency: orderResult.currency, // Dynamic from backend order (e.g. 'INR', 'NPR', 'BTN')
      name: 'AIM Digitalise',
      description: `${activePlan.name} — Processing Fee`,
      order_id: orderResult.order_id,
      handler: async (response) => {
        // 3. Cryptographic Signature Verification
        const verifyResult = await purchaseApi.verifyPayment({
          order_id: orderResult.order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        })
        if (verifyResult.success) {
          setSuccessData(verifyResult)
          setPaymentStep('success')
        } else {
          setApiError(verifyResult.message || 'Payment verification failed.')
          setPaymentStep('form')
        }
        setIsSubmitting(false)
      },
      modal: {
        ondismiss: () => {
          setApiError('Payment was cancelled.')
          setPaymentStep('form')
          setIsSubmitting(false)
        },
      },
      prefill: {
        name: checkoutData.client_name,
        email: checkoutData.email,
        contact: checkoutData.contact_number,
      },
      theme: { color: '#2563eb' },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  } catch (err) {
    setApiError('Server error: ' + (err.response?.data?.message || err.message))
    setPaymentStep('form')
    setIsSubmitting(false)
  }
}
```

---

## 8. Admin Control Panel: Dynamic Country Pricing & Tax Management

In `src/pages/admin/Products.jsx`, administrators can dynamically set processing fees and tax rates per country:

```javascript
// 1. Dynamic Country Price Override Handler (Admin Panel)
const handleSaveCountryPrice = async (e) => {
  e.preventDefault()
  setCountryPriceSaving(true)
  try {
    const res = await updateProductCountryPrice(selectedProduct.id, {
      country_code: countryPriceForm.country_code, // 'NP', 'BT', 'IN'
      currency: countryPriceForm.currency,         // 'NPR', 'BTN', 'INR'
      processing_fee: Number(countryPriceForm.processing_fee),
      monthly_subscription: Number(countryPriceForm.monthly_subscription),
    })
    if (res.data?.success) {
      flashSuccess(`Custom ${countryPriceForm.country_code} pricing saved successfully!`)
      setShowCountryPriceModal(false)
      fetchProducts()
    }
  } catch (err) {
    flashError('Failed to save country price.')
  } finally {
    setCountryPriceSaving(false)
  }
}

// 2. Dynamic Country Tax Rate Update Handler (Admin Panel)
const handleSaveTax = async (e) => {
  e.preventDefault()
  setTaxSaving(true)
  try {
    const res = await updateAdminCountryTax(selectedTax.id, {
      tax_name: taxForm.tax_name,
      tax_rate: Number(taxForm.tax_rate),
      is_active: taxForm.is_active,
    })
    if (res.data?.success) {
      flashSuccess('Tax rate updated successfully!')
      setShowTaxModal(false)
      fetchCountryTaxes()
    }
  } catch (err) {
    flashError('Failed to update tax.')
  } finally {
    setTaxSaving(false)
  }
}
```

---

## 9. Frontend File Reference Summary

| Purpose | File Path |
| :--- | :--- |
| **Live SaaS Software Storefront & Checkout** | [`frontend/src/pages/website/SaasBasedSoftware.jsx`](file:///c:/Users/Fusionit/Desktop/AIM-Digitalise-official-Website/frontend/src/pages/website/SaasBasedSoftware.jsx) |
| **Live Monthly Subscription Storefront** | [`frontend/src/pages/website/MonthlySubscription.jsx`](file:///c:/Users/Fusionit/Desktop/AIM-Digitalise-official-Website/frontend/src/pages/website/MonthlySubscription.jsx) |
| **Public Purchase & Gateway API Layer** | [`frontend/src/api/purchase.js`](file:///c:/Users/Fusionit/Desktop/AIM-Digitalise-official-Website/frontend/src/api/purchase.js) |
| **Admin Dynamic Catalog & Country Price Overrides** | [`frontend/src/pages/admin/Products.jsx`](file:///c:/Users/Fusionit/Desktop/AIM-Digitalise-official-Website/frontend/src/pages/admin/Products.jsx) |
| **Admin Country Tax & Pricing API Methods** | [`frontend/src/api/admin/partners.js`](file:///c:/Users/Fusionit/Desktop/AIM-Digitalise-official-Website/frontend/src/api/admin/partners.js) |
| **Partner Multi-Country Rules & Subscriptions** | [`frontend/src/pages/partner/GeneralClients.jsx`](file:///c:/Users/Fusionit/Desktop/AIM-Digitalise-official-Website/frontend/src/pages/partner/GeneralClients.jsx) |
| **Employee Multi-Country Rules & Subscriptions** | [`frontend/src/pages/employee/GeneralClients.jsx`](file:///c:/Users/Fusionit/Desktop/AIM-Digitalise-official-Website/frontend/src/pages/employee/GeneralClients.jsx) |
