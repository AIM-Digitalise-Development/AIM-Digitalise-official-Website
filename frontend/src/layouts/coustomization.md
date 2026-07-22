import { useState, useEffect, useRef } from 'react';

const API_URL = 'https://api.nexgn.in/api';

const ClientPortal = () => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [clientData, setClientData] = useState(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Data States
  const [profileData, setProfileData] = useState(null);
  const [productData, setProductData] = useState(null);
  
  // Product Pricing Info
  const [perPerson, setPerPerson] = useState(1);
  const [monthlySubscription, setMonthlySubscription] = useState(0);
  
  // Subscription States (kept for reference but not shown as tab)
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
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);
  const [studentCountWarning, setStudentCountWarning] = useState(null);
  const [hasZeroStudents, setHasZeroStudents] = useState(false);
  
  // Customization Request States
  const [customizationRequests, setCustomizationRequests] = useState([]);
  const [loadingCustomizations, setLoadingCustomizations] = useState(false);
  const [customizationText, setCustomizationText] = useState('');
  const [submittingCustomization, setSubmittingCustomization] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Customization Payment States
  const [pendingCustomPayments, setPendingCustomPayments] = useState([]);
  const [loadingPendingPayments, setLoadingPendingPayments] = useState(false);
  const [processingCustomPayment, setProcessingCustomPayment] = useState(false);
  const [customPaymentHistory, setCustomPaymentHistory] = useState([]);
  const [loadingCustomPaymentHistory, setLoadingCustomPaymentHistory] = useState(false);
  
  // Bill/Invoice State
  const [showBillModal, setShowBillModal] = useState(false);
  const [billData, setBillData] = useState(null);
  const billRef = useRef(null);
  
  // Login Form
  const [loginData, setLoginData] = useState({
    client_id: '',
    password: ''
  });
  
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
      const checkResponse = await fetch(`${API_URL}/client/check`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const checkResult = await checkResponse.json();
      
      if (!checkResult.success || !checkResult.authenticated) {
        localStorage.removeItem('client_token');
        localStorage.removeItem('client_data');
        setIsLoggedIn(false);
        setToken(null);
        setClientData(null);
        setError('Session expired. Please login again.');
        return;
      }
      
      await Promise.all([
        fetchProfile(authToken),
        fetchMyProducts(authToken),
        fetchStudentCount(authToken),
        fetchPaymentCycles(authToken),
        fetchPaymentStatus(authToken),
        fetchPaymentHistory(authToken),
        fetchCustomizationRequests(authToken),
        fetchPendingCustomizationPayments(authToken),
        fetchCustomPaymentHistory(authToken)
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
  
  // Fetch Student Count
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
  
  // Fetch Payment Cycles
  const fetchPaymentCycles = async (authToken) => {
    setLoadingSubscription(true);
    try {
      const response = await fetch(`${API_URL}/client/payment-cycles`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      if (result.success) {
        setPaymentCycles(result.data);
        if (result.data.per_person !== undefined) {
          setPerPerson(result.data.per_person);
        }
        if (result.data.monthly_subscription !== undefined) {
          setMonthlySubscription(result.data.monthly_subscription);
        }
        calculateSubscriptionForCycle('annual', authToken);
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
        } else {
          setError(result.message || 'Failed to load payment options');
        }
      }
    } catch (err) {
      console.error('Payment cycles fetch error:', err);
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
  
  // Calculate Subscription
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
        if (result.data.product?.per_person !== undefined) {
          setPerPerson(result.data.product.per_person);
        }
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
  
  // Generate Bill Data (for subscription)
  const generateBillData = (data, cycle) => {
    if (!data || !data.calculation) return;
    
    const calc = data.calculation;
    const isFirst = data.is_first_payment;
    const perPersonValue = data.product?.per_person || 1;
    
    const baseMonthlyAmount = calc.base_monthly_amount || 0;
    const discountPercentage = calc.discount_percentage || 0;
    const cycleMonths = calc.cycle_months || 1;
    const carryoverFraction = calc.carryover_fraction || 0;
    const carryoverDays = calc.carryover_days || 0;
    const daysInMonth = calc.carryover_days_in_month || 30;
    const gstPercentage = calc.gst_percentage || 18;
    
    const discountedMonthlyAmount = baseMonthlyAmount * (1 - discountPercentage / 100);
    const carryoverAmount = discountedMonthlyAmount * carryoverFraction;
    const regularMonthsAmount = discountedMonthlyAmount * cycleMonths;
    const totalAmount = carryoverAmount + regularMonthsAmount;
    const gstAmount = (totalAmount * gstPercentage) / 100;
    const totalWithGST = totalAmount + gstAmount;
    
    const baseCarryover = baseMonthlyAmount * carryoverFraction;
    const baseRegular = baseMonthlyAmount * cycleMonths;
    const baseTotal = baseCarryover + baseRegular;
    const originalTotalWithGST = baseTotal + (baseTotal * gstPercentage / 100);
    const savings = baseTotal - totalAmount;
    
    const clientName = data.client?.client_name || clientData?.name || '';
    const clientId = data.client?.client_id || clientData?.client_id || '';
    const schoolName = data.client?.school_name || '';
    const productName = data.product?.name || '';
    
    const today = new Date();
    const invoiceDate = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
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
    
    const bill = {
      invoiceNumber,
      invoiceDate,
      clientName,
      clientId,
      schoolName,
      productName,
      cycle: cycle.charAt(0).toUpperCase() + cycle.slice(1),
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
      cycleMonths,
      monthlySubscription: data.product?.monthly_subscription || 0,
      billType: 'subscription'
    };
    
    setBillData(bill);
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
  
  // Refresh subscription data after payment
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
      setSuccess('✅ Payment completed successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Payment completed but error refreshing data. Please refresh the page.');
    } finally {
      setLoadingSubscription(false);
    }
  };
  
  // Process Subscription Payment
  const processSubscriptionPayment = async () => {
    if (hasZeroStudents && perPerson === 1) {
      setError('Cannot process payment: No students found in your school database. Please add student records first.');
      return;
    }
    
    if (!calculatedAmount) {
      setError('Please calculate subscription amount first');
      return;
    }
    
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
          `SIMULATION MODE\n\nAmount: ₹${orderResult.amount}\nCycle: ${orderResult.cycle}\n\nClick OK to simulate payment`
        );
        
        if (confirmPayment) {
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
              is_first_payment: orderResult.is_first_payment || false
            })
          });
          
          if (handleUnauthorized(verifyResponse)) {
            setProcessingPayment(false);
            return;
          }
          
          const verifyResult = await verifyResponse.json();
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
                is_first_payment: orderResult.is_first_payment || false
              })
            });
            
            if (handleUnauthorized(verifyResponse)) {
              setProcessingPayment(false);
              return;
            }
            
            const verifyResult = await verifyResponse.json();
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
  
  // ============================================
  // CUSTOMIZATION REQUESTS
  // ============================================
  
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
  
  const submitCustomizationRequest = async () => {
    if (!customizationText.trim() || customizationText.length < 10) {
      setError('Please enter at least 10 characters describing your customization needs');
      return;
    }
    
    setSubmittingCustomization(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('customization_text', customizationText);
      if (selectedFiles && selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append('attachments[]', selectedFiles[i]);
        }
      }
      
      const response = await fetch(`${API_URL}/client/customization/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      if (result.success) {
        setSuccess('Customization request submitted successfully!');
        setCustomizationText('');
        setSelectedFiles([]);
        await Promise.all([
          fetchCustomizationRequests(token),
          fetchPendingCustomizationPayments(token)
        ]);
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
  
  // ============================================
  // CUSTOMIZATION PAYMENTS
  // ============================================
  
  const fetchPendingCustomizationPayments = async (authToken) => {
    setLoadingPendingPayments(true);
    try {
      const response = await fetch(`${API_URL}/client/customization/pending-payments`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      if (result.success) {
        setPendingCustomPayments(result.data.pending_requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending payments:', err);
    } finally {
      setLoadingPendingPayments(false);
    }
  };
  
  const fetchCustomPaymentHistory = async (authToken) => {
    setLoadingCustomPaymentHistory(true);
    try {
      const response = await fetch(`${API_URL}/client/customization/payment-history`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (handleUnauthorized(response)) return;
      
      const result = await response.json();
      if (result.success) {
        setCustomPaymentHistory(result.data.payments || []);
      }
    } catch (err) {
      console.error('Failed to fetch customization payment history:', err);
    } finally {
      setLoadingCustomPaymentHistory(false);
    }
  };
  
  // ✅ FIXED: Generate Customization Bill with correct amount
  const generateCustomizationBill = (paymentsArray) => {
    const payments = Array.isArray(paymentsArray) ? paymentsArray : [paymentsArray];
    const baseAmount = payments.reduce((sum, p) => sum + (p.base_amount || p.amount || 0), 0);
    const gstPercentage = 18;
    const gstAmount = (baseAmount * gstPercentage) / 100;
    const totalWithGST = baseAmount + gstAmount;
    
    const today = new Date();
    const invoiceDate = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const invoiceNumber = `CUST-INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const bill = {
      invoiceNumber,
      invoiceDate,
      clientName: clientData?.name || '',
      clientId: clientData?.client_id || '',
      requestId: payments.length === 1 ? payments[0].id : 'CONSOLIDATED',
      customizationText: payments.length === 1 
        ? (payments[0].customization_text || payments[0].full_text || '') 
        : `Consolidated payment for ${payments.length} customization requests.`,
      baseAmount: baseAmount,
      gstPercentage: gstPercentage,
      gstAmount: gstAmount,
      totalWithGST: totalWithGST,
      status: 'Pending',
      billType: 'customization',
      customizations: payments,
      isBulk: payments.length > 1
    };
    
    setBillData(bill);
    setShowBillModal(true);
  };
  
  // ✅ FIXED: Process Customization Payment using bill amount
  const processCustomizationPayment = async (requestId, amount) => {
    setProcessingCustomPayment(true);
    setError('');
    
    try {
      const isValid = await checkTokenValidity();
      if (!isValid) {
        setError('Session expired. Please login again.');
        handleLogout();
        return;
      }
      
      const payload = {};
      if (requestId !== 'CONSOLIDATED') {
        payload.customization_request_id = requestId;
      }
      
      const orderResponse = await fetch(`${API_URL}/client/customization/create-payment-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (handleUnauthorized(orderResponse)) {
        setProcessingCustomPayment(false);
        return;
      }
      
      const orderResult = await orderResponse.json();
      
      if (!orderResult.success) {
        setError(orderResult.message || 'Failed to create order');
        setProcessingCustomPayment(false);
        return;
      }
      
      // Use the bill data amount
      const billAmount = billData?.totalWithGST || orderResult.amount;
      
      if (orderResult.simulated) {
        const confirmPayment = window.confirm(
          `SIMULATION MODE\n\nAmount: ₹${billAmount}\n\nClick OK to simulate payment`
        );
        
        if (confirmPayment) {
          const verifyResponse = await fetch(`${API_URL}/client/customization/verify-payment`, {
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
              customization_request_id: requestId !== 'CONSOLIDATED' ? requestId : null,
              amount: billAmount
            })
          });
          
          if (handleUnauthorized(verifyResponse)) {
            setProcessingCustomPayment(false);
            return;
          }
          
          const verifyResult = await verifyResponse.json();
          
          if (verifyResult.success) {
            setSuccess(`✅ Customization payment recorded! Amount: ₹${billAmount}`);
            setShowBillModal(false);
            await Promise.all([
              fetchCustomizationRequests(token),
              fetchPendingCustomizationPayments(token),
              fetchCustomPaymentHistory(token)
            ]);
            setProcessingCustomPayment(false);
          } else {
            setError(verifyResult.message || 'Payment verification failed');
            setProcessingCustomPayment(false);
          }
        } else {
          setProcessingCustomPayment(false);
        }
        return;
      }
      
      await loadRazorpayScript();
      
      const options = {
        key: orderResult.key,
        amount: Math.round(billAmount * 100),
        currency: orderResult.currency,
        name: 'AIM Digitalise',
        description: `Customization Payment - ${orderResult.client_name}`,
        order_id: orderResult.order_id,
        handler: async (response) => {
          setSuccess('Verifying payment...');
          try {
            const verifyResponse = await fetch(`${API_URL}/client/customization/verify-payment`, {
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
                customization_request_id: requestId !== 'CONSOLIDATED' ? requestId : null,
                amount: billAmount
              })
            });
            
            if (handleUnauthorized(verifyResponse)) {
              setProcessingCustomPayment(false);
              return;
            }
            
            const verifyResult = await verifyResponse.json();
            
            if (verifyResult.success) {
              setSuccess(`✅ Customization payment successful! Amount: ₹${billAmount}`);
              setShowBillModal(false);
              await Promise.all([
                fetchCustomizationRequests(token),
                fetchPendingCustomizationPayments(token),
                fetchCustomPaymentHistory(token)
              ]);
            } else {
              setError(verifyResult.message || 'Payment verification failed');
            }
          } catch (err) {
            console.error('Verification error:', err);
            setError('Payment verification failed: ' + err.message);
          }
          setProcessingCustomPayment(false);
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled');
            setProcessingCustomPayment(false);
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
        setProcessingCustomPayment(false);
      });
      
      razorpay.open();
      
    } catch (err) {
      console.error('Customization payment error:', err);
      setError('Payment error: ' + err.message);
      setProcessingCustomPayment(false);
    }
  };
  
  // ============================================
  // BILL MODAL
  // ============================================
  
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
        .bill-total { text-align: right; padding: 20px; background: #f8fafc; border-radius: 8px; margin-top: 20px; }
        .bill-total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .bill-total-grand { font-size: 20px; font-weight: bold; color: #3b82f6; border-top: 2px solid #333; padding-top: 12px; margin-top: 8px; }
        .bill-footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
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
              <div className="bill-subtitle">
                {billData.billType === 'customization' ? 'Customization Invoice' : 'Subscription Invoice'}
              </div>
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
                <strong>Status:</strong> <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Pending</span>
              </div>
            </div>
            
            {/* Client Info */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                <div><strong>Client:</strong> {billData.clientName}</div>
                <div><strong>Client ID:</strong> {billData.clientId}</div>
                {billData.billType === 'customization' ? (
                  <>
                    <div style={{ gridColumn: 'span 2' }}><strong>Request ID:</strong> #{billData.requestId}</div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <strong>Customization Description:</strong>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', padding: '8px', background: '#f1f5f9', borderRadius: '6px' }}>
                        {billData.customizationText}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div><strong>Product:</strong> {billData.productName || '-'}</div>
                    <div><strong>Cycle:</strong> {billData.cycle}</div>
                    <div><strong>Students:</strong> {billData.studentCount}</div>
                  </>
                )}
              </div>
            </div>
            
            {/* Bill Table */}
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Rate</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {billData.billType === 'customization' ? (
                  billData.customizations && billData.customizations.length > 0 ? (
                    billData.customizations.map((cust, idx) => (
                      <tr key={cust.id}>
                        <td>
                          <strong>🎨 Customization Request #{cust.id}</strong>
                          <div style={{ fontSize: '12px', color: '#64748b', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {cust.customization_text || cust.full_text}
                          </div>
                          {cust.admin_notes && (
                            <div style={{ fontSize: '11px', color: '#92400e', marginTop: '2px' }}>
                              Note: {cust.admin_notes}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>₹{cust.base_amount.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>1</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{cust.base_amount.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>
                        <strong>🎨 Customization Service</strong>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Custom development work as requested
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>{billData.baseAmount ? `₹${billData.baseAmount.toFixed(2)}` : '-'}</td>
                      <td style={{ textAlign: 'right' }}>1</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{billData.baseAmount ? `₹${billData.baseAmount.toFixed(2)}` : '-'}</td>
                    </tr>
                  )
                ) : (
                  <>
                    {billData.isFirstPayment && billData.carryoverAmount > 0 && (
                      <tr style={{ background: '#dbeafe' }}>
                        <td>
                          <strong>🔄 Carryover</strong>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {billData.deliveryDate || 'Delivery'} to month end ({billData.carryoverDays}/{billData.daysInMonth} days)
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>{billData.discountedMonthlyAmount ? `₹${billData.discountedMonthlyAmount.toFixed(2)}` : '-'}</td>
                        <td style={{ textAlign: 'right' }}>{(billData.carryoverFraction * 100).toFixed(1)}%</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{billData.carryoverAmount ? `₹${billData.carryoverAmount.toFixed(2)}` : '-'}</td>
                      </tr>
                    )}
                    <tr style={{ background: '#d1fae5' }}>
                      <td>
                        <strong>📆 {billData.cycle} Subscription</strong>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {billData.cycleMonths} month(s)
                          {billData.discountPercentage > 0 && ` (${billData.discountPercentage}% discount applied)`}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>{billData.discountedMonthlyAmount ? `₹${billData.discountedMonthlyAmount.toFixed(2)}` : '-'}</td>
                      <td style={{ textAlign: 'right' }}>{billData.cycleMonths}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{billData.regularMonthsAmount ? `₹${billData.regularMonthsAmount.toFixed(2)}` : '-'}</td>
                    </tr>
                  </>
                )}
                
                {/* Subtotal */}
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '15px' }}>
                    Subtotal
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '15px' }}>
                    {billData.billType === 'customization' 
                      ? `₹${billData.baseAmount.toFixed(2)}`
                      : `₹${billData.totalAmount.toFixed(2)}`
                    }
                  </td>
                </tr>
                
                {/* GST */}
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', color: '#f59e0b', fontSize: '14px' }}>
                    GST ({billData.gstPercentage}%)
                  </td>
                  <td style={{ textAlign: 'right', color: '#f59e0b', fontSize: '14px', fontWeight: 'bold' }}>
                    +₹{billData.gstAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
            
            {/* Total */}
            <div className="bill-total">
              <div className="bill-total-row">
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total Amount (incl. GST)</span>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
                  ₹{billData.totalWithGST.toFixed(2)}
                </span>
              </div>
              
              {billData.billType === 'subscription' && billData.savings > 0 && (
                <div className="bill-total-row" style={{ color: '#059669', fontSize: '14px' }}>
                  <span>💰 You saved by choosing {billData.cycle} plan</span>
                  <span style={{ fontWeight: 'bold' }}>₹{billData.savings.toFixed(2)}</span>
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
              onClick={() => {
                if (billData.billType === 'customization') {
                  processCustomizationPayment(billData.requestId, billData.totalWithGST);
                } else {
                  processSubscriptionPayment();
                }
              }}
              disabled={billData.billType === 'customization' ? processingCustomPayment : processingPayment}
              style={{
                padding: '10px 24px',
                backgroundColor: (billData.billType === 'customization' ? processingCustomPayment : processingPayment) ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (billData.billType === 'customization' ? processingCustomPayment : processingPayment) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {(billData.billType === 'customization' ? processingCustomPayment : processingPayment) ? 'Processing...' : '💳 Pay Now'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // ============================================
  // HANDLE LOGIN & LOGOUT
  // ============================================
  
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
          fetchPendingCustomizationPayments(authToken),
          fetchCustomPaymentHistory(authToken)
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
    setPendingCustomPayments([]);
    setCustomPaymentHistory([]);
    setStudentCountWarning(null);
    setHasZeroStudents(false);
    setUnpaidMonths([]);
    setTotalDueAmount(null);
    setBillData(null);
    setShowBillModal(false);
    setActiveTab('products');
    setSuccess('Logged out successfully');
  };
  
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };
  
  // ============================================
  // HELPERS
  // ============================================
  
  const getStatusBadge = (status) => {
    const badges = {
      'pending': { color: '#f59e0b', text: 'Pending', bg: '#fef3c7' },
      'amount_set': { color: '#3b82f6', text: 'Amount Set', bg: '#dbeafe' },
      'approved': { color: '#10b981', text: 'Approved', bg: '#d1fae5' },
      'rejected': { color: '#ef4444', text: 'Rejected', bg: '#fee2e2' }
    };
    return badges[status] || badges.pending;
  };
  
  const formatAmount = (amount) => {
    if (!amount) return null;
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return null;
    return `₹ ${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // ============================================
  // LOGIN SCREEN
  // ============================================
  
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
  
  // ============================================
  // MAIN DASHBOARD - ONLY 2 TABS
  // ============================================
  
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
      
      {/* Tabs - Only 2 */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
          {['products', 'customization'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(''); setSuccess(''); }}
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
              {tab === 'products' && '📦 My Products'}
              {tab === 'customization' && '🎨 Customization'}
            </button>
          ))}
        </div>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
        {success && <div style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '20px', whiteSpace: 'pre-line' }}>{success}</div>}
        
        {/* ============================================ */}
        {/* PRODUCTS TAB */}
        {/* ============================================ */}
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
        
        {/* ============================================ */}
        {/* CUSTOMIZATION TAB */}
        {/* ============================================ */}
        {activeTab === 'customization' && (
          <div>
            {/* Submit Customization Request */}
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Attach Files (Images or PDFs)
                </label>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    const invalidFile = files.find(f => f.size > 5 * 1024 * 1024);
                    if (invalidFile) {
                      alert('Files must be smaller than 5MB.');
                      return;
                    }
                    setSelectedFiles(files);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  Supported formats: JPG, JPEG, PNG, PDF. Max size: 5MB per file.
                </div>
                {selectedFiles.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedFiles.map((file, idx) => (
                      <span key={idx} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        color: '#475569'
                      }}>
                        📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        <button
                          type="button"
                          onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            padding: '0 2px'
                          }}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
            
            {/* Pending Payments - Show when amount is set */}
            {pendingCustomPayments.length > 0 && (() => {
              const totalBaseAmount = pendingCustomPayments.reduce((sum, item) => sum + (item.base_amount || item.amount || 0), 0);
              const totalGstAmount = Math.round(totalBaseAmount * 18) / 100;
              const totalAmountWithGst = totalBaseAmount + totalGstAmount;
              
              return (
                <div style={{ 
                  backgroundColor: '#f0fdf4', 
                  borderRadius: '12px', 
                  padding: '20px', 
                  marginBottom: '24px',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #bbf7d0', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#065f46', margin: 0 }}>
                      💰 Pending Payments ({pendingCustomPayments.length})
                    </h3>
                    <button
                      onClick={() => generateCustomizationBill(pendingCustomPayments)}
                      style={{
                        padding: '8px 20px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      📄 View Bill & Pay All at Once
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {pendingCustomPayments.map((payment) => {
                      const totalWithGST = payment.total_amount || payment.base_amount * 1.18;
                      return (
                        <div key={payment.id} style={{
                          padding: '12px 16px',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '2px', fontWeight: 'bold' }}>
                                Request #{payment.id}
                              </p>
                              <p style={{ fontSize: '0.875rem', color: '#334155', margin: 0 }}>
                                {truncateText(payment.customization_text || payment.full_text, 120)}
                              </p>
                              {payment.admin_notes && (
                                <p style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '4px', margin: 0 }}>
                                  📝 Notes: {payment.admin_notes}
                                </p>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                              <div style={{ color: '#64748b' }}>Base: {formatAmount(payment.base_amount)}</div>
                              <div style={{ fontWeight: 'bold', color: '#1e293b', marginTop: '2px' }}>
                                Total: {formatAmount(totalWithGST)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '16px', 
                    backgroundColor: 'rgba(16,185,129,0.1)', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    border: '1px dashed #10b981'
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#065f46' }}>
                      <strong>Consolidated Invoice Totals:</strong>
                      <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>
                        Base: {formatAmount(totalBaseAmount)} | GST (18%): {formatAmount(totalGstAmount)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#065f46' }}>
                        {formatAmount(totalAmountWithGst)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {/* All Customization Requests */}
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
                  onClick={() => {
                    fetchCustomizationRequests(token);
                    fetchPendingCustomizationPayments(token);
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
                              fontSize: '0.8rem',
                              marginBottom: request.attachments && request.attachments.length > 0 ? '12px' : '0'
                            }}>
                              <strong>📝 Admin Note:</strong>
                              <p style={{ marginTop: '4px', color: '#92400e', margin: 0 }}>{request.admin_notes}</p>
                            </div>
                          )}
                          
                          {request.attachments && request.attachments.length > 0 && (
                            <div style={{ marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                              <strong style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '6px' }}>📎 Attached Files:</strong>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {request.attachments.map((file, idx) => (
                                  <a
                                    key={idx}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '4px 10px',
                                      backgroundColor: 'white',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '20px',
                                      fontSize: '0.75rem',
                                      color: '#2563eb',
                                      textDecoration: 'none',
                                      fontWeight: '500'
                                    }}
                                  >
                                    📄 {file.name}
                                  </a>
                                ))}
                              </div>
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
      </div>
      
      {/* Bill Modal */}
      <BillModal />
    </div>
  );
};

export default ClientPortal;