import { useState, useEffect, useRef } from 'react';

const API_URL = 'https://api.nexgn.in/api';

const ClientPortal = () => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [clientData, setClientData] = useState(null);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Data States
  const [profileData, setProfileData] = useState(null);
  
  // Per Person Pricing Info
  const [perPerson, setPerPerson] = useState(1);
  
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
        // Store per_person from profile
        if (result.data.per_person !== undefined) {
          setPerPerson(result.data.per_person);
        }
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
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
    setSuccess('Logged out successfully');
  };
  
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };
  
  // Login Screen
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔌</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Add-on Services Portal</h1>
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
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>🔌 Add-on Services</h1>
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
      
      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
        {success && <div style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '20px', whiteSpace: 'pre-line' }}>{success}</div>}
        
        {/* Add-on Services Tab */}
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
      </div>
    </div>
  );
};

export default ClientPortal;