import { useState, useEffect, useRef } from 'react';

const API_URL = 'https://api.nexgn.in/api';

const ClientPortal = () => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [clientData, setClientData] = useState(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Data States
  const [profileData, setProfileData] = useState(null);
  const [productData, setProductData] = useState(null);
  
  // Product Pricing Info
  const [perPerson, setPerPerson] = useState(1);
  const [monthlySubscription, setMonthlySubscription] = useState(0);
  
  // Subscription States
  const [studentCount, setStudentCount] = useState(null);
  const [paymentCycles, setPaymentCycles] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState('annual');
  const [calculatedAmount, setCalculatedAmount] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPayNow, setShowPayNow] = useState(false);
  const [nextPaymentDate, setNextPaymentDate] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loadingPaymentStatus, setLoadingPaymentStatus] = useState(false);
  const [unpaidMonths, setUnpaidMonths] = useState([]);
  const [totalDueAmount, setTotalDueAmount] = useState(null);
  
  // Payment History State
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);
  
  // Customization Request States
  const [customizationRequests, setCustomizationRequests] = useState([]);
  const [loadingCustomizations, setLoadingCustomizations] = useState(false);
  const [customizationText, setCustomizationText] = useState('');
  const [submittingCustomization, setSubmittingCustomization] = useState(false);
  
  // Student Count Warning State
  const [studentCountWarning, setStudentCountWarning] = useState(null);
  const [hasZeroStudents, setHasZeroStudents] = useState(false);
  
  // Bill/Invoice State
  const [showBillModal, setShowBillModal] = useState(false);
  const [billData, setBillData] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoicePayment, setSelectedInvoicePayment] = useState(null);
  const billRef = useRef(null);

  // Add-on States
  const [addonPreview, setAddonPreview] = useState(null);
  const [addonHistory, setAddonHistory] = useState([]);
  const [loadingAddon, setLoadingAddon] = useState(false);
  const [selectedAddonType, setSelectedAddonType] = useState('Transportation');
  const [selectedIdCardType, setSelectedIdCardType] = useState('Type A');
  const [selectedRecipientType, setSelectedRecipientType] = useState('student');
  const [processingAddonPayment, setProcessingAddonPayment] = useState(false);
  const [addonCart, setAddonCart] = useState({ items: [], total_amount: 0, item_count: 0 });
  const [loadingCart, setLoadingCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [processingCartPayment, setProcessingCartPayment] = useState(false);
  const [processingUnifiedPayment, setProcessingUnifiedPayment] = useState(false);
  
  // Login Form
  const [loginData, setLoginData] = useState({
    client_id: '',
    password: ''
  });
  
  // Cycle order - Annual first, then Half Yearly, then Quarterly, then Monthly
  const cycleOrder = ['annual', 'half_yearly', 'quarterly', 'monthly'];
  
  // Cycle display names
  const cycleDisplayNames = {
    'annual': 'Annual',
    'half_yearly': 'Half Yearly',
    'quarterly': 'Quarterly',
    'monthly': 'Monthly'
  };
  
  // Check for saved token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('client_token');
    const savedClient = localStorage.getItem('client_data');
    if (savedToken && savedClient) {
      setToken(savedToken);
      setClientData(JSON.parse(savedClient));
      setIsLoggedIn(true);
      validateTokenAndFetch(savedToken);
    }
  }, []);
  
  // Validate token and fetch data
  const validateTokenAndFetch = async (authToken) => {
    try {
      // First check if token is valid
      const checkResponse = await fetch(`${API_URL}/client/check`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const checkResult = await checkResponse.json();
      
      if (!checkResult.success || !checkResult.authenticated) {
        // Token is invalid, clear it
        localStorage.removeItem('client_token');
        localStorage.removeItem('client_data');
        setIsLoggedIn(false);
        setToken(null);
        setClientData(null);
        setError('Session expired. Please login again.');
        return;
      }
      
      // Token is valid, fetch all data
      await Promise.all([
        fetchProfile(authToken),
        fetchMyProducts(authToken),
        fetchStudentCount(authToken),
        fetchPaymentCycles(authToken),
        fetchPaymentStatus(authToken),
        fetchPaymentHistory(authToken),
        fetchCustomizationRequests(authToken),
        fetchAddonPreview('Transportation', authToken),
        fetchAddonHistory(authToken),
        fetchAddonCart(authToken)
      ]);
      
    } catch (err) {
      console.error('Token validation error:', err);
    }
  };
  
  // Check token validity helper
  const checkTokenValidity = async () => {
    if (!token) return false;
    try {
      const response = await fetch(`${API_URL}/client/check`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      return result.success && result.authenticated;
    } catch (err) {
      console.error('Token check error:', err);
      return false;
    }
  };
  
  // Handle API response for 401
  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem('client_token');
      localStorage.removeItem('client_data');
      setIsLoggedIn(false);
      setToken(null);
      setClientData(null);
      setError('Session expired. Please login again.');
      return true;
    }
    return false;
  };
  
  // Fetch Client Profile
  const fetchProfile = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/client/profile`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      if (result.success) {
        setProfileData(result.data);
        // ✅ Store per_person and monthly_subscription from profile
        if (result.data.per_person !== undefined) {
          setPerPerson(result.data.per_person);
        }
        if (result.data.monthly_subscription !== undefined) {
          setMonthlySubscription(result.data.monthly_subscription);
        }
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  };
  
  // Fetch My Products
  const fetchMyProducts = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/client/my-products`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      if (result.success) {
        setProductData(result.data);
        // ✅ Store per_person from products
        if (result.data.per_person !== undefined) {
          setPerPerson(result.data.per_person);
        }
        if (result.data.monthly_subscription !== undefined) {
          setMonthlySubscription(result.data.monthly_subscription);
        }
      }
    } catch (err) {
      console.error('Products fetch error:', err);
    }
  };
  
  // Fetch Student Count from External Database
  const fetchStudentCount = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/client/student-count`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      if (result.success) {
        setStudentCount(result.data);
        const count = result.data.student_count;
        setHasZeroStudents(count === 0);
        if (count === 0) {
          setStudentCountWarning({
            show: true,
            message: 'No students found in your school database. You cannot make subscription payments until student records are added.',
            action_message: 'Please contact your school administrator to add student records to the system.',
            student_count: 0
          });
        } else {
          setStudentCountWarning(null);
        }
      }
    } catch (err) {
      console.error('Student count fetch error:', err);
    }
  };
  
  // Fetch Payment Cycles with Discounts
  const fetchPaymentCycles = async (authToken) => {
    setLoadingSubscription(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/client/payment-cycles`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      console.log('Payment cycles response:', result);
      
      if (result.success) {
        setPaymentCycles(result.data);
        // ✅ Update per_person from payment cycles response
        if (result.data.per_person !== undefined) {
          setPerPerson(result.data.per_person);
        }
        if (result.data.monthly_subscription !== undefined) {
          setMonthlySubscription(result.data.monthly_subscription);
        }
        const defaultCycle = result.data.is_extra_students_payment 
          ? (result.data.active_cycle || 'monthly') 
          : 'annual';
        calculateSubscriptionForCycle(defaultCycle, authToken);
        setStudentCountWarning(null);
      } else {
        if (result.error_code === 'NO_STUDENTS_FOUND') {
          setHasZeroStudents(true);
          setStudentCountWarning({
            show: true,
            message: result.message,
            action_message: result.data?.action_message || 'Please add student records to your school management system first.',
            student_count: 0
          });
          setError('');
        } else {
          setError(result.message || 'Failed to load payment options');
        }
      }
    } catch (err) {
      console.error('Payment cycles fetch error:', err);
      setError('Failed to load payment options: ' + err.message);
    } finally {
      setLoadingSubscription(false);
    }
  };
  
  // Fetch Payment History
  const fetchPaymentHistory = async (authToken) => {
    setLoadingPaymentHistory(true);
    try {
      const response = await fetch(`${API_URL}/client/payment-history`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      
      if (result.success) {
        setPaymentHistory(result.data);
      }
    } catch (err) {
      console.error('Payment history fetch error:', err);
    } finally {
      setLoadingPaymentHistory(false);
    }
  };
  
  // Fetch Customization Requests
  const fetchCustomizationRequests = async (authToken) => {
    setLoadingCustomizations(true);
    try {
      const response = await fetch(`${API_URL}/client/customization/requests`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      
      if (result.success) {
        const processedRequests = result.data.requests.map(req => {
          let amountValue = null;
          if (req.amount) {
            amountValue = typeof req.amount === 'string' ? parseFloat(req.amount) : req.amount;
          } else if (req.amount_value) {
            amountValue = typeof req.amount_value === 'string' ? parseFloat(req.amount_value) : req.amount_value;
          }
          
          return {
            ...req,
            amount: amountValue,
            amount_value: amountValue,
            amount_formatted: amountValue ? `₹ ${amountValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null,
          };
        });
        
        setCustomizationRequests(processedRequests);
      }
    } catch (err) {
      console.error('Customization requests fetch error:', err);
    } finally {
      setLoadingCustomizations(false);
    }
  };
  
  // Submit Customization Request
  const submitCustomizationRequest = async () => {
    if (!customizationText.trim() || customizationText.length < 10) {
      setError('Please enter at least 10 characters describing your customization needs');
      return;
    }
    
    setSubmittingCustomization(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/client/customization/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customization_text: customizationText })
      });
      
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Customization request submitted successfully!');
        setCustomizationText('');
        await fetchCustomizationRequests(token);
        setActiveTab('customization');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.message || 'Failed to submit customization request');
      }
    } catch (err) {
      console.error('Submit customization error:', err);
      setError('Failed to submit request: ' + err.message);
    } finally {
      setSubmittingCustomization(false);
    }
  };
  
  // Fetch Payment Status
  const fetchPaymentStatus = async (authToken) => {
    setLoadingPaymentStatus(true);
    try {
      const response = await fetch(`${API_URL}/client/payment-status`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      
      if (result.success) {
        setPaymentStatus(result.data);
        setShowPayNow(result.data.show_pay_now);
        setNextPaymentDate(result.data.next_payment_date);
        setDeliveryInfo(result.data.delivery_info);
        
        if (result.data.delivery_info) {
          if (result.data.delivery_info.unpaid_months) {
            setUnpaidMonths(result.data.delivery_info.unpaid_months);
          }
          if (result.data.delivery_info.total_due_amount) {
            setTotalDueAmount(result.data.delivery_info.total_due_amount);
          }
        }
      }
    } catch (err) {
      console.error('Payment status fetch error:', err);
    } finally {
      setLoadingPaymentStatus(false);
    }
  };
  
  // Calculate Subscription for Selected Cycle
  const calculateSubscriptionForCycle = async (cycle, authToken) => {
    setLoadingSubscription(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/client/calculate-subscription?cycle=${cycle}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      
      if (result.success) {
        setCalculatedAmount(result.data);
        setSelectedCycle(cycle);
        // ✅ Update per_person from calculation response
        if (result.data.product?.per_person !== undefined) {
          setPerPerson(result.data.product.per_person);
        }
        // Generate bill data when calculation is done
        generateBillData(result.data, cycle);
      } else {
        if (result.error_code === 'NO_STUDENTS_FOUND') {
          setHasZeroStudents(true);
          setStudentCountWarning({
            show: true,
            message: result.message,
            action_message: 'Please add student records to your school management system first.',
            student_count: 0
          });
        } else {
          setError(result.message || 'Failed to calculate subscription');
        }
      }
    } catch (err) {
      console.error('Calculation error:', err);
      setError('Failed to calculate subscription amount');
    } finally {
      setLoadingSubscription(false);
    }
  };
  
  // Generate Bill Data
  const generateBillData = (data, cycle) => {
    if (!data || !data.calculation) return;
    
    const calc = data.calculation;
    const isFirst = calc.is_first_payment;
    const perPersonValue = data.product?.per_person || 1;
    
    // Get values from calculation
    const baseMonthlyAmount = calc.base_monthly_amount || 0;
    const discountPercentage = calc.discount_percentage || 0;
    const cycleMonths = calc.cycle_months || 1;
    const carryoverFraction = calc.carryover_fraction || 0;
    const carryoverDays = calc.carryover_days || 0;
    const daysInMonth = calc.carryover_days_in_month || 30;
    const gstPercentage = calc.gst_percentage || 18;
    
    // Calculate discounted monthly amount
    const discountedMonthlyAmount = baseMonthlyAmount * (1 - discountPercentage / 100);
    
    // Calculate amounts
    const carryoverAmount = discountedMonthlyAmount * carryoverFraction;
    const regularMonthsAmount = discountedMonthlyAmount * cycleMonths;
    
    // Use backend-computed totals
    const totalAmount = calc.discounted_total !== undefined ? calc.discounted_total : (carryoverAmount + regularMonthsAmount);
    const gstAmount = calc.gst_amount !== undefined ? calc.gst_amount : (totalAmount * gstPercentage) / 100;
    const totalWithGST = calc.total_amount !== undefined ? calc.total_amount : (totalAmount + gstAmount);
    
    // Calculate original amounts for savings
    const baseCarryover = baseMonthlyAmount * carryoverFraction;
    const baseRegular = baseMonthlyAmount * cycleMonths;
    const baseTotal = calc.base_total !== undefined ? calc.base_total : (baseCarryover + baseRegular);
    const originalTotalWithGST = calc.original_total_amount !== undefined ? calc.original_total_amount : (baseTotal + (baseTotal * gstPercentage / 100));
    const savings = calc.savings !== undefined ? calc.savings : (baseTotal - totalAmount);
    const perDayAmount = carryoverDays > 0 ? discountedMonthlyAmount / daysInMonth : 0;
    
    // Get client and product info
    const clientName = data.client?.client_name || clientData?.name || '';
    const clientId = data.client?.client_id || clientData?.client_id || '';
    const schoolName = data.client?.school_name || '';
    const productName = data.product?.name || '';
    
    // Format dates
    const today = new Date();
    const invoiceDate = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Get period details
    let periodStart = '';
    let periodEnd = '';
    let deliveryDate = '';
    
    if (deliveryInfo) {
      if (deliveryInfo.current_period_start) {
        periodStart = new Date(deliveryInfo.current_period_start).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      if (deliveryInfo.current_period_end) {
        periodEnd = new Date(deliveryInfo.current_period_end).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      if (deliveryInfo.delivery_date) {
        deliveryDate = new Date(deliveryInfo.delivery_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    }
    
    // Build bill data
    const bill = {
      invoiceNumber,
      invoiceDate,
      clientName,
      clientId,
      schoolName,
      productName,
      cycle: cycleDisplayNames[cycle] || cycle,
      isFirstPayment: isFirst,
      perPerson: perPersonValue,
      periodStart,
      periodEnd,
      deliveryDate,
      studentCount: data.student_count || 0,
      baseMonthlyAmount,
      baseCarryover,
      baseRegular,
      baseTotal,
      originalTotalWithGST,
      discountedMonthlyAmount,
      carryoverFraction,
      carryoverDays,
      daysInMonth,
      carryoverAmount,
      regularMonthsAmount,
      totalAmount,
      discountPercentage,
      savings,
      gstPercentage,
      gstAmount,
      totalWithGST,
      perDayAmount,
      cycleMonths,
      monthlySubscription: data.product?.monthly_subscription || 0,
      extraStudentsOverdue: calc.extra_students_overdue || 0,
      isExtraStudentsPayment: calc.is_extra_students_payment || false,
    };
    
    setBillData(bill);
  };
  
  // Handle Cycle Selection
  const handleCycleChange = (cycle) => {
    if (hasZeroStudents && perPerson == 1) {
      setError('Cannot change payment cycle: No students found in your school database.');
      return;
    }
    calculateSubscriptionForCycle(cycle, token);
  };
  
  // Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  };
  
  // Helper function to refresh all subscription data after payment
  const refreshSubscriptionData = async () => {
    try {
      setLoadingSubscription(true);
      
      await Promise.all([
        fetchPaymentStatus(token),
        fetchPaymentHistory(token),
        fetchPaymentCycles(token),
        fetchStudentCount(token)
      ]);
      
      setCalculatedAmount(null);
      setSuccess('✅ Payment completed successfully! Redirecting to subscription page...');
      
      setTimeout(() => {
        setActiveTab('subscription');
        setSuccess('✅ Payment completed successfully!');
        setTimeout(() => setSuccess(''), 5000);
      }, 1500);
      
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Payment completed but error refreshing data. Please refresh the page.');
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Fetch Addon Preview
  const fetchAddonPreview = async (addonType, authToken, recipientType = null) => {
    setLoadingAddon(true);
    setError('');
    const finalRecipient = recipientType || selectedRecipientType;
    try {
      const response = await fetch(`${API_URL}/client/addon/preview?addon_type=${addonType}&recipient_type=${finalRecipient}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      if (result.success) {
        setAddonPreview(result.data);
      } else {
        setAddonPreview(null);
        setError(result.message || 'Failed to load add-on preview');
      }
    } catch (err) {
      console.error('Addon preview fetch error:', err);
      setError('Failed to load add-on preview: ' + err.message);
      setAddonPreview(null);
    } finally {
      setLoadingAddon(false);
    }
  };

  // Fetch Addon History
  const fetchAddonHistory = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/client/addon/history`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      if (result.success) {
        setAddonHistory(result.data);
      }
    } catch (err) {
      console.error('Addon history fetch error:', err);
    }
  };

  // Process Add-on Payment via Razorpay
  const processAddonPayment = async () => {
    if (!addonPreview) return;
    
    // Check token validity before proceeding
    const isValid = await checkTokenValidity();
    if (!isValid) {
      setError('Session expired. Please login again.');
      handleLogout();
      return;
    }
    
    const finalAddonType = selectedAddonType === 'id card' ? 'id card ' + selectedIdCardType : selectedAddonType;
    
    setProcessingAddonPayment(true);
    setError('');
    setSuccess('');
    
    try {
      // 1. Create Razorpay order
      const orderResponse = await fetch(`${API_URL}/client/addon/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          addon_type: finalAddonType,
          recipient_type: selectedRecipientType
        })
      });
      
      if (handleUnauthorized(orderResponse)) {
        setProcessingAddonPayment(false);
        return;
      }
      
      const orderResult = await orderResponse.json();
      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Failed to create payment order');
      }
      
      // 2. Handle simulation mode
      if (orderResult.simulated) {
        // Simulated Payment Verification
        const verifyResponse = await fetch(`${API_URL}/client/addon/verify-payment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            addon_type: finalAddonType,
            recipient_type: selectedRecipientType,
            order_id: orderResult.order_id,
            razorpay_payment_id: 'sim_pay_' + Math.floor(Math.random() * 1000000)
          })
        });
        
        const verifyResult = await verifyResponse.json();
        if (verifyResult.success) {
          setSuccess('✅ Simulating payment...\nPayment of ' + addonPreview.amount_formatted + ' for ' + finalAddonType + ' completed successfully!');
          fetchAddonPreview(finalAddonType, token, selectedRecipientType);
          fetchAddonHistory(token);
        } else {
          setError(verifyResult.message || 'Simulated verification failed');
        }
        setProcessingAddonPayment(false);
        return;
      }
      
      // 3. Real Payment Mode
      await loadRazorpayScript();
      
      const options = {
        key: orderResult.key,
        amount: Math.round(orderResult.amount * 100),
        currency: orderResult.currency,
        name: 'AIM Digitalise',
        description: `${finalAddonType} Add-on Service`,
        order_id: orderResult.order_id,
        handler: async function (response) {
          setProcessingAddonPayment(true);
          try {
            const verifyResponse = await fetch(`${API_URL}/client/addon/verify-payment`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                addon_type: finalAddonType,
                recipient_type: selectedRecipientType,
                order_id: orderResult.order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            const verifyResult = await verifyResponse.json();
            if (verifyResult.success) {
              setSuccess(`✅ Payment of ${addonPreview.amount_formatted} for ${finalAddonType} verified successfully!`);
              fetchAddonPreview(finalAddonType, token, selectedRecipientType);
              fetchAddonHistory(token);
            } else {
              setError(verifyResult.message || 'Verification failed');
            }
          } catch (err) {
            setError('Payment verification error: ' + err.message);
          } finally {
            setProcessingAddonPayment(false);
          }
        },
        prefill: {
          name: clientData?.name || '',
          email: clientData?.email || '',
        },
        theme: {
          color: '#3b82f6',
        },
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError('Payment failed: ' + (response.error?.description || 'Unknown error'));
        setProcessingAddonPayment(false);
      });
      rzp.open();
      
    } catch (err) {
      setError(err.message || 'Failed to process payment');
      setProcessingAddonPayment(false);
    }
  };

  // Fetch Add-on Cart
  const fetchAddonCart = async (authToken) => {
    setLoadingCart(true);
    try {
      const response = await fetch(`${API_URL}/client/addon/cart`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      const result = await response.json();
      if (result.success) {
        setAddonCart(result.data);
      }
    } catch (err) {
      console.error('Fetch cart error:', err);
    } finally {
      setLoadingCart(false);
    }
  };

  // Add Current Add-on to Cart
  const addCurrentAddonToCart = async () => {
    if (!addonPreview) return;
    
    const isValid = await checkTokenValidity();
    if (!isValid) {
      setError('Session expired. Please login again.');
      handleLogout();
      return;
    }

    const finalAddonType = selectedAddonType === 'id card' ? 'id card ' + selectedIdCardType : selectedAddonType;
    setAddingToCart(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/client/addon/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          addon_type: finalAddonType,
          recipient_type: selectedRecipientType
        })
      });

      if (handleUnauthorized(response)) return;

      const result = await response.json();
      if (result.success) {
        setSuccess(`🛒 Added ${finalAddonType} to cart successfully!`);
        await fetchAddonCart(token);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.message || 'Failed to add item to cart');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      setError('Failed to add item to cart: ' + err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  // Remove Addon from Cart
  const removeAddonFromCart = async (cartItemId) => {
    const isValid = await checkTokenValidity();
    if (!isValid) {
      setError('Session expired. Please login again.');
      handleLogout();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/client/addon/cart/remove/${cartItemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (handleUnauthorized(response)) return;

      const result = await response.json();
      if (result.success) {
        setSuccess('Removed item from cart successfully!');
        await fetchAddonCart(token);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to remove item');
      }
    } catch (err) {
      console.error('Remove cart item error:', err);
      setError('Error removing item: ' + err.message);
    }
  };

  // Clear Cart
  const clearAddonCart = async () => {
    const isValid = await checkTokenValidity();
    if (!isValid) {
      setError('Session expired. Please login again.');
      handleLogout();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/client/addon/cart/clear`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (handleUnauthorized(response)) return;

      const result = await response.json();
      if (result.success) {
        setSuccess('Cleared cart successfully!');
        await fetchAddonCart(token);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to clear cart');
      }
    } catch (err) {
      console.error('Clear cart error:', err);
      setError('Error clearing cart: ' + err.message);
    }
  };

  // Process Cart Payment
  const processCartPayment = async () => {
    if (!addonCart || addonCart.items.length === 0) return;

    const isValid = await checkTokenValidity();
    if (!isValid) {
      setError('Session expired. Please login again.');
      handleLogout();
      return;
    }

    setProcessingCartPayment(true);
    setError('');
    setSuccess('');

    try {
      // 1. Create order
      const orderResponse = await fetch(`${API_URL}/client/addon/cart/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (handleUnauthorized(orderResponse)) {
        setProcessingCartPayment(false);
        return;
      }

      const orderResult = await orderResponse.json();
      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Failed to create payment order');
      }

      // 2. Simulated payment
      if (orderResult.simulated) {
        const verifyResponse = await fetch(`${API_URL}/client/addon/cart/verify-payment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            order_id: orderResult.order_id,
            razorpay_payment_id: 'sim_cart_pay_' + Math.floor(Math.random() * 1000000)
          })
        });

        const verifyResult = await verifyResponse.json();
        if (verifyResult.success) {
          setSuccess(`✅ Simulated cart payment of ₹${orderResult.amount} completed successfully!`);
          await fetchAddonCart(token);
          await fetchAddonHistory(token);
          if (addonPreview) {
            fetchAddonPreview(addonPreview.addon_type, token, selectedRecipientType);
          }
        } else {
          setError(verifyResult.message || 'Cart payment verification failed');
        }
        setProcessingCartPayment(false);
        return;
      }

      // 3. Real checkout
      await loadRazorpayScript();

      const options = {
        key: orderResult.key,
        amount: Math.round(orderResult.amount * 100),
        currency: orderResult.currency,
        name: 'AIM Digitalise',
        description: `Pay for ${orderResult.item_count} Add-on Services`,
        order_id: orderResult.order_id,
        handler: async function (response) {
          setProcessingCartPayment(true);
          try {
            const verifyResponse = await fetch(`${API_URL}/client/addon/cart/verify-payment`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                order_id: orderResult.order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyResult = await verifyResponse.json();
            if (verifyResult.success) {
              setSuccess(`✅ Payment of ₹${orderResult.amount} verified successfully!`);
              await fetchAddonCart(token);
              await fetchAddonHistory(token);
              if (addonPreview) {
                fetchAddonPreview(addonPreview.addon_type, token, selectedRecipientType);
              }
            } else {
              setError(verifyResult.message || 'Cart payment verification failed');
            }
          } catch (err) {
            setError('Payment verification error: ' + err.message);
          } finally {
            setProcessingCartPayment(false);
          }
        },
        prefill: {
          name: clientData?.name || '',
          email: clientData?.email || '',
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError('Payment failed: ' + (response.error?.description || 'Unknown error'));
        setProcessingCartPayment(false);
      });
      rzp.open();

    } catch (err) {
      setError(err.message || 'Failed to process payment');
      setProcessingCartPayment(false);
    }
  };

  // Process Subscription Payment
  const processSubscriptionPayment = async () => {
    if (hasZeroStudents && perPerson == 1) {
      setError('Cannot process payment: No students found in your school database. Please add student records first.');
      return;
    }
    
    if (!calculatedAmount) {
      setError('Please calculate subscription amount first');
      return;
    }
    
    // Check token validity before proceeding
    const isValid = await checkTokenValidity();
    if (!isValid) {
      setError('Session expired. Please login again.');
      handleLogout();
      return;
    }
    
    setProcessingPayment(true);
    setError('');
    
    try {
      const orderResponse = await fetch(`${API_URL}/client/create-subscription-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cycle: selectedCycle })
      });
      
      if (handleUnauthorized(orderResponse)) {
        setProcessingPayment(false);
        return;
      }
      
      const orderResult = await orderResponse.json();
      console.log('Order result:', orderResult);
      
      if (!orderResult.success) {
        if (orderResult.error_code === 'NO_STUDENTS_FOUND') {
          setHasZeroStudents(true);
          setStudentCountWarning({
            show: true,
            message: orderResult.message,
            action_message: orderResult.data?.action_message,
            student_count: 0
          });
        } else {
          setError(orderResult.message || 'Failed to create order');
        }
        setProcessingPayment(false);
        return;
      }
      
      if (orderResult.simulated) {
        const confirmPayment = window.confirm(
          `SIMULATION MODE\n\nAmount: ₹${orderResult.amount}\nCycle: ${orderResult.cycle}\nCycle Months: ${orderResult.cycle_months || 1}\nCarryover: ${orderResult.carryover_days || 0} days\nPer Person: ${orderResult.per_person === 1 ? 'Yes (× student count)' : 'No (flat rate)'}\n\nClick OK to simulate payment`
        );
        
        if (confirmPayment) {
          // ✅ UPDATED: Added 5 new fields for simulation verify
          const verifyResponse = await fetch(`${API_URL}/client/verify-subscription-payment`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              order_id: orderResult.order_id,
              razorpay_payment_id: 'sim_pay_' + Date.now(),
              razorpay_order_id: orderResult.order_id,
              razorpay_signature: 'sim_signature_' + Date.now(),
              cycle: selectedCycle,
              amount: orderResult.amount,
              cycle_months: orderResult.cycle_months || 1,
              is_first_payment: orderResult.is_first_payment || false,
              // ✅ NEW - carryover + student count
              has_carryover: orderResult.has_carryover || false,
              carryover_from: orderResult.carryover_from || null,
              carryover_to: orderResult.carryover_to || null,
              carryover_days: orderResult.carryover_days || 0,
              student_count: orderResult.student_count || null,
              is_extra_students_payment: orderResult.is_extra_students_payment || false,
            })
          });
          
          if (handleUnauthorized(verifyResponse)) {
            setProcessingPayment(false);
            return;
          }
          
          const verifyResult = await verifyResponse.json();
          console.log('Verify result:', verifyResult);
          
          if (verifyResult.success) {
            setSuccess(`✅ ${verifyResult.message} Amount: ₹${orderResult.amount}`);
            setShowBillModal(false);
            await refreshSubscriptionData();
          } else {
            setError(verifyResult.message || 'Payment verification failed');
            setProcessingPayment(false);
          }
        } else {
          setProcessingPayment(false);
        }
        return;
      }
      
      await loadRazorpayScript();
      
      const options = {
        key: orderResult.key,
        amount: Math.round(orderResult.amount * 100),
        currency: orderResult.currency,
        name: 'AIM Digitalise',
        description: `${orderResult.cycle.toUpperCase()} Subscription - ${orderResult.client_name}`,
        order_id: orderResult.order_id,
        handler: async (response) => {
          setSuccess('Verifying payment...');
          
          try {
            // ✅ UPDATED: Added 5 new fields for real Razorpay verify
            const verifyResponse = await fetch(`${API_URL}/client/verify-subscription-payment`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                order_id: orderResult.order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                cycle: selectedCycle,
                amount: orderResult.amount,
                cycle_months: orderResult.cycle_months || 1,
                is_first_payment: orderResult.is_first_payment || false,
                // ✅ NEW - carryover + student count
                has_carryover: orderResult.has_carryover || false,
                carryover_from: orderResult.carryover_from || null,
                carryover_to: orderResult.carryover_to || null,
                carryover_days: orderResult.carryover_days || 0,
                student_count: orderResult.student_count || null,
                is_extra_students_payment: orderResult.is_extra_students_payment || false,
              })
            });
            
            if (handleUnauthorized(verifyResponse)) {
              setProcessingPayment(false);
              return;
            }
            
            const verifyResult = await verifyResponse.json();
            console.log('Verify result:', verifyResult);
            
            if (verifyResult.success) {
              setShowBillModal(false);
              await refreshSubscriptionData();
            } else {
              setError(verifyResult.message || 'Payment verification failed');
              setProcessingPayment(false);
            }
          } catch (err) {
            console.error('Verification error:', err);
            setError('Payment verification failed: ' + err.message);
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled');
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: orderResult.client_name,
          email: orderResult.client_email,
        },
        theme: {
          color: '#F37254'
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        console.error('Payment failed:', response);
        setError('Payment failed: ' + (response.error?.description || 'Unknown error'));
        setProcessingPayment(false);
      });
      
      razorpay.open();
      
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment error: ' + err.message);
      setProcessingPayment(false);
    }
  };

  const processUnifiedPayment = async () => {
    const isValid = await checkTokenValidity();
    if (!isValid) {
      setError('Session expired. Please login again.');
      handleLogout();
      return;
    }
    
    setProcessingUnifiedPayment(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_URL}/client/unified/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cycle: selectedCycle })
      });
      
      if (handleUnauthorized(response)) {
        setProcessingUnifiedPayment(false);
        return;
      }
      
      const orderResult = await response.json();
      if (!orderResult.success) {
        setError(orderResult.message || 'Failed to create unified order');
        setProcessingUnifiedPayment(false);
        return;
      }
      
      if (orderResult.simulated) {
        let msg = `SIMULATION MODE - UNIFIED CHECKOUT\n\nTotal Amount: ₹${orderResult.amount}\n`;
        if (orderResult.subscription) {
          msg += `• Subscription (${orderResult.subscription.cycle}): ₹${orderResult.subscription.amount}\n`;
        }
        if (orderResult.customization) {
          msg += `• Customizations (${orderResult.customization.request_ids.length} requests): ₹${orderResult.customization.amount}\n`;
        }
        if (orderResult.addon) {
          msg += `• Add-ons (${orderResult.addon.items_count} items): ₹${orderResult.addon.amount}\n`;
        }
        msg += `\nClick OK to simulate checkout payment.`;
        
        const confirmPayment = window.confirm(msg);
        if (confirmPayment) {
          const verifyResponse = await fetch(`${API_URL}/client/unified/verify-payment`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              order_id: orderResult.order_id,
              razorpay_payment_id: 'sim_pay_' + Date.now(),
              subscription: orderResult.subscription,
              customization: orderResult.customization,
              addon: orderResult.addon
            })
          });
          
          if (handleUnauthorized(verifyResponse)) {
            setProcessingUnifiedPayment(false);
            return;
          }
          
          const verifyResult = await verifyResponse.json();
          if (verifyResult.success) {
            setSuccess(`✅ ${verifyResult.message}`);
            // Reload all states
            await Promise.all([
              fetchProfile(token),
              fetchPaymentStatus(token),
              fetchCustomizationRequests(token),
              fetchAddonCart(token)
            ]);
          } else {
            setError(verifyResult.message || 'Payment verification failed');
          }
        }
        setProcessingUnifiedPayment(false);
        return;
      }
      
      // Real Razorpay integration
      await loadRazorpayScript();
      
      const options = {
        key: orderResult.key,
        amount: Math.round(orderResult.amount * 100),
        currency: orderResult.currency,
        name: 'AIM Digitalise',
        description: `Unified Payment - ${orderResult.client_name}`,
        order_id: orderResult.order_id,
        handler: async (paymentResponse) => {
          setSuccess('Verifying payment...');
          try {
            const verifyResponse = await fetch(`${API_URL}/client/unified/verify-payment`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                order_id: orderResult.order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                subscription: orderResult.subscription,
                customization: orderResult.customization,
                addon: orderResult.addon
              })
            });
            
            if (handleUnauthorized(verifyResponse)) {
              setProcessingUnifiedPayment(false);
              return;
            }
            
            const verifyResult = await verifyResponse.json();
            if (verifyResult.success) {
              setSuccess('✅ Payment completed and verified successfully!');
              await Promise.all([
                fetchProfile(token),
                fetchPaymentStatus(token),
                fetchCustomizationRequests(token),
                fetchAddonCart(token)
              ]);
            } else {
              setError(verifyResult.message || 'Payment verification failed');
            }
          } catch (err) {
            console.error('Verification error:', err);
            setError('Payment verification failed: ' + err.message);
          } finally {
            setProcessingUnifiedPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled');
            setProcessingUnifiedPayment(false);
          }
        },
        prefill: {
          name: orderResult.client_name,
          email: orderResult.client_email,
        },
        theme: {
          color: '#3b82f6'
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (failedResponse) => {
        console.error('Payment failed:', failedResponse);
        setError('Payment failed: ' + (failedResponse.error?.description || 'Unknown error'));
        setProcessingUnifiedPayment(false);
      });
      
      razorpay.open();
      
    } catch (err) {
      console.error('Unified checkout payment error:', err);
      setError('Payment error: ' + err.message);
      setProcessingUnifiedPayment(false);
    }
  };
  
  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/client/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: loginData.client_id,
          password: loginData.password
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const authToken = result.data.token;
        setToken(authToken);
        setClientData(result.data.client);
        setIsLoggedIn(true);
        localStorage.setItem('client_token', authToken);
        localStorage.setItem('client_data', JSON.stringify(result.data.client));
        
        await Promise.all([
          fetchProfile(authToken),
          fetchMyProducts(authToken),
          fetchStudentCount(authToken),
          fetchPaymentCycles(authToken),
          fetchPaymentStatus(authToken),
          fetchPaymentHistory(authToken),
          fetchCustomizationRequests(authToken),
          fetchAddonPreview('Transportation', authToken),
          fetchAddonHistory(authToken),
          fetchAddonCart(authToken)
        ]);
        
        setSuccess('✅ Login successful!');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Logout
  const handleLogout = async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/client/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_data');
    setIsLoggedIn(false);
    setToken(null);
    setClientData(null);
    setProfileData(null);
    setProductData(null);
    setStudentCount(null);
    setPaymentCycles(null);
    setCalculatedAmount(null);
    setPaymentStatus(null);
    setShowPayNow(false);
    setNextPaymentDate(null);
    setDeliveryInfo(null);
    setPaymentHistory(null);
    setCustomizationRequests([]);
    setStudentCountWarning(null);
    setHasZeroStudents(false);
    setUnpaidMonths([]);
    setTotalDueAmount(null);
    setBillData(null);
    setShowBillModal(false);
    setActiveTab('profile');
    setSuccess('Logged out successfully');
  };
  
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };
  
  // Get status badge color and text
  const getStatusBadge = (status) => {
    const badges = {
      'pending': { color: '#f59e0b', text: 'Pending', bg: '#fef3c7' },
      'amount_set': { color: '#3b82f6', text: 'Amount Set', bg: '#dbeafe' },
      'approved': { color: '#10b981', text: 'Approved', bg: '#d1fae5' },
      'rejected': { color: '#ef4444', text: 'Rejected', bg: '#fee2e2' }
    };
    return badges[status] || badges.pending;
  };
  
  // Format amount helper
  const formatAmount = (amount) => {
    if (!amount) return null;
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return null;
    return `₹ ${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculate per day amount for carryover
  const calculatePerDayAmount = (totalAmount, days) => {
    if (!totalAmount || !days || days === 0) return 0;
    return totalAmount / days;
  };
  
  // Download Bill as HTML
  const downloadBill = () => {
    if (!billRef.current) return;
    
    const content = billRef.current.innerHTML;
    const style = `
      <style>
        @media print {
          body { margin: 0; padding: 20px; }
          .no-print { display: none !important; }
        }
        body { font-family: Arial, sans-serif; }
        .bill-container { max-width: 800px; margin: 0 auto; padding: 30px; background: white; }
        .bill-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .bill-title { font-size: 24px; font-weight: bold; color: #1e293b; }
        .bill-subtitle { color: #64748b; font-size: 14px; }
        .bill-info { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; }
        .bill-info-item { font-size: 14px; }
        .bill-info-item strong { color: #1e293b; }
        .bill-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .bill-table th { background: #1e293b; color: white; padding: 12px; text-align: left; font-size: 14px; }
        .bill-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .bill-table tr:hover { background: #f8fafc; }
        .bill-total { text-align: right; padding: 20px; background: #f8fafc; border-radius: 8px; margin-top: 20px; }
        .bill-total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .bill-total-grand { font-size: 20px; font-weight: bold; color: #3b82f6; border-top: 2px solid #333; padding-top: 12px; margin-top: 8px; }
        .bill-footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
        .carryover-section { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
        .regular-section { background: #d1fae5; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .badge-first { background: #dbeafe; color: #1e40af; }
        .badge-regular { background: #d1fae5; color: #065f46; }
        .badge-per-person { background: #fef3c7; color: #92400e; }
        .badge-flat { background: #fce7f3; color: #9d174d; }
      </style>
    `;
    
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Invoice ${billData?.invoiceNumber || ''}</title>${style}</head>
        <body>${content}</body>
      </html>
    `;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${billData?.invoiceNumber || 'bill'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Bill Modal Component
  const BillModal = () => {
    if (!showBillModal || !billData) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px',
        overflow: 'auto'
      }} onClick={() => setShowBillModal(false)}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '95vh',
          overflow: 'auto',
          padding: '30px',
          position: 'relative'
        }} onClick={(e) => e.stopPropagation()}>
          
          {/* Bill Content */}
          <div ref={billRef} className="bill-container">
            {/* Header */}
            <div className="bill-header">
              <div className="bill-title">🎓 AIM Digitalise</div>
              <div className="bill-subtitle">Subscription Invoice</div>
            </div>
            
            {/* Invoice Info */}
            <div className="bill-info">
              <div className="bill-info-item">
                <strong>Invoice #:</strong> {billData.invoiceNumber}
              </div>
              <div className="bill-info-item">
                <strong>Date:</strong> {billData.invoiceDate}
              </div>
              <div className="bill-info-item">
                <strong>Status:</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>Pending</span>
              </div>
            </div>
            
            {/* Client Info */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                <div><strong>Client:</strong> {billData.clientName}</div>
                <div><strong>Client ID:</strong> {billData.clientId}</div>
                <div><strong>School:</strong> {billData.schoolName || '-'}</div>
                <div><strong>Product:</strong> {billData.productName || '-'}</div>
                <div><strong>Cycle:</strong> {billData.cycle}</div>
                <div><strong>Students:</strong> {billData.studentCount}</div>
                <div><strong>Billing Type:</strong>
                  <span className={`badge ${billData.isExtraStudentsPayment ? 'badge-per-person' : (billData.perPerson == 1 ? 'badge-per-person' : 'badge-flat')}`}>
                    {billData.isExtraStudentsPayment ? '👥 Extra Students Fee' : (billData.perPerson == 1 ? '👥 Per Student' : '📦 Flat Rate')}
                  </span>
                </div>
                {billData.isExtraStudentsPayment ? (
                  <div>
                    <span className="badge badge-regular" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>New Students Fee</span>
                  </div>
                ) : (
                  <>
                    {billData.isFirstPayment && (
                      <div>
                        <span className="badge badge-first">First Payment</span>
                      </div>
                    )}
                    {!billData.isFirstPayment && (
                      <div>
                        <span className="badge badge-regular">Regular Payment</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Period Info */}
            {billData.periodStart && billData.periodEnd && (
              <div style={{ marginBottom: '20px', padding: '12px', background: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                <strong>📅 Billing Period:</strong> {billData.periodStart} - {billData.periodEnd}
                {billData.deliveryDate && (
                  <span style={{ marginLeft: '20px', color: '#6b7280', fontSize: '14px' }}>
                    (Delivery: {billData.deliveryDate})
                  </span>
                )}
              </div>
            )}
            
            {/* Pricing Formula Display */}
            <div style={{ 
              marginBottom: '20px', 
              padding: '12px', 
              background: billData.perPerson === 1 ? '#dbeafe' : '#fce7f3', 
              borderRadius: '8px',
              borderLeft: `4px solid ${billData.perPerson === 1 ? '#3b82f6' : '#9d174d'}`
            }}>
              <strong>📊 Pricing Formula:</strong>
              {billData.perPerson === 1 ? (
                <span>
                  ₹{billData.monthlySubscription || billData.baseMonthlyAmount} × {billData.studentCount} students = ₹{billData.baseMonthlyAmount} per month
                </span>
              ) : (
                <span>
                  Flat Rate: ₹{billData.monthlySubscription || billData.baseMonthlyAmount} per month (not per student)
                </span>
              )}
            </div>
            
            {/* Bill Table */}
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Rate</th>
                  <th style={{ textAlign: 'right' }}>Months</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Carryover Section */}
                {billData.isFirstPayment && billData.carryoverAmount > 0 && (
                  <tr style={{ background: '#dbeafe' }}>
                    <td>
                      <strong>🔄 Carryover</strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {billData.deliveryDate || 'Delivery'} to month end ({billData.carryoverDays}/{billData.daysInMonth} days, {(billData.carryoverFraction * 100).toFixed(1)}% of month)
                        {billData.discountPercentage > 0 && (
                          <span style={{ color: '#059669', marginLeft: '8px' }}>
                            ({formatAmount(billData.discountedMonthlyAmount)}/month × {(billData.carryoverFraction * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>{formatAmount(billData.discountedMonthlyAmount)}</td>
                    <td style={{ textAlign: 'right' }}>{(billData.carryoverFraction * 100).toFixed(1)}%</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatAmount(billData.carryoverAmount)}</td>
                  </tr>
                )}
                
                {/* Regular Months Section */}
                <tr style={{ background: '#d1fae5' }}>
                  <td>
                    <strong>{billData.isExtraStudentsPayment ? '👥 Subscription for Extra Students' : `📆 ${billData.cycle} Subscription`}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {billData.isExtraStudentsPayment ? `Subscription fee for extra students for ${billData.cycleMonths} month(s)` : `${billData.cycleMonths} month(s)`}
                      {billData.isFirstPayment && ' (Full months)'}
                      {billData.discountPercentage > 0 && (
                        <span style={{ color: '#059669', marginLeft: '8px' }}>
                          ({billData.discountPercentage}% discount applied)
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>{formatAmount(billData.discountedMonthlyAmount)}</td>
                  <td style={{ textAlign: 'right' }}>{billData.cycleMonths}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatAmount(billData.regularMonthsAmount)}</td>
                </tr>
                
                {/* Original Price */}
                {billData.discountPercentage > 0 && (
                  <tr style={{ background: '#fef3c7' }}>
                    <td colSpan="3" style={{ textAlign: 'right', fontSize: '13px', color: '#92400e' }}>
                      <span style={{ textDecoration: 'line-through' }}>Original price (without discount)</span>
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '13px', color: '#92400e' }}>
                      <span style={{ textDecoration: 'line-through' }}>{formatAmount(billData.baseTotal)}</span>
                    </td>
                  </tr>
                )}
                
                {/* Subtotal */}
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '15px' }}>
                    Subtotal (after {billData.discountPercentage}% discount)
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '15px' }}>
                    {formatAmount(billData.totalAmount)}
                  </td>
                </tr>
                
                {/* GST */}
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', color: '#f59e0b', fontSize: '14px' }}>
                    GST ({billData.gstPercentage}%)
                  </td>
                  <td style={{ textAlign: 'right', color: '#f59e0b', fontSize: '14px', fontWeight: 'bold' }}>
                    +{formatAmount(billData.gstAmount)}
                  </td>
                </tr>

                {/* Overdue (Extra Students) */}
                {billData.extraStudentsOverdue > 0 && (
                  <tr style={{ background: '#fee2e2' }}>
                    <td colSpan="3" style={{ textAlign: 'right', color: '#dc2626', fontSize: '14px', fontWeight: 'bold' }}>
                      ⚠️ Overdue (Extra Students from previous cycle)
                    </td>
                    <td style={{ textAlign: 'right', color: '#dc2626', fontSize: '14px', fontWeight: 'bold' }}>
                      +{formatAmount(billData.extraStudentsOverdue)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Total */}
            <div className="bill-total">
              <div className="bill-total-row">
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total Amount (incl. GST)</span>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {formatAmount(billData.totalWithGST)}
                </span>
              </div>
              
              {billData.savings > 0 && (
                <div className="bill-total-row" style={{ color: '#059669', fontSize: '14px' }}>
                  <span>💰 You saved {formatAmount(billData.savings)} by choosing {billData.cycle} plan</span>
                  <span style={{ fontWeight: 'bold' }}>{formatAmount(billData.savings)}</span>
                </div>
              )}
              
              {billData.originalTotalWithGST > 0 && billData.savings > 0 && (
                <div className="bill-total-row" style={{ fontSize: '13px', color: '#64748b' }}>
                  <span>Original price (without discount, incl. GST)</span>
                  <span style={{ textDecoration: 'line-through' }}>{formatAmount(billData.originalTotalWithGST)}</span>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="bill-footer">
              <p>Thank you for your business! For any queries, please contact support.</p>
              <p style={{ fontSize: '11px' }}>This is a system generated invoice.</p>
            </div>
          </div>
          
          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <button
              onClick={() => setShowBillModal(false)}
              style={{
                padding: '10px 24px',
                backgroundColor: '#e2e8f0',
                color: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
            <button
              onClick={downloadBill}
              style={{
                padding: '10px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📥 Download Bill
            </button>
            <button
              onClick={processSubscriptionPayment}
              disabled={processingPayment}
              style={{
                padding: '10px 24px',
                backgroundColor: processingPayment ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: processingPayment ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {processingPayment ? 'Processing...' : '💳 Pay Now'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Invoice Modal Component
  const InvoiceModal = () => {
    if (!showInvoiceModal || !selectedInvoicePayment) return null;
    
    const payment = selectedInvoicePayment;
    const client = paymentHistory?.client || clientData || {};
    
    // Download/Print helper using browser print window
    const printInvoice = () => {
      const printContents = document.getElementById('printable-invoice-container').innerHTML;
      
      // Open new window to print
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - \${payment.invoice_id}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                color: #1e293b;
              }
              .bill-header {
                display: flex;
                justify-content: space-between;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 20px;
                margin-bottom: 20px;
              }
              .bill-title {
                font-size: 24px;
                font-weight: bold;
              }
              .bill-subtitle {
                font-size: 14px;
                color: #64748b;
              }
              .bill-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                font-size: 13px;
              }
              .bill-info-section {
                flex: 1;
              }
              .bill-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                font-size: 13px;
              }
              .bill-table th {
                background-color: #f1f5f9;
                padding: 10px;
                text-align: left;
                font-weight: bold;
                border-bottom: 1px solid #cbd5e1;
              }
              .bill-table td {
                padding: 12px 10px;
                border-bottom: 1px solid #e2e8f0;
              }
              .bill-total {
                margin-left: auto;
                width: 350px;
                font-size: 14px;
              }
              .bill-total-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
              }
              .bill-footer {
                margin-top: 50px;
                text-align: center;
                font-size: 11px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
              }
              .badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 11px;
              }
              .badge-paid {
                background-color: #d1fae5;
                color: #065f46;
              }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            \${printContents}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px',
        overflow: 'auto'
      }} onClick={() => setShowInvoiceModal(false)}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '30px',
          position: 'relative'
        }} onClick={(e) => e.stopPropagation()}>
          
          {/* Printable Container */}
          <div id="printable-invoice-container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>🎓 AIM Digitalise</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Digitalizing Education Systems</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>INVOICE</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Invoice ID: <strong>{payment.invoice_id || '—'}</strong></div>
              </div>
            </div>
            
            {/* Invoice Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '0.85rem' }}>
              <div>
                <h4 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Billed To:</h4>
                <div><strong>Client Name:</strong> {client.client_name || client.name}</div>
                <div><strong>Client ID:</strong> {client.client_id}</div>
                {client.company_name && <div><strong>Company:</strong> {client.company_name}</div>}
                {client.school_name && <div><strong>School:</strong> {client.school_name}</div>}
                {client.gstin && <div><strong>GSTIN:</strong> {client.gstin}</div>}
                {client.address && <div><strong>Address:</strong> {client.address}, {client.district}, {client.state} - {client.pin_code}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Details:</h4>
                <div><strong>Payment Date:</strong> {payment.payment_date_formatted}</div>
                <div><strong>Razorpay Order:</strong> {payment.payment_id || '—'}</div>
                <div><strong>Status:</strong> <span className="badge badge-paid" style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>✓ Paid</span></div>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Description</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Rate</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Months</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Carryover Row */}
                {payment.has_carryover && payment.carryover_amount_before_gst > 0 && (
                  <tr>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0' }}>
                      <strong>🔄 Pro-rated Carryover Period</strong>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        From {payment.carryover_from_formatted} to {payment.carryover_to_formatted} ({payment.carryover_days} days)
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                      ₹{payment.regular_amount_before_gst > 0 ? (payment.regular_amount_before_gst / payment.months_paid).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                    </td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                      {((payment.carryover_days / 30)).toFixed(3)}
                    </td>
                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 'bold' }}>
                      ₹{payment.carryover_amount_before_gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                
                {/* Cycle Subscription Row */}
                <tr>
                  <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0' }}>
                    <strong>📆 {payment.cycle_label} Subscription</strong>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Period Covered: {payment.period_covered?.start_date_formatted} to {payment.period_covered?.end_date_formatted}
                      {payment.student_count && ` (👥 For ${payment.student_count} students)`}
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                    ₹{(payment.regular_amount_before_gst / (payment.months_paid || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                    {payment.months_paid}
                  </td>
                  <td style={{ padding: '12px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 'bold' }}>
                    ₹{payment.regular_amount_before_gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Totals breakdown */}
            <div style={{ marginLeft: 'auto', width: '320px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span>Subtotal (before tax):</span>
                <strong>₹{payment.amount_before_gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0', color: '#f59e0b' }}>
                <span>GST (18%):</span>
                <strong>+₹{payment.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '2px solid #e2e8f0', fontSize: '1rem', fontWeight: 'bold', color: '#059669', backgroundColor: '#eff6ff', borderRadius: '4px', marginTop: '6px', paddingLeft: '8px', paddingRight: '8px' }}>
                <span>Total Paid:</span>
                <span>₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Footer info */}
            <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <p>Thank you for choosing AIM Digitalise as your partner.</p>
              <p style={{ marginTop: '4px' }}>This is a digital transaction receipt containing the generated Invoice ID: {payment.invoice_id || '—'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <button
              onClick={() => setShowInvoiceModal(false)}
              style={{
                padding: '8px 20px',
                backgroundColor: '#e2e8f0',
                color: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem'
              }}
            >
              Close
            </button>
            <button
              onClick={printInvoice}
              style={{
                padding: '8px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              🖨️ Print & Save PDF
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Login Screen
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎓</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Client Portal</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '8px' }}>Login with your Client ID</p>
          </div>
          
          {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
          {success && <div style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{success}</div>}
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Client ID</label>
              <input
                type="text"
                name="client_id"
                value={loginData.client_id}
                onChange={handleLoginChange}
                placeholder="e.g., AIM2733488"
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: '#64748b' }}>
            <p>Default password: <strong>12345</strong></p>
            <p style={{ marginTop: '8px' }}>Contact your service provider if you need assistance</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Main Dashboard
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>🎓 Client Portal</h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Welcome, {clientData?.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ backgroundColor: '#e0f2fe', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', color: '#0369a1' }}>
              ID: {clientData?.client_id}
            </span>
            <button
              onClick={handleLogout}
              style={{ padding: '6px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['profile', 'products', 'subscription', 'customization', 'addon'].map((tab) => (
            <button
              key={tab}
              onClick={() => { 
                setActiveTab(tab); 
                setError(''); 
                setSuccess(''); 
                if (tab === 'addon') {
                  fetchAddonPreview(selectedAddonType, token);
                  fetchAddonHistory(token);
                }
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === tab ? '#3b82f6' : 'transparent',
                color: activeTab === tab ? 'white' : '#64748b',
                border: 'none',
                borderBottom: activeTab === tab ? 'none' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '8px 8px 0 0'
              }}
            >
              {tab === 'profile' && '👤 Dashboard'}
              {tab === 'products' && '📦 My Products'}
              {tab === 'subscription' && '💰 Subscription'}
              {tab === 'customization' && '🎨 Customization'}
              {tab === 'addon' && '🔌 Add-on Services'}
            </button>
          ))}
        </div>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
        {success && <div style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '20px', whiteSpace: 'pre-line' }}>{success}</div>}
        
        {/* Student Count Warning */}
        {studentCountWarning && studentCountWarning.show && perPerson == 1 && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            borderRadius: '12px', 
            padding: '20px', 
            marginBottom: '20px',
            borderLeft: '4px solid #dc2626'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>⚠️</div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '8px' }}>
                  No Students Found in Database
                </h3>
                <p style={{ color: '#dc2626', marginBottom: '8px' }}>{studentCountWarning.message}</p>
                {studentCountWarning.action_message && (
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '8px' }}>
                    💡 {studentCountWarning.action_message}
                  </p>
                )}
                {perPerson == 0 && (
                  <p style={{ color: '#059669', fontSize: '0.875rem', marginTop: '8px' }}>
                    ✅ Your product has a flat rate, so student count is not required for subscription payments.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Profile Tab */}
        {activeTab === 'profile' && profileData && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #3b82f6', paddingBottom: '8px' }}>
              👤 Profile Information
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#3b82f6' }}>Basic Information</h3>
                <div><strong>Client ID:</strong> {profileData.client_id}</div>
                <div><strong>Name:</strong> {profileData.client_name}</div>
                <div><strong>Email:</strong> {profileData.email}</div>
                <div><strong>Contact:</strong> {profileData.contact_number}</div>
                <div><strong>Status:</strong> 
                  <span style={{ 
                    display: 'inline-block', 
                    marginLeft: '8px', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: profileData.is_active ? '#d1fae5' : '#fee2e2',
                    color: profileData.is_active ? '#059669' : '#dc2626'
                  }}>
                    {profileData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#3b82f6' }}>Organization Details</h3>
                <div><strong>Organization:</strong> {profileData.company_name || profileData.school_name || '-'}</div>
                {profileData.school_short_name && <div><strong>School Short Name:</strong> {profileData.school_short_name}</div>}
                {profileData.school_session && <div><strong>Session:</strong> {profileData.school_session}</div>}
                {profileData.total_students && <div><strong>Total Students:</strong> {profileData.total_students}</div>}
                <div><strong>GSTIN:</strong> {profileData.gstin || '-'}</div>
              </div>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#3b82f6' }}>Address</h3>
                <div>{profileData.address}</div>
                <div>{profileData.district}, {profileData.state}</div>
                <div>PIN: {profileData.pin_code}</div>
              </div>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#3b82f6' }}>Purchase Information</h3>
                <div><strong>Product:</strong> {profileData.product_name}</div>
                <div><strong>Category:</strong> {profileData.product_category}</div>
                <div><strong>Processing Fee:</strong> ₹{profileData.processing_fee}</div>
                <div><strong>Monthly Subscription:</strong> ₹{profileData.monthly_subscription}</div>
                <div><strong>Billing Type:</strong>
                  <span style={{ 
                    display: 'inline-block',
                    marginLeft: '8px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: profileData.per_person === 1 ? '#dbeafe' : '#fce7f3',
                    color: profileData.per_person === 1 ? '#1e40af' : '#9d174d',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {profileData.per_person === 1 ? '👥 Per Student' : '📦 Flat Rate'}
                  </span>
                </div>
                <div><strong>Payment Status:</strong> 
                  <span style={{ 
                    marginLeft: '8px', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: profileData.payment_status === 'paid' ? '#d1fae5' : '#fef3c7',
                    color: profileData.payment_status === 'paid' ? '#059669' : '#d97706'
                  }}>
                    {profileData.payment_status}
                  </span>
                </div>
                <div><strong>Purchased:</strong> {new Date(profileData.created_at).toLocaleDateString()}</div>
                {profileData.activated_at && <div><strong>Activated:</strong> {new Date(profileData.activated_at).toLocaleDateString()}</div>}
              </div>
            </div>

            {/* Consolidated Payment Section */}
            <div style={{ 
              marginTop: '32px', 
              paddingTop: '24px', 
              borderTop: '2px dashed #e2e8f0' 
            }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                marginBottom: '8px', 
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💳 Consolidated Payment Dashboard
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
                View and pay all your pending subscription fees, customization requests, and add-on services cart at once.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                
                {/* 1. Subscription Box */}
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '12px', 
                  padding: '20px', 
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1e293b', margin: 0 }}>
                        💰 Subscription
                      </h3>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontWeight: 'bold',
                        backgroundColor: showPayNow ? '#fef3c7' : '#d1fae5',
                        color: showPayNow ? '#b45309' : '#065f46'
                      }}>
                        {showPayNow ? 'Payment Due' : 'Up to Date'}
                      </span>
                    </div>
                    
                    {showPayNow ? (
                      <div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 12px 0' }}>
                          Select your payment cycle below:
                        </p>
                        <select
                          value={selectedCycle}
                          onChange={(e) => handleCycleChange(e.target.value)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: 'white',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            outline: 'none',
                            width: '100%',
                            fontWeight: '500',
                            color: '#334155'
                          }}
                        >
                          <option value="monthly">Monthly Cycle</option>
                          <option value="quarterly">Quarterly Cycle</option>
                          <option value="half_yearly">Half Yearly Cycle</option>
                          <option value="annual">Annual Cycle</option>
                        </select>
                        {loadingSubscription ? (
                          <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#3b82f6', fontWeight: '500', textAlign: 'center', padding: '8px 0' }}>
                            Calculating subscription...
                          </div>
                        ) : (
                          <div style={{ marginTop: '16px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Base Amount:</span>
                              <span style={{ fontWeight: '500' }}>₹{(billData?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>GST (18%):</span>
                              <span style={{ fontWeight: '500' }}>₹{(billData?.gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '12px 0' }}>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 8px 0' }}>
                          Your subscription is active. Next billing cycle details:
                        </p>
                        <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#334155' }}>
                          📅 Due Date: {nextPaymentDate ? new Date(nextPaymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '16px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Due:</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: showPayNow ? '#ef4444' : '#0f172a' }}>
                      ₹{(showPayNow ? (billData?.totalWithGST || 0) : 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                
                {/* 2. Customizations Box */}
                {(() => {
                  const pendingCustomizations = customizationRequests.filter(r => r.status === 'amount_set' && r.amount > 0);
                  const baseCustomizationAmount = pendingCustomizations.reduce((sum, r) => sum + parseFloat(r.amount), 0);
                  const gstCustomizationAmount = Math.round(baseCustomizationAmount * 18) / 100;
                  const totalCustomizationAmount = baseCustomizationAmount + gstCustomizationAmount;
                  
                  return (
                    <div style={{ 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '12px', 
                      padding: '20px', 
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h3 style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1e293b', margin: 0 }}>
                            🎨 Customizations
                          </h3>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontWeight: 'bold',
                            backgroundColor: pendingCustomizations.length > 0 ? '#fef3c7' : '#d1fae5',
                            color: pendingCustomizations.length > 0 ? '#b45309' : '#065f46'
                          }}>
                            {pendingCustomizations.length > 0 ? `${pendingCustomizations.length} Pending` : 'None Pending'}
                          </span>
                        </div>
                        
                        {pendingCustomizations.length > 0 ? (
                          <div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 12px 0' }}>
                              Breakdown of quoted requests:
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '90px', overflowY: 'auto', paddingRight: '4px' }}>
                              {pendingCustomizations.map((r, idx) => (
                                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569' }}>
                                  <span>Request #{r.id}:</span>
                                  <span style={{ fontWeight: '500' }}>₹{parseFloat(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: '12px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Subtotal:</span>
                                <span style={{ fontWeight: '500' }}>₹{baseCustomizationAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>GST (18%):</span>
                                <span style={{ fontWeight: '500' }}>₹{gstCustomizationAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: '12px 0' }}>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                              You don't have any customization requests requiring payment.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '16px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Due:</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: pendingCustomizations.length > 0 ? '#ef4444' : '#0f172a' }}>
                          ₹{totalCustomizationAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                
                {/* 3. Add-on Services Box */}
                {(() => {
                  const addonPrice = (addonCart?.items?.length > 0) ? (parseFloat(addonCart.total_amount) || 0) : 0;
                  const addonSubtotal = (addonCart?.items?.length > 0) ? (parseFloat(addonCart.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)) || 0) : 0;
                  const addonGst = (addonCart?.items?.length > 0) ? (parseFloat(addonCart.items.reduce((sum, item) => sum + parseFloat(item.gst_amount), 0)) || 0) : 0;
                  
                  return (
                    <div style={{ 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '12px', 
                      padding: '20px', 
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h3 style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1e293b', margin: 0 }}>
                            🔌 Add-ons
                          </h3>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontWeight: 'bold',
                            backgroundColor: addonCart?.items?.length > 0 ? '#fef3c7' : '#d1fae5',
                            color: addonCart?.items?.length > 0 ? '#b45309' : '#065f46'
                          }}>
                            {addonCart?.items?.length > 0 ? `${addonCart.items.length} in Cart` : 'Cart Empty'}
                          </span>
                        </div>
                        
                        {addonCart?.items?.length > 0 ? (
                          <div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 12px 0' }}>
                              Services added to checkout cart:
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '90px', overflowY: 'auto', paddingRight: '4px' }}>
                              {addonCart.items.map((item, idx) => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569' }}>
                                  <span>{item.addon_type} ({item.recipient_type === 'student' ? 'Student' : 'Hostel'}):</span>
                                  <span style={{ fontWeight: '500' }}>₹{parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: '12px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Subtotal:</span>
                                <span style={{ fontWeight: '500' }}>₹{addonSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>GST (18%):</span>
                                <span style={{ fontWeight: '500' }}>₹{addonGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: '12px 0' }}>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                              Go to the "Add-on Services" tab to add transportation, hostel, or ID card services.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '16px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Due:</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: addonCart?.items?.length > 0 ? '#ef4444' : '#0f172a' }}>
                          ₹{addonPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                
              </div>
              
              {/* Grand Checkout Summary Box */}
              {(() => {
                const subPrice = showPayNow ? (billData?.totalWithGST || 0) : 0;
                
                const pendingCustomizations = customizationRequests.filter(r => r.status === 'amount_set' && r.amount > 0);
                const baseCustomizationAmount = pendingCustomizations.reduce((sum, r) => sum + parseFloat(r.amount), 0);
                const gstCustomizationAmount = Math.round(baseCustomizationAmount * 18) / 100;
                const custPrice = baseCustomizationAmount + gstCustomizationAmount;
                
                const addonPrice = (addonCart?.items?.length > 0) ? (parseFloat(addonCart.total_amount) || 0) : 0;
                
                const grandTotal = subPrice + custPrice + addonPrice;
                
                return (
                  <div style={{
                    background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                    color: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 10px 15px -3px rgba(30,58,138,0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: '1', minWidth: '250px' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#93c5fd', fontWeight: 'bold' }}>
                        Unified Checkout Summary
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                          <span>Subscription Payment:</span>
                          <span style={{ fontWeight: 'bold' }}>₹{subPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                          <span>Consolidated Customizations:</span>
                          <span style={{ fontWeight: 'bold' }}>₹{custPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                          <span>Add-on Cart Items:</span>
                          <span style={{ fontWeight: 'bold' }}>₹{addonPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', marginTop: '4px', color: '#ffffff' }}>
                          <span style={{ fontWeight: 'bold' }}>Grand Total (incl. GST):</span>
                          <span style={{ fontWeight: '900', color: '#fbbf24' }}>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {grandTotal > 0 ? (
                        <button
                          onClick={processUnifiedPayment}
                          disabled={processingUnifiedPayment}
                          style={{
                            padding: '16px 36px',
                            backgroundColor: processingUnifiedPayment ? '#94a3b8' : '#fbbf24',
                            color: processingUnifiedPayment ? '#64748b' : '#1e3a8a',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: processingUnifiedPayment ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {processingUnifiedPayment ? (
                            'Processing Payment...'
                          ) : (
                            <>
                              💳 Pay Total Amount (₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })})
                            </>
                          )}
                        </button>
                      ) : (
                        <div style={{
                          padding: '16px 28px',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          border: '2px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          color: '#93c5fd',
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}>
                          ✅ No Payments Pending
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        
        {/* Products Tab */}
        {activeTab === 'products' && productData && (
          <div>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #3b82f6', paddingBottom: '8px' }}>
                📦 My Products & Services
              </h2>
              
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '24px',
                color: 'white',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>{productData.product_name}</h3>
                <p style={{ opacity: 0.9, marginBottom: '16px' }}>{productData.product_category?.toUpperCase()}</p>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Processing Fee</span>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{productData.processing_fee}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Monthly Subscription</span>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{productData.monthly_subscription}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Billing Type</span>
                    <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                      {productData.per_person === 1 ? '👥 Per Student' : '📦 Flat Rate'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Status</span>
                    <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        backgroundColor: productData.is_active ? '#10b981' : '#f59e0b',
                        fontSize: '0.75rem'
                      }}>
                        {productData.is_active ? 'Active' : 'Pending Activation'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px', color: '#1e293b' }}>Billing Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <div><strong>Client Name:</strong> {productData.billing_details?.client_name}</div>
                <div><strong>Client ID:</strong> {productData.billing_details?.client_id}</div>
                <div><strong>Email:</strong> {productData.billing_details?.email}</div>
                <div><strong>Contact:</strong> {productData.billing_details?.contact_number}</div>
                <div><strong>Organization:</strong> {productData.billing_details?.company_name || productData.billing_details?.school_name}</div>
                <div><strong>Address:</strong> {productData.billing_details?.address}</div>
                <div><strong>City:</strong> {productData.billing_details?.district}, {productData.billing_details?.state}</div>
                <div><strong>PIN Code:</strong> {productData.billing_details?.pin_code}</div>
                <div><strong>GSTIN:</strong> {productData.billing_details?.gstin || '-'}</div>
              </div>
            </div>
            
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>📋 Purchase Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                <div><strong>Purchase Date:</strong> {new Date(productData.purchased_at).toLocaleDateString()}</div>
                <div><strong>Activation Date:</strong> {productData.activated_at ? new Date(productData.activated_at).toLocaleDateString() : 'Pending'}</div>
                <div><strong>Payment Status:</strong> 
                  <span style={{ 
                    marginLeft: '8px', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: productData.payment_status === 'paid' ? '#d1fae5' : '#fef3c7',
                    color: productData.payment_status === 'paid' ? '#059669' : '#d97706'
                  }}>
                    {productData.payment_status}
                  </span>
                </div>
                <div><strong>Amount Paid:</strong> ₹{productData.paid_amount} {productData.currency}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div>
            {hasZeroStudents && perPerson === 1 ? (
              <div style={{ 
                backgroundColor: '#fef3c7', 
                borderRadius: '12px', 
                padding: '24px', 
                marginBottom: '20px',
                textAlign: 'center',
                borderLeft: '4px solid #f59e0b'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#92400e', marginBottom: '12px' }}>
                  Subscription Payments Disabled
                </h3>
                <p style={{ color: '#92400e', marginBottom: '16px' }}>
                  No students found in your school database. You cannot make subscription payments until student records are added.
                </p>
                <button
                  onClick={() => {
                    fetchStudentCount(token);
                    fetchPaymentCycles(token);
                  }}
                  style={{
                    marginTop: '20px',
                    padding: '10px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🔄 Refresh Status
                </button>
              </div>
            ) : perPerson === 0 && hasZeroStudents ? (
              <div style={{ 
                backgroundColor: '#d1fae5', 
                borderRadius: '12px', 
                padding: '24px', 
                marginBottom: '20px',
                borderLeft: '4px solid #10b981'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ fontSize: '24px' }}>ℹ️</div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#065f46', marginBottom: '8px' }}>
                      Flat Rate Product
                    </h3>
                    <p style={{ color: '#065f46', marginBottom: '8px' }}>
                      Your product has a flat rate subscription. Student count is not required for payment calculation.
                    </p>
                    <p style={{ color: '#065f46', fontSize: '0.875rem' }}>
                      You can proceed with subscription payments regardless of student count.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Payment Status Header */}
            <div style={{ 
              backgroundColor: showPayNow ? '#d1fae5' : '#eff6ff', 
              borderRadius: '12px', 
              padding: '20px', 
              marginBottom: '20px',
              borderLeft: `4px solid ${showPayNow ? '#10b981' : '#3b82f6'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {showPayNow ? (
                    <>
                      <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#059669' }}>✅ Payment Required</h3>
                      <p style={{ color: '#059669', marginTop: '4px' }}>
                        {paymentStatus?.message || 'Your subscription period has ended. Please renew your subscription.'}
                      </p>
                      {unpaidMonths && unpaidMonths.length > 0 && (
                        <div style={{ marginTop: '8px', backgroundColor: '#fef3c7', padding: '8px 12px', borderRadius: '6px' }}>
                          <span style={{ fontWeight: 'bold', color: '#92400e' }}>📋 Unpaid Months:</span>
                          <span style={{ color: '#92400e', marginLeft: '8px' }}>{unpaidMonths.join(', ')}</span>
                          {totalDueAmount && (
                            <span style={{ marginLeft: '12px', fontWeight: 'bold', color: '#dc2626' }}>
                              Total Due: ₹{totalDueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#3b82f6' }}>📋 Subscription Status</h3>
                      <p style={{ color: '#3b82f6', marginTop: '4px' }}>
                        {paymentStatus?.message || 'Your subscription is active.'}
                      </p>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => {
                    fetchPaymentStatus(token);
                    fetchPaymentHistory(token);
                  }}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#e2e8f0',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Delivery/Subscription Information */}
            {deliveryInfo && (
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                padding: '20px', 
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>
                  {paymentStatus?.has_previous_payments ? '📦 Subscription Information' : '📦 Delivery Information'}
                </h3>
                
                {paymentStatus?.has_previous_payments ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                    <div><strong>First Payment:</strong> {deliveryInfo.first_payment_date ? new Date(deliveryInfo.first_payment_date).toLocaleDateString() : '-'}</div>
                    <div><strong>Last Payment:</strong> {deliveryInfo.last_payment_date ? new Date(deliveryInfo.last_payment_date).toLocaleDateString() : '-'}</div>
                    <div><strong>Payment Cycle:</strong> <span style={{ textTransform: 'capitalize' }}>{deliveryInfo.last_payment_cycle || '-'}</span></div>
                    <div><strong>Total Payments:</strong> {paymentStatus.total_payments_made}</div>
                    {deliveryInfo.current_period_start && deliveryInfo.current_period_end && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <strong>Current Billing Period:</strong>
                        <span style={{ marginLeft: '8px' }}>
                          {new Date(deliveryInfo.current_period_start).toLocaleDateString()} - {new Date(deliveryInfo.current_period_end).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {deliveryInfo.next_due_date && (
                      <div>
                        <strong>Next Due Date:</strong> 
                        <span style={{ color: deliveryInfo.is_period_over ? '#dc2626' : '#059669' }}>
                          {new Date(deliveryInfo.next_due_date).toLocaleDateString()}
                          {deliveryInfo.days_until_due !== null && deliveryInfo.days_until_due > 0 && 
                            ` (${deliveryInfo.days_until_due} days left)`
                          }
                        </span>
                      </div>
                    )}
                    <div>
                      <strong>Period Status:</strong>
                      <span style={{ color: deliveryInfo.is_period_over ? '#dc2626' : '#059669' }}>
                        {deliveryInfo.is_period_over ? ' ⚠️ Period Ended - Payment Required' : ' ✅ Active'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                      <div><strong>Activated At:</strong> {deliveryInfo.activated_at ? new Date(deliveryInfo.activated_at).toLocaleDateString() : '-'}</div>
                      <div><strong>Delivery After:</strong> {deliveryInfo.delivery_after_days || '-'} days</div>
                      <div><strong>Delivery Date:</strong> {deliveryInfo.delivery_date ? new Date(deliveryInfo.delivery_date).toLocaleDateString() : '-'}</div>
                      <div>
                        <strong>Delivery Status:</strong>
                        <span style={{ color: deliveryInfo.is_delivery_over ? '#10b981' : '#f59e0b' }}>
                          {deliveryInfo.is_delivery_over ? ' ✅ Delivered - Payment Available' : ' ⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Payment History */}
            {paymentHistory && paymentHistory.has_payments !== false && paymentHistory.payments?.length > 0 && (
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                padding: '20px', 
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b' }}>📜 Payment History</h3>
                  <span style={{ backgroundColor: '#e0f2fe', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', color: '#0369a1' }}>
                    Total: {paymentHistory.summary?.total_amount_formatted}
                  </span>
                </div>

                {/* Client Info Card */}
                {paymentHistory.client && (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '12px', fontSize: '0.875rem' }}>🏫 Client & School Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px', fontSize: '0.8rem' }}>
                      <div><span style={{ color: '#64748b' }}>Client ID:</span> <strong>{paymentHistory.client.client_id}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Name:</span> <strong>{paymentHistory.client.client_name}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Contact:</span> <strong>{paymentHistory.client.contact_number}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Email:</span> <strong>{paymentHistory.client.email}</strong></div>
                      {paymentHistory.client.company_name && <div><span style={{ color: '#64748b' }}>Company:</span> <strong>{paymentHistory.client.company_name}</strong></div>}
                      {paymentHistory.client.gstin && <div><span style={{ color: '#64748b' }}>GSTIN:</span> <strong>{paymentHistory.client.gstin}</strong></div>}
                      {paymentHistory.client.school_name && <div><span style={{ color: '#64748b' }}>School:</span> <strong>{paymentHistory.client.school_name}</strong></div>}
                      {paymentHistory.client.school_short_name && <div><span style={{ color: '#64748b' }}>Short Name:</span> <strong>{paymentHistory.client.school_short_name}</strong></div>}
                      {paymentHistory.client.school_session && <div><span style={{ color: '#64748b' }}>Session:</span> <strong>{paymentHistory.client.school_session}</strong></div>}
                      {paymentHistory.client.total_students && <div><span style={{ color: '#64748b' }}>Total Students:</span> <strong>{paymentHistory.client.total_students}</strong></div>}
                      <div><span style={{ color: '#64748b' }}>District:</span> <strong>{paymentHistory.client.district}</strong></div>
                      <div><span style={{ color: '#64748b' }}>State:</span> <strong>{paymentHistory.client.state}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Pin Code:</span> <strong>{paymentHistory.client.pin_code}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Product:</span> <strong>{paymentHistory.client.product_name}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Category:</span> <strong>{paymentHistory.client.product_category}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Processing Fee:</span> <strong>₹{paymentHistory.client.processing_fee?.toLocaleString('en-IN')}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Monthly Sub Rate:</span> <strong>₹{paymentHistory.client.monthly_subscription?.toLocaleString('en-IN')}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Activation:</span> <strong>{paymentHistory.client.activated_at ? new Date(paymentHistory.client.activated_at).toLocaleDateString() : '-'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Delivery Date:</span> <strong>{paymentHistory.client.delivery_date ? new Date(paymentHistory.client.delivery_date).toLocaleDateString() : '-'}</strong></div>
                      {paymentHistory.client.address && (
                        <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#64748b' }}>Address:</span> <strong>{paymentHistory.client.address}</strong></div>
                      )}
                    </div>
                  </div>
                )}

                {/* Summary Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                  <div>
                    <strong>Total Payments:</strong>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>{paymentHistory.summary?.total_payments}</p>
                  </div>
                  <div>
                    <strong>Total Amount Paid:</strong>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{paymentHistory.summary?.total_amount_formatted}</p>
                  </div>
                  <div>
                    <strong>Latest Cycle:</strong>
                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#6b7280' }}>{paymentHistory.summary?.latest_payment_cycle || '-'}</p>
                  </div>
                  {paymentHistory.summary?.next_payment_due_formatted && (
                    <div>
                      <strong>Next Payment:</strong>
                      <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: paymentHistory.summary?.is_overdue ? '#dc2626' : '#059669' }}>
                        {paymentHistory.summary?.next_payment_due_formatted}
                        {paymentHistory.summary?.is_overdue && ' (Overdue)'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Payments Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Payment ID</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Cycle</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>Amount (Subtotal / GST / Total)</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Payment Date</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Months</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', whiteSpace: 'nowrap' }}>Period (Start → End)</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>Carryover</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>Students</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>Status</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.payments.map((payment, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                          {/* # */}
                          <td style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: 'bold' }}>{index + 1}</td>
                          {/* Payment ID */}
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.72rem', color: '#475569' }}>
                            {payment.payment_id ? payment.payment_id.substring(0, 14) + '…' : '-'}
                          </td>
                          {/* Cycle */}
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ 
                              display: 'inline-block', padding: '2px 8px', borderRadius: '12px', 
                              backgroundColor: payment.cycle === 'monthly' ? '#d1fae5' : payment.cycle === 'quarterly' ? '#dbeafe' : payment.cycle === 'half_yearly' ? '#fef3c7' : '#fce7f3',
                              fontSize: '0.7rem', fontWeight: 'bold'
                            }}>
                              {payment.cycle_label}
                            </span>
                          </td>
                          {/* Amount breakdown */}
                          <td style={{ padding: '10px 12px', textAlign: 'right', lineHeight: '1.7' }}>
                            {/* Carryover line – only when carryover exists */}
                            {payment.has_carryover && payment.carryover_amount_before_gst_formatted && (
                              <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>
                                🔄 Carryover ({payment.carryover_days}d): <strong>{payment.carryover_amount_before_gst_formatted}</strong>
                              </div>
                            )}
                            {/* Regular subscription line */}
                            <div style={{ fontSize: '0.7rem', color: '#475569' }}>
                              📆 Subscription ({payment.months_paid} mo): <strong>{payment.regular_amount_before_gst_formatted}</strong>
                            </div>
                            {/* Divider + Subtotal */}
                            <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px dashed #cbd5e1', marginTop: '3px', paddingTop: '3px' }}>
                              Subtotal: <strong>{payment.amount_before_gst_formatted}</strong>
                            </div>
                            {/* GST */}
                            <div style={{ fontSize: '0.72rem', color: '#f59e0b' }}>
                              GST ({payment.gst_percentage}%): <strong>+{payment.gst_amount_formatted}</strong>
                            </div>
                            {/* Total */}
                            <div style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#059669', borderTop: '1px solid #d1fae5', marginTop: '3px', paddingTop: '3px' }}>
                              {payment.amount_formatted}
                            </div>
                          </td>
                          {/* Payment Date */}
                          <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                            {payment.payment_date_formatted}
                          </td>
                          {/* Months Paid */}
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 'bold', color: '#6366f1' }}>
                            {payment.months_paid}
                          </td>
                          {/* Period */}
                          <td style={{ padding: '10px 12px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                            <span style={{ color: '#0369a1', fontWeight: 'bold' }}>{payment.period_covered?.start_date_formatted}</span>
                            <span style={{ color: '#94a3b8', margin: '0 4px' }}>→</span>
                            <span style={{ color: '#be185d', fontWeight: 'bold' }}>{payment.period_covered?.end_date_formatted}</span>
                          </td>
                          {/* Carryover */}
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            {payment.has_carryover ? (
                              <div style={{ fontSize: '0.7rem' }}>
                                <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '10px', backgroundColor: '#dbeafe', color: '#1d4ed8', fontWeight: 'bold', marginBottom: '4px' }}>
                                  ✓ {payment.carryover_days} days
                                </span>
                                <div style={{ color: '#64748b', fontSize: '0.65rem' }}>
                                  {payment.carryover_from_formatted} → {payment.carryover_to_formatted}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>—</span>
                            )}
                          </td>
                          {/* Students */}
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            {payment.student_count != null ? (
                              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                👥 {payment.student_count}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Flat</span>
                            )}
                          </td>
                          {/* Status */}
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#d1fae5', color: '#059669', fontSize: '0.7rem', fontWeight: 'bold' }}>
                              ✓ Paid
                            </span>
                          </td>
                          {/* Invoice Action */}
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#64748b' }}>
                                {payment.invoice_id || '—'}
                              </span>
                              {payment.invoice_id && (
                                <button
                                  onClick={() => {
                                    setSelectedInvoicePayment(payment);
                                    setShowInvoiceModal(true);
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px'
                                  }}
                                >
                                  📄 View / PDF
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* PayNow Button */}
            {showPayNow ? (
              <div style={{ 
                backgroundColor: '#10b981', 
                borderRadius: '12px', 
                padding: '24px', 
                marginBottom: '20px',
                textAlign: 'center',
                color: 'white'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>💰 Ready to Pay?</h3>
                <p style={{ marginBottom: '16px', opacity: 0.9 }}>
                  {paymentStatus?.has_previous_payments 
                    ? `Your subscription period has ended. ${unpaidMonths && unpaidMonths.length > 0 ? `Unpaid months: ${unpaidMonths.join(', ')}.` : ''} Please pay your dues to continue services.`
                    : 'Make your first subscription payment to activate your services.'}
                </p>
                {totalDueAmount && (
                  <p style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    Total Due: ₹{totalDueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                )}
                <button
                  onClick={() => {
                    setActiveTab('subscription-payment');
                    setTimeout(() => setShowBillModal(true), 500);
                  }}
                  style={{
                    padding: '12px 32px',
                    backgroundColor: 'white',
                    color: '#10b981',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  💳 Make Payment Now
                </button>
              </div>
            ) : paymentStatus?.has_previous_payments && (
              <div style={{ 
                backgroundColor: '#f3f4f6', 
                borderRadius: '12px', 
                padding: '24px', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#6b7280' }}>⏳ Subscription Active</h3>
                <p style={{ color: '#6b7280', marginTop: '8px' }}>
                  {nextPaymentDate ? `Next payment available from ${new Date(nextPaymentDate).toLocaleDateString()}` : 'Your subscription is active.'}
                </p>
              </div>
            )}

            {/* Student Count */}
            {studentCount && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>👨‍🎓 Student Count</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>School: <strong>{studentCount.school_name}</strong></p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{studentCount.student_count} Students</p>
                    {perPerson === 0 && (
                      <p style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>
                        ✅ Flat rate product - student count does not affect pricing
                      </p>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Last updated: {new Date(studentCount.last_updated).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Subscription Payment Tab */}
        {activeTab === 'subscription-payment' && (
          <div>
            {hasZeroStudents && perPerson === 1 ? (
              <div style={{ 
                backgroundColor: '#fee2e2', 
                borderRadius: '12px', 
                padding: '40px', 
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '12px' }}>
                  Cannot Process Payment
                </h3>
                <p style={{ color: '#dc2626', marginBottom: '16px' }}>
                  No students found in your school database. Please add student records first.
                </p>
                <button
                  onClick={() => setActiveTab('subscription')}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to Subscription
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <button
                    onClick={() => setActiveTab('subscription')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    ← Back to Subscription
                  </button>
                </div>

                {/* Unpaid months warning */}
                {unpaidMonths && unpaidMonths.length > 0 && (
                  <div style={{
                    backgroundColor: '#fef3c7',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px',
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <h4 style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '8px' }}>📋 Unpaid Months</h4>
                    <p style={{ color: '#92400e' }}>
                      You have unpaid months: <strong>{unpaidMonths.join(', ')}</strong>
                      {totalDueAmount && (
                        <span style={{ display: 'block', marginTop: '4px' }}>
                          Total Due: <strong>₹{totalDueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                        </span>
                      )}
                    </p>
                    <p style={{ color: '#92400e', fontSize: '0.875rem', marginTop: '8px' }}>
                      Your payment will cover all these months.
                    </p>
                  </div>
                )}

                {/* Payment Cycles */}
                {!paymentCycles?.is_extra_students_payment && (
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>💳 Select Payment Cycle</h3>
                    
                    {!paymentCycles && !loadingSubscription ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        <p>Loading payment options...</p>
                      </div>
                    ) : paymentCycles?.cycles ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                        {cycleOrder.map((cycleKey) => {
                          const data = paymentCycles.cycles[cycleKey];
                          if (!data) return null;
                          return (
                            <div 
                              key={cycleKey}
                              onClick={() => handleCycleChange(cycleKey)}
                              style={{
                                padding: '20px',
                                borderRadius: '12px',
                                border: `2px solid ${selectedCycle === cycleKey ? '#3b82f6' : '#e2e8f0'}`,
                                backgroundColor: selectedCycle === cycleKey ? '#eff6ff' : 'white',
                                cursor: 'pointer',
                                textAlign: 'center'
                              }}
                            >
                              <h4 style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                                {cycleDisplayNames[cycleKey]}
                              </h4>
                              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Discount: {data.discount}%</p>
                              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6' }}>₹{data.discounted_monthly}/month</p>
                              <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                <p>Total: ₹{data.total}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Unable to load payment options</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Payment Summary */}
                {calculatedAmount && selectedCycle && (
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '20px' }}>
                      🧮 Payment Summary
                      {calculatedAmount.is_first_payment && (
                        <span style={{ 
                          display: 'inline-block', 
                          marginLeft: '12px', 
                          fontSize: '0.75rem', 
                          backgroundColor: '#dbeafe', 
                          color: '#1e40af',
                          padding: '2px 12px',
                          borderRadius: '20px',
                          fontWeight: 'normal'
                        }}>
                          First Payment
                        </span>
                      )}
                      {!calculatedAmount.is_first_payment && paymentStatus?.has_previous_payments && (
                        <span style={{ 
                          display: 'inline-block', 
                          marginLeft: '12px', 
                          fontSize: '0.75rem', 
                          backgroundColor: '#d1fae5', 
                          color: '#065f46',
                          padding: '2px 12px',
                          borderRadius: '20px',
                          fontWeight: 'normal'
                        }}>
                          Regular Payment
                        </span>
                      )}
                      {calculatedAmount.product?.per_person == 0 && (
                        <span style={{ 
                          display: 'inline-block', 
                          marginLeft: '12px', 
                          fontSize: '0.75rem', 
                          backgroundColor: '#fce7f3', 
                          color: '#9d174d',
                          padding: '2px 12px',
                          borderRadius: '20px',
                          fontWeight: 'normal'
                        }}>
                          Flat Rate
                        </span>
                      )}
                    </h3>
                    
                    {/* Breakdown */}
                    {calculatedAmount.calculation && (
                      <>
                        <div style={{ 
                          backgroundColor: '#f8fafc', 
                          padding: '16px', 
                          borderRadius: '8px', 
                          marginBottom: '16px'
                        }}>
                          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '8px' }}>
                            📊 <strong>Payment Breakdown:</strong>
                          </p>
                          
                          {/* Pricing Formula Display */}
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#dbeafe',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            borderLeft: '3px solid #3b82f6'
                          }}>
                            <p style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                              <strong>📊 Pricing Formula:</strong>
                              {calculatedAmount.product?.per_person == 1 ? (
                                <span>
                                  ₹{calculatedAmount.product?.monthly_subscription || calculatedAmount.calculation?.base_monthly_amount} × {calculatedAmount.student_count} students = ₹{calculatedAmount.calculation?.base_monthly_amount} per month
                                </span>
                              ) : (
                                <span>
                                  Flat Rate: ₹{calculatedAmount.product?.monthly_subscription || calculatedAmount.calculation?.base_monthly_amount} per month (not per student)
                                </span>
                              )}
                            </p>
                          </div>
                          
                          {calculatedAmount.is_first_payment && calculatedAmount.carryover_message && (
                            <div style={{ 
                              padding: '12px', 
                              backgroundColor: '#e0f2fe', 
                              borderRadius: '6px', 
                              marginBottom: '8px'
                            }}>
                              <p style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                                <strong>🔄 Carryover Period:</strong> {calculatedAmount.carryover_message}
                              </p>
                              <div style={{ fontSize: '0.8rem', color: '#1e40af', marginTop: '4px' }}>
                                <p>📌 Carryover Fraction: <strong>{calculatedAmount.calculation.carryover_fraction ? (calculatedAmount.calculation.carryover_fraction * 100).toFixed(1) : 0}%</strong> of month</p>
                                <p>💰 Carryover Amount (Base): ₹{calculatedAmount.calculation.carryover_amount?.toLocaleString() || 0}</p>
                              </div>
                            </div>
                          )}
                          
                          <div style={{ 
                            padding: '12px', 
                            backgroundColor: '#d1fae5', 
                            borderRadius: '6px'
                          }}>
                            <p style={{ fontSize: '0.85rem', color: '#065f46' }}>
                              <strong>📆 {calculatedAmount.calculation.is_extra_students_payment ? 'Extra Students Subscription' : `${cycleDisplayNames[selectedCycle]} Period`}:</strong> {calculatedAmount.calculation.cycle_months || 0} month(s)
                              {calculatedAmount.is_first_payment && (
                                <span style={{ marginLeft: '8px', fontSize: '0.75rem', opacity: 0.8 }}>
                                  (Starting from next month)
                                </span>
                              )}
                            </p>
                          </div>
                          
                          <div style={{ 
                            marginTop: '12px', 
                            padding: '12px', 
                            backgroundColor: '#fef3c7', 
                            borderRadius: '6px',
                            textAlign: 'center'
                          }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#92400e' }}>
                              📌 Total Months to Pay: <strong>{calculatedAmount.calculation.total_months || 0}</strong> month(s)
                              {calculatedAmount.is_first_payment && calculatedAmount.calculation.carryover_fraction && (
                                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '8px' }}>
                                  (Carryover {calculatedAmount.calculation.carryover_fraction ? (calculatedAmount.calculation.carryover_fraction * 100).toFixed(1) : 0}% + {calculatedAmount.calculation.cycle_months || 0} months)
                                </span>
                              )}
                            </p>
                          </div>
                          
                          <div style={{ 
                            marginTop: '12px', 
                            padding: '12px', 
                            backgroundColor: '#f3e8ff', 
                            borderRadius: '6px',
                            border: '1px solid #dbeafe'
                          }}>
                            <p style={{ fontSize: '0.8rem', color: '#1e40af', textAlign: 'center' }}>
                              <strong>Calculation Order:</strong> 1️⃣ Total months → 2️⃣ Apply Discount → 3️⃣ Apply GST
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div style={{ marginBottom: '24px' }}>
                      {calculatedAmount.calculation?.base_total && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                          <span>Base Total ({calculatedAmount.calculation.total_months || 0} months):</span>
                          <strong>₹{calculatedAmount.calculation.base_total?.toLocaleString()}</strong>
                        </div>
                      )}
                      
                      {calculatedAmount.calculation?.discount_percentage > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                          <span>Discount ({calculatedAmount.calculation.discount_percentage}%):</span>
                          <strong style={{ color: '#059669' }}>
                            -₹{((calculatedAmount.calculation.base_total || 0) - (calculatedAmount.calculation.discounted_total || 0)).toLocaleString()}
                          </strong>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                        <span>Subtotal (after discount):</span>
                        <strong>₹{calculatedAmount.calculation?.discounted_total?.toLocaleString()}</strong>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                        <span>GST ({calculatedAmount.calculation?.gst_percentage || 18}%):</span>
                        <strong style={{ color: '#f59e0b' }}>₹{calculatedAmount.calculation?.gst_amount?.toLocaleString()}</strong>
                      </div>

                      {calculatedAmount.calculation?.extra_students_overdue > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0', color: '#dc2626' }}>
                          <span>⚠️ Overdue (Extra Students from previous cycle):</span>
                          <strong>₹{calculatedAmount.calculation.extra_students_overdue.toLocaleString()}</strong>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '2px solid #e2e8f0', marginTop: '8px', backgroundColor: '#eff6ff', borderRadius: '8px', marginTop: '12px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total Amount (incl. GST + Overdue):</span>
                        <strong style={{ fontSize: '1.5rem', color: '#3b82f6' }}>₹{calculatedAmount.calculation?.total_amount?.toLocaleString()}</strong>
                      </div>
                      
                      {calculatedAmount.calculation?.savings > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#d1fae5', marginTop: '12px', borderRadius: '8px' }}>
                          <span>💰 Your Total Savings:</span>
                          <strong style={{ color: '#059669' }}>₹{calculatedAmount.calculation?.savings?.toLocaleString()}</strong>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setShowBillModal(true)}
                      style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                      }}
                    >
                      📄 View Bill & Pay
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Customization Tab */}
        {activeTab === 'customization' && (
          <div>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', color: '#1e293b' }}>
                ✏️ Submit Customization Request
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
                Need custom features or modifications? Describe your requirements below and our team will review and provide a quote.
              </p>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Customization Details <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={customizationText}
                  onChange={(e) => setCustomizationText(e.target.value)}
                  placeholder="Please describe in detail what customizations you need..."
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  Minimum 10 characters. Max 5000 characters.
                </div>
              </div>
              
              <button
                onClick={submitCustomizationRequest}
                disabled={submittingCustomization || !customizationText.trim() || customizationText.length < 10}
                style={{
                  padding: '12px 24px',
                  backgroundColor: (submittingCustomization || !customizationText.trim() || customizationText.length < 10) ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (submittingCustomization || !customizationText.trim() || customizationText.length < 10) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {submittingCustomization ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>
                  📋 My Customization Requests
                </h3>
                <button
                  onClick={() => fetchCustomizationRequests(token)}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#e2e8f0',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
              
              {loadingCustomizations ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <p>Loading your requests...</p>
                </div>
              ) : customizationRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <p style={{ color: '#64748b', marginBottom: '8px' }}>No customization requests yet</p>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Submit your first customization request using the form above</p>
                </div>
              ) : (
                <div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '12px', 
                    marginBottom: '24px',
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <strong>Total Requests:</strong>
                      <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>{customizationRequests.length}</p>
                    </div>
                    <div>
                      <strong>Pending:</strong>
                      <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#f59e0b' }}>
                        {customizationRequests.filter(r => r.status === 'pending').length}
                      </p>
                    </div>
                    <div>
                      <strong>Amount Set:</strong>
                      <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#3b82f6' }}>
                        {customizationRequests.filter(r => r.amount && r.amount > 0).length}
                      </p>
                    </div>
                    <div>
                      <strong>Approved:</strong>
                      <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#10b981' }}>
                        {customizationRequests.filter(r => r.status === 'approved').length}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {customizationRequests.map((request) => {
                      const statusBadge = getStatusBadge(request.status);
                      const displayAmount = request.amount || request.amount_value;
                      
                      return (
                        <div 
                          key={request.id}
                          style={{
                            padding: '20px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            borderLeft: `4px solid ${statusBadge.color}`,
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                              <span style={{ 
                                display: 'inline-block', 
                                padding: '4px 12px', 
                                borderRadius: '20px',
                                backgroundColor: statusBadge.bg,
                                color: statusBadge.color,
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}>
                                {statusBadge.text}
                              </span>
                              <span style={{ 
                                marginLeft: '12px',
                                fontSize: '0.7rem',
                                color: '#64748b'
                              }}>
                                Request #{request.id}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              Submitted: {new Date(request.submitted_at).toLocaleString()}
                            </div>
                          </div>
                          
                          <div style={{ 
                            backgroundColor: 'white', 
                            padding: '16px', 
                            borderRadius: '8px', 
                            marginBottom: '16px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <p style={{ fontSize: '0.875rem', color: '#334155', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {request.customization_text}
                            </p>
                          </div>
                          
                          {displayAmount && displayAmount > 0 && (
                            <div style={{ 
                              padding: '12px', 
                              backgroundColor: '#dbeafe', 
                              borderRadius: '8px', 
                              marginBottom: '12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{ fontWeight: 'bold', color: '#1e40af' }}>💰 Admin Quoted Amount:</span>
                              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e40af' }}>
                                {request.amount_formatted || formatAmount(displayAmount)}
                              </span>
                            </div>
                          )}
                          
                          {request.admin_notes && (
                            <div style={{ 
                              padding: '12px', 
                              backgroundColor: '#fef3c7', 
                              borderRadius: '8px',
                              fontSize: '0.8rem'
                            }}>
                              <strong>📝 Admin Note:</strong>
                              <p style={{ marginTop: '4px', color: '#92400e' }}>{request.admin_notes}</p>
                            </div>
                          )}
                          
                          {request.amount_set_at && displayAmount && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '12px', textAlign: 'right' }}>
                              Amount set on: {new Date(request.amount_set_at).toLocaleString()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add-on Services Tab */}
        {activeTab === 'addon' && (
          <div>
            {perPerson != 1 ? (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔌</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                  Student-Based Add-on Services Only
                </h3>
                <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>
                  Your current subscription is a flat rate plan. Add-on services (such as Transportation, Hostel, ID Card, etc.) are only available for student-count based subscription plans.
                </p>
              </div>
            ) : (
              <div>
                {/* 🛒 Add-on Shopping Cart Widget */}
                {addonCart.items && addonCart.items.length > 0 && (
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🛒 Add-on Shopping Cart ({addonCart.item_count})
                      </h3>
                      <button
                        onClick={clearAddonCart}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}
                      >
                        🗑️ Clear Cart
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                      {addonCart.items.map((item) => (
                        <div key={item.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 16px',
                          backgroundColor: 'white',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div>
                            <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>
                              {item.addon_type === 'Transportation' ? '🚌 Transportation' : item.addon_type === 'hostel' ? '🏢 Hostel' : item.addon_type === 'previous_year' ? '📅 Previous Year Dues' : `🪪 ID Card (${item.recipient_type === 'teacher' ? 'Staff' : 'Student'})`}
                            </strong>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                              {item.recipient_type === 'teacher' ? 'Teachers' : 'Students'}: {item.student_count} | Period: {new Date(item.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - {new Date(item.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <strong style={{ color: '#1e293b' }}>₹{parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                            <button
                              onClick={() => removeAddonFromCart(item.id)}
                              style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                transition: 'color 0.2s',
                              }}
                              onMouseOver={(e) => e.target.style.color = '#ef4444'}
                              onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                              title="Remove item"
                            >
                              ❌
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>Subtotal: <strong>{addonCart.total_subtotal_formatted}</strong></div>
                        <div>GST (18%): <strong>{addonCart.total_gst_formatted}</strong></div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Grand Total:</span>
                        <strong style={{ fontSize: '1.4rem', color: '#2563eb' }}>{addonCart.total_amount_formatted}</strong>
                      </div>
                    </div>

                    <button
                      onClick={processCartPayment}
                      disabled={processingCartPayment}
                      style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: processingCartPayment ? '#9ca3af' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: processingCartPayment ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        transition: 'background-color 0.2s',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                      }}
                    >
                      {processingCartPayment ? 'Processing Cart Payment...' : `💳 Pay for All Cart Items (${addonCart.total_amount_formatted})`}
                    </button>
                  </div>
                )}

                {/* Sub-tabs for Add-on types */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
                  {['Transportation', 'hostel', 'previous_year', 'id card'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedAddonType(type);
                        setError('');
                        setSuccess('');
                        const previewType = type === 'id card' ? 'id card ' + selectedIdCardType : type;
                        fetchAddonPreview(previewType, token);
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: selectedAddonType === type ? '#dbeafe' : 'transparent',
                        color: selectedAddonType === type ? '#1e40af' : '#64748b',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {type === 'Transportation' && '🚌 Transportation'}
                      {type === 'hostel' && '🏢 Hostel'}
                      {type === 'previous_year' && '📅 Previous Year Dues'}
                      {type === 'id card' && '🪪 ID Card Printing'}
                    </button>
                  ))}
                </div>

                {selectedAddonType === 'id card' && (
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>
                      🏷️ Select ID Card Design / Type:
                    </h4>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {['Type A', 'Type B', 'Type C'].map(type => (
                        <label key={type} style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '12px 16px',
                          border: selectedIdCardType === type ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                          backgroundColor: selectedIdCardType === type ? '#f0f9ff' : 'white',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: selectedIdCardType === type ? 'bold' : 'normal',
                          color: selectedIdCardType === type ? '#1d4ed8' : '#64748b',
                          transition: 'all 0.2s'
                        }}>
                          <input
                            type="radio"
                            name="id_card_type"
                            value={type}
                            checked={selectedIdCardType === type}
                            onChange={(e) => {
                              setSelectedIdCardType(e.target.value);
                              fetchAddonPreview('id card ' + e.target.value, token, selectedRecipientType);
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                    <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>
                        👥 Select Recipient Group:
                      </h4>
                      <select
                        value={selectedRecipientType}
                        onChange={(e) => {
                          setSelectedRecipientType(e.target.value);
                          fetchAddonPreview('id card ' + selectedIdCardType, token, e.target.value);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          fontSize: '0.9rem',
                          color: '#1e293b',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="student">Students (Active Enrollment Count)</option>
                        <option value="teacher">Teachers (Active Staff Count)</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedAddonType !== 'Transportation' && selectedAddonType !== 'hostel' && selectedAddonType !== 'previous_year' && selectedAddonType !== 'id card' ? (
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛠️</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                      Coming Soon!
                    </h3>
                    <p style={{ color: '#64748b' }}>
                      Online payment for the {selectedAddonType} add-on service is currently under development. Please check back later.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Active Addon Calculator */}
                    {loadingAddon ? (
                      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                        <p style={{ color: '#64748b' }}>
                          ⏳ Fetching active {selectedAddonType === 'Transportation' ? 'transportation assignments' : selectedAddonType === 'hostel' ? 'hostel allocations' : selectedAddonType === 'previous_year' ? 'previous session students' : 'total student records'} and calculating fee...
                        </p>
                      </div>
                    ) : addonPreview ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                        {/* Service Summary Card */}
                        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
                            {selectedAddonType === 'Transportation' ? '🚌 Transportation Details' : selectedAddonType === 'hostel' ? '🏢 Hostel Details' : selectedAddonType === 'previous_year' ? '📅 Previous Year Dues Details' : `🪪 ID Card Printing Details (${selectedRecipientType === 'teacher' ? 'Staff' : 'Students'})`}
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>
                                {selectedAddonType === 'Transportation' ? 'Active Bus Assignments:' : selectedAddonType === 'hostel' ? 'Active Hostel Allocations:' : selectedAddonType === 'previous_year' ? 'Old Session Active Students:' : (selectedRecipientType === 'teacher' ? 'Total Active Staff:' : 'Total Active Students:')}
                              </span>
                              <strong>{selectedRecipientType === 'teacher' ? '👨‍🏫' : '👥'} {addonPreview.student_count} {selectedRecipientType === 'teacher' ? 'Teachers' : 'Students'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>Start Date (Payment Date):</span>
                              <strong>{addonPreview.start_date_formatted}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#64748b' }}>End Date (Subscription End):</span>
                              <strong>{addonPreview.end_date_formatted}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1' }}>
                              <span style={{ color: '#64748b' }}>Remaining Duration:</span>
                              <strong>
                                {addonPreview.duration_days} days ({addonPreview.duration_months} months)
                              </strong>
                            </div>
                            <div style={{ color: '#0284c7', backgroundColor: '#e0f2fe', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center', marginTop: '8px' }}>
                              💡 Rate: <strong>{addonPreview.rate_label}</strong>.
                            </div>
                          </div>
                        </div>

                        {/* Amount breakdown and checkout card */}
                        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
                              💳 Add-on Checkout
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem', marginBottom: '20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Subtotal (proportional rate):</span>
                                <strong>{addonPreview.subtotal_formatted}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>GST ({addonPreview.gst_percentage}%):</span>
                                <strong style={{ color: '#f59e0b' }}>+{addonPreview.gst_amount_formatted}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #e2e8f0', marginTop: '4px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Total Amount to Pay:</span>
                                <strong style={{ color: '#2563eb', fontSize: '1.25rem' }}>{addonPreview.amount_formatted}</strong>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                              onClick={processAddonPayment}
                              disabled={processingAddonPayment}
                              style={{
                                flex: 1,
                                padding: '14px',
                                backgroundColor: processingAddonPayment ? '#9ca3af' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: processingAddonPayment ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                transition: 'background-color 0.2s'
                              }}
                            >
                              {processingAddonPayment ? 'Processing...' : '💳 Pay Now'}
                            </button>
                            <button
                              onClick={addCurrentAddonToCart}
                              disabled={addingToCart || !addonPreview}
                              style={{
                                flex: 1,
                                padding: '14px',
                                backgroundColor: (addingToCart || !addonPreview) ? '#9ca3af' : '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: (addingToCart || !addonPreview) ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                              }}
                            >
                              {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                        <p style={{ color: '#dc2626' }}>⚠️ Error loading preview details. Please make sure your subscription is active and has a valid end date.</p>
                        <button
                          onClick={() => fetchAddonPreview(selectedAddonType, token)}
                          style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Retry Calculation
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Add-on Payment History Table */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>
                      📜 Add-on Services Payment History
                    </h3>
                    <button
                      onClick={() => fetchAddonHistory(token)}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#e2e8f0',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  {addonHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                      <p style={{ color: '#64748b' }}>No add-on payment history found.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f8fafc' }}>
                            <th style={{ padding: '12px 8px' }}>Add-on Type</th>
                            <th style={{ padding: '12px 8px' }}>Count</th>
                            <th style={{ padding: '12px 8px' }}>Period Covered</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right' }}>Amount Breakdown</th>
                            <th style={{ padding: '12px 8px' }}>Payment ID</th>
                            <th style={{ padding: '12px 8px' }}>Date Paid</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {addonHistory.map((payment) => (
                            <tr key={payment.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>
                                <span style={{ 
                                  backgroundColor: payment.addon_type === 'Transportation' ? '#e0f2fe' : '#f3e8ff', 
                                  color: payment.addon_type === 'Transportation' ? '#0369a1' : '#6b21a8',
                                  padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem'
                                }}>
                                  {payment.addon_type}
                                </span>
                                {payment.recipient_type && (
                                  <span style={{ 
                                    marginLeft: '6px',
                                    backgroundColor: payment.recipient_type === 'teacher' ? '#fef3c7' : '#d1fae5', 
                                    color: payment.recipient_type === 'teacher' ? '#92400e' : '#065f46',
                                    padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem'
                                  }}>
                                    {payment.recipient_type === 'teacher' ? 'Staff' : 'Students'}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                {payment.recipient_type === 'teacher'
                                  ? `👨‍🏫 ${payment.teacher_count || payment.student_count || 0} teachers`
                                  : (payment.student_count ? `👥 ${payment.student_count} students` : '-')}
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '0.8rem' }}>
                                {payment.start_date_formatted} → {payment.end_date_formatted}
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Subtotal: {payment.subtotal_formatted}</div>
                                <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>GST (18%): +{payment.gst_amount_formatted}</div>
                                <strong style={{ color: '#10b981' }}>{payment.amount_formatted}</strong>
                              </td>
                              <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                {payment.payment_id || '-'}
                              </td>
                              <td style={{ padding: '12px 8px', fontSize: '0.8rem', color: '#64748b' }}>
                                {payment.payment_date_formatted}
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                <span style={{ 
                                  backgroundColor: '#d1fae5', 
                                  color: '#065f46', 
                                  padding: '2px 8px', 
                                  borderRadius: '20px', 
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold'
                                }}>
                                  ✓ Paid
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Bill Modal */}
      <BillModal />
      
      {/* Invoice Modal */}
      <InvoiceModal />
    </div>
  );
};

export default ClientPortal;