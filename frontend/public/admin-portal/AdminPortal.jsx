import { useState, useEffect, useRef } from 'react';

const API_URL = 'https://api.nexgn.in/api';

const AdminPortal = () => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [adminData, setAdminData] = useState(null);

  // UI State
  const [activeTab, setActiveTab] = useState('payments');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data States
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);

  // Customization Quote Modal
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ amount: '', admin_notes: '' });

  // Customization Status Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', admin_notes: '' });

  // Filter & Search States
  const [clientSearch, setClientSearch] = useState('');
  const [productFilter, setProductFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [customizationSearch, setCustomizationSearch] = useState('');
  const [customizationStatusFilter, setCustomizationStatusFilter] = useState('All');

  // Login Form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Check for saved token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    const savedAdmin = localStorage.getItem('admin_data');
    if (savedToken && savedAdmin) {
      setToken(savedToken);
      setAdminData(JSON.parse(savedAdmin));
      setIsLoggedIn(true);
      fetchData(savedToken);
    }
  }, []);

  // Fetch all admin data
  const fetchData = async (authToken) => {
    setLoading(true);
    setError('');
    try {
      // Fetch clients
      const clientsRes = await fetch(`${API_URL}/admin/clients`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (clientsRes.status === 401) {
        handleLogout();
        return;
      }
      const clientsResult = await clientsRes.json();
      if (clientsResult.success) {
        // Handle both object payload with all_clients list or direct array
        const allClients = clientsResult.data?.all_clients || clientsResult.data || [];
        setClients(Array.isArray(allClients) ? allClients : []);
      } else {
        setError(clientsResult.message || 'Failed to fetch clients');
      }
    } catch (err) {
      console.error('Data fetch error:', err);
      setError('Connection failed. Using mock data mode if available.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      });
      const result = await response.json();
      if (result.success) {
        const authToken = result.data.token;
        const adminObj = result.data.admin || result.data.user;
        setToken(authToken);
        setAdminData(adminObj);
        setIsLoggedIn(true);
        localStorage.setItem('access_token', authToken);
        localStorage.setItem('admin_data', JSON.stringify(adminObj));
        fetchData(authToken);
        setSuccess('✅ Login successful!');
      } else {
        setError(result.message || 'Invalid admin credentials');
      }
    } catch (err) {
      setError('Login connection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_data');
    setIsLoggedIn(false);
    setToken(null);
    setAdminData(null);
    setClients([]);
    setSelectedClient(null);
    setShowClientModal(false);
    setActiveTab('clients');
    setSuccess('Signed out successfully.');
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  // Set Customization Quote Cost
  const handleSetQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/customization/requests/${selectedRequest.id}/set-amount`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(quoteForm.amount),
          admin_notes: quoteForm.admin_notes
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('✅ Quote cost updated successfully!');
        setShowQuoteModal(false);
        fetchData(token);
      } else {
        setError(result.message || 'Failed to update quote cost');
      }
    } catch (err) {
      setError('Error setting customization quote: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Customization Request Status
  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/customization/requests/${selectedRequest.id}/update-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: statusForm.status,
          admin_notes: statusForm.admin_notes
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('✅ Request status updated successfully!');
        setShowStatusModal(false);
        fetchData(token);
      } else {
        setError(result.message || 'Failed to update status');
      }
    } catch (err) {
      setError('Error updating customization status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Format currencies
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper: Format Dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get active client details including Derived payment reports and statistics
  const getDerivedStats = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.is_active).length;
    let totalRevenue = 0;
    let totalOutstanding = 0;
    
    clients.forEach(c => {
      // Sum setup fees + completed payments
      totalRevenue += parseFloat(c.processing_fee || 0);
      c.payments?.forEach(p => {
        if (p.status === 'success') {
          totalRevenue += parseFloat(p.amount || 0);
        }
      });
      // Sum outstanding amounts
      totalOutstanding += parseFloat(c.total_due_amount || 0);
    });

    return { totalClients, activeClients, totalRevenue, totalOutstanding };
  };

  const stats = getDerivedStats();

  // Filter clients
  const filteredClients = clients.filter(c => {
    const q = clientSearch.toLowerCase();
    const matchesSearch = 
      (c.client_name || '').toLowerCase().includes(q) ||
      (c.company_name || '').toLowerCase().includes(q) ||
      (c.client_id || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q);

    const matchesProduct = productFilter === 'All' || 
      (c.product_category || '').toLowerCase() === productFilter.toLowerCase();

    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Active' ? c.is_active : !c.is_active);

    return matchesSearch && matchesProduct && matchesStatus;
  });

  // Extract all payment transaction reports across all clients
  const getPaymentReports = () => {
    const reports = [];
    clients.forEach(c => {
      c.payments?.forEach(p => {
        reports.push({
          ...p,
          client_id: c.client_id,
          company_name: c.company_name,
          client_name: c.client_name,
          product_name: c.product_name
        });
      });
    });
    // Sort by latest payment date
    return reports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const paymentReports = getPaymentReports();

  // Extract outstanding due payments
  const getDuePayments = () => {
    return clients.filter(c => c.total_due_amount > 0 || (c.unpaid_months && c.unpaid_months.length > 0));
  };

  const duePayments = getDuePayments();

  // Extract customization requests
  const getCustomizationRequests = () => {
    const list = [];
    clients.forEach(c => {
      c.customizations?.forEach(cust => {
        list.push({
          ...cust,
          client_id: c.client_id,
          company_name: c.company_name,
          client_name: c.client_name
        });
      });
    });
    return list.filter(cust => {
      const q = customizationSearch.toLowerCase();
      const matchesSearch = 
        (cust.company_name || '').toLowerCase().includes(q) ||
        (cust.client_id || '').toLowerCase().includes(q) ||
        (cust.customization_text || '').toLowerCase().includes(q);
      const matchesStatus = customizationStatusFilter === 'All' ||
        (cust.status || '').toLowerCase() === customizationStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  };

  const customizations = getCustomizationRequests();

  // Simulated download invoice invoice
  const handleDownloadInvoice = (payment, clientDetails) => {
    const today = new Date(payment.created_at || Date.now());
    const invoiceDate = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const invoiceNumber = `INV-${today.getTime()}-${Math.floor(Math.random() * 1000)}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #1e293b; }
            .bill-container { max-width: 800px; margin: 0 auto; padding: 30px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; }
            .bill-header { text-align: center; border-bottom: 2px solid #1e3c5e; padding-bottom: 20px; margin-bottom: 20px; }
            .bill-title { font-size: 24px; font-weight: bold; color: #1e3c5e; }
            .bill-subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
            .bill-info { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; font-size: 13px; }
            .bill-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .bill-table th { background: #1e3c5e; color: white; padding: 12px; text-align: left; font-size: 13px; }
            .bill-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .bill-total { text-align: right; padding: 20px; background: #f8fafc; border-radius: 8px; margin-top: 20px; font-size: 14px; }
            .bill-footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="bill-container">
            <div class="bill-header">
              <div class="bill-title">🎓 AIM Digitalise</div>
              <div class="bill-subtitle">Payment Receipt / Tax Invoice</div>
            </div>
            <div class="bill-info">
              <div>
                <strong>Client:</strong> ${clientDetails.client_name || clientDetails.company_name}<br/>
                <strong>Client ID:</strong> ${clientDetails.client_id}<br/>
                <strong>School/Org:</strong> ${clientDetails.company_name}
              </div>
              <div>
                <strong>Invoice #:</strong> ${invoiceNumber}<br/>
                <strong>Payment ID:</strong> ${payment.razorpay_payment_id || 'simulated_pay'}<br/>
                <strong>Date:</strong> ${invoiceDate}
              </div>
            </div>
            <table class="bill-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Cycle</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Subscription Service Fees</strong><br/>
                    <span style="font-size: 11px; color:#64748b;">Period: ${payment.period_start ? formatDate(payment.period_start) : '—'} to ${payment.period_end ? formatDate(payment.period_end) : '—'}</span>
                  </td>
                  <td style="text-transform: capitalize;">${payment.cycle}</td>
                  <td style="text-align: right;">₹ ${parseFloat(payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
            <div class="bill-total">
              <strong>Total Paid (incl. GST):</strong> <span style="font-size: 18px; color: #2563eb; font-weight: bold; margin-left: 10px;">₹ ${parseFloat(payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="bill-footer">
              <p>This is a system generated transaction invoice copy served for verification.</p>
              <p>AIM Digitalise Private Limited • support@aimdigitalise.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${payment.razorpay_payment_id || 'invoice'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerMockReminder = (client) => {
    alert(`✉️ Payment reminder sent successfully to ${client.client_name} (${client.email}) for ₹${client.total_due_amount.toLocaleString()}.`);
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", color: '#f8fafc' }}>
        <div style={{ backgroundColor: '#1e293b', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', border: '1px solid #334155' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🛡️</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-0.025em', color: '#38bdf8' }}>Admin Portal</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '6px' }}>AIM Digitalise Subscription Manager</p>
          </div>

          {error && <div style={{ backgroundColor: '#fca5a5', color: '#7f1d1d', padding: '14px', borderRadius: '12px', fontSize: '0.850rem', marginBottom: '20px', fontWeight: 'bold' }}>⚠️ {error}</div>}
          {success && <div style={{ backgroundColor: '#86efac', color: '#14532d', padding: '14px', borderRadius: '12px', fontSize: '0.850rem', marginBottom: '20px', fontWeight: 'bold' }}>{success}</div>}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem', color: '#cbd5e1' }}>Admin Email</label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="admin@aimdigitalise.com"
                required
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '12px', color: '#f8fafc', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.85rem', color: '#cbd5e1' }}>Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '12px', color: '#f8fafc', outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', transition: 'all 0.2s', fontSize: '0.95rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.75rem', color: '#64748b' }}>
            <p>Authorized personnel access only.</p>
            <p style={{ marginTop: '4px' }}>AIM Digitalise Pvt. Ltd.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
      
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.025em' }}>
              🛡️ <span style={{ color: '#0284c7' }}>AIM</span> Digitalise <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#64748b', marginLeft: '6px' }}>Admin Dashboard</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>Welcome back, {adminData?.name || 'Administrator'}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              onClick={() => fetchData(token)}
              disabled={loading}
              style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' }}
            >
              {loading ? 'Refreshing...' : '↺ Refresh Data'}
            </button>
            <button
              onClick={handleLogout}
              style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' }}
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '24px auto', padding: '0 24px', boxSizing: 'border-box' }}>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', fontSize: '0.8rem', marginBottom: '20px', fontWeight: 'bold' }}>⚠️ {error}</div>}
        {success && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '12px', fontSize: '0.8rem', marginBottom: '20px', fontWeight: 'bold' }}>{success}</div>}

        {/* Global Stats Cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', uppercase: 'true', tracking: 'wide' }}>Total Subscribed Clients</span>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>{stats.totalClients}</div>
            <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 'bold', marginTop: '4px' }}>SaaS & Custom Portfolios</div>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', uppercase: 'true', tracking: 'wide' }}>Active Subscriptions</span>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981', marginTop: '6px' }}>{stats.activeClients}</div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 'bold', marginTop: '4px' }}>{stats.totalClients ? Math.round((stats.activeClients / stats.totalClients) * 100) : 0}% Retention Status</div>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', uppercase: 'true', tracking: 'wide' }}>Revenue Collected</span>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#f59e0b', marginTop: '6px' }}>{formatCurrency(stats.totalRevenue)}</div>
            <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 'bold', marginTop: '4px' }}>Setup Fees + Subscription Receipts</div>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', uppercase: 'true', tracking: 'wide' }}>Total Due / Outstanding</span>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#ef4444', marginTop: '6px' }}>{formatCurrency(stats.totalOutstanding)}</div>
            <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 'bold', marginTop: '4px' }}>Unpaid Billing Cycles</div>
          </div>
        </section>

        {/* Tab Controls */}
        <nav style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { id: 'payments', label: '💳 Payment Reports' },
            { id: 'due_payments', label: '⚠️ Outstanding Dues' },
            { id: 'customizations', label: '🎨 Customization Requests' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === tab.id ? '#0284c7' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#64748b',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '0.8rem',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* TAB: Payment Reports */}
        {activeTab === 'payments' && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '0.85rem' }}>
              💳 Transaction Logs & GST Receipts
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 'bold' }}>
                    <th style={{ padding: '16px' }}>Receipt / Ref ID</th>
                    <th style={{ padding: '16px' }}>Client</th>
                    <th style={{ padding: '16px' }}>Product</th>
                    <th style={{ padding: '16px' }}>Cycle Interval</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Amount Paid</th>
                    <th style={{ padding: '16px' }}>Term Period</th>
                    <th style={{ padding: '16px' }}>Date</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentReports.length > 0 ? (
                    paymentReports.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px', fontWeight: 'bold', fontFamily: 'monospace', color: '#64748b' }}>{p.razorpay_payment_id || 'simulated_pay'}</td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{p.company_name}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>ID: {p.client_id}</div>
                        </td>
                        <td style={{ padding: '16px', fontWeight: 'medium' }}>{p.product_name}</td>
                        <td style={{ padding: '16px', textTransform: 'capitalize', fontWeight: 'bold', color: '#0284c7' }}>{p.cycle}</td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(p.amount)}</td>
                        <td style={{ padding: '16px', color: '#64748b' }}>
                          {formatDate(p.period_start)} — {formatDate(p.period_end)}
                        </td>
                        <td style={{ padding: '16px', color: '#94a3b8' }}>
                          {new Date(p.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDownloadInvoice(p, p)}
                            style={{ padding: '4px 8px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}
                          >
                            📥 Download
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: 'bold' }}>No subscription payment transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Outstanding Dues */}
        {activeTab === 'due_payments' && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '0.85rem', color: '#ef4444' }}>
              ⚠️ Outstanding Accounts & Overdue Months
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 'bold' }}>
                    <th style={{ padding: '16px' }}>Client ID</th>
                    <th style={{ padding: '16px' }}>Client / Company</th>
                    <th style={{ padding: '16px' }}>Assigned Product</th>
                    <th style={{ padding: '16px' }}>Unpaid Billing Cycles</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Total Due Amount</th>
                    <th style={{ padding: '16px' }}>Next Renewal Due</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {duePayments.length > 0 ? (
                    duePayments.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px', fontWeight: 'bold', fontFamily: 'monospace' }}>{c.client_id}</td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{c.company_name}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{c.client_name} • {c.email}</div>
                        </td>
                        <td style={{ padding: '16px' }}>{c.product_name}</td>
                        <td style={{ padding: '16px' }}>
                          {c.unpaid_months?.map(m => (
                            <span key={m} style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.65rem', marginRight: '4px', fontWeight: 'bold' }}>
                              {m}
                            </span>
                          ))}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: '900', color: '#ef4444', fontSize: '0.8rem' }}>{formatCurrency(c.total_due_amount)}</td>
                        <td style={{ padding: '16px', fontWeight: 'bold', color: '#d97706' }}>{formatDate(c.valid_until)}</td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <button
                            onClick={() => triggerMockReminder(c)}
                            style={{ padding: '6px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            ✉️ Send Reminder
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: 'bold' }}>All clients have paid their outstanding subscriptions!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Customization Requests */}
        {activeTab === 'customizations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Filter Panel */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <input
                  type="text"
                  placeholder="Search client ID, description..."
                  value={customizationSearch}
                  onChange={(e) => setCustomizationSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.8rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ width: '180px' }}>
                <select
                  value={customizationStatusFilter}
                  onChange={(e) => setCustomizationStatusFilter(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="amount_set">Quote Set</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Customization Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 'bold' }}>
                      <th style={{ padding: '16px' }}>Client</th>
                      <th style={{ padding: '16px' }}>Customization Upgrade Request</th>
                      <th style={{ padding: '16px', textAlign: 'right' }}>Quote Cost</th>
                      <th style={{ padding: '16px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '16px' }}>Submitted At</th>
                      <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customizations.length > 0 ? (
                      customizations.map(c => {
                        const isPending = c.status === 'pending';
                        const isAmountSet = c.status === 'amount_set';
                        
                        let badgeColor = '#fef3c7';
                        let badgeText = '#92400e';
                        if (c.status === 'approved') { badgeColor = '#d1fae5'; badgeText = '#065f46'; }
                        else if (c.status === 'rejected') { badgeColor = '#fee2e2'; badgeText = '#991b1b'; }
                        else if (c.status === 'amount_set') { badgeColor = '#e0f2fe'; badgeText = '#0369a1'; }

                        return (
                          <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{c.company_name}</div>
                              <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>ID: {c.client_id}</div>
                            </td>
                            <td style={{ padding: '16px', maxWidth: '320px' }}>
                              <div style={{ fontWeight: 'semibold', color: '#334155', lineHeight: '1.4' }}>{c.customization_text}</div>
                              {c.admin_notes && (
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px', fontStyle: 'italic', borderLeft: '2px solid #cbd5e1', paddingLeft: '6px' }}>
                                  Notes: {c.admin_notes}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', fontSize: '0.8rem' }}>
                              {c.amount ? formatCurrency(c.amount) : <span style={{ color: '#94a3b8' }}>Not Quoted</span>}
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <span style={{ padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.65rem', backgroundColor: badgeColor, color: badgeText, textTransform: 'uppercase' }}>
                                {c.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px', color: '#94a3b8' }}>{formatDate(c.submitted_at)}</td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(c);
                                    setQuoteForm({ amount: c.amount || '', admin_notes: c.admin_notes || '' });
                                    setShowQuoteModal(true);
                                  }}
                                  style={{ padding: '6px 10px', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #b3e0ff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}
                                >
                                  💵 Quote
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(c);
                                    setStatusForm({ status: c.status || '', admin_notes: c.admin_notes || '' });
                                    setShowStatusModal(true);
                                  }}
                                  style={{ padding: '6px 10px', backgroundColor: '#f3e8ff', color: '#6b21a8', border: '1px solid #e9d5ff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}
                                >
                                  ⚙️ Status
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: 'bold' }}>No customization requests.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL 1: Client Details Lookup */}
      {showClientModal && selectedClient && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99, padding: '20px', boxSizing: 'border-box' }}
          onClick={() => setShowClientModal(false)}
        >
          <div 
            style={{ backgroundColor: 'white', borderRadius: '24px', maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.65rem', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#475569', fontWeight: 'black', uppercase: 'true' }}>Client Details Dossier</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>{selectedClient.company_name}</h2>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '3px' }}>Product: {selectedClient.product_name} • ID: {selectedClient.client_id}</p>
              </div>
              <button 
                onClick={() => setShowClientModal(false)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifycontent: 'center', fontSize: '16px', fontWeight: 'bold', color: '#64748b' }}
              >
                ×
              </button>
            </div>

            {/* Profile Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold', uppercase: 'true' }}>Representative</span>
                <p style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '0.85rem' }}>{selectedClient.client_name}</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Phone: {selectedClient.phone}</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold', uppercase: 'true' }}>Setup logistics</span>
                <p style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '0.85rem' }}>Setup Date: {formatDate(selectedClient.created_at)}</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Delivery Offset: {selectedClient.delivery_after} Days</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold', uppercase: 'true' }}>ERP Registry Metrics</span>
                <p style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '0.85rem' }}>Enrollment count: {selectedClient.student_count || 0} students</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Method: {selectedClient.per_person === 1 ? 'Per Student' : 'Flat Monthly Price'}</p>
              </div>
            </div>

            {/* Payment Logs Summary */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '950', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '12px' }}>💳 Client Payment History</h3>
              {selectedClient.payments && selectedClient.payments.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.7rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 'bold' }}>
                      <th style={{ padding: '8px' }}>Payment ID</th>
                      <th style={{ padding: '8px' }}>Billing Cycle</th>
                      <th style={{ padding: '8px' }}>Period Dates</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClient.payments.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', fontFamily: 'monospace' }}>{p.razorpay_payment_id}</td>
                        <td style={{ padding: '8px', textTransform: 'capitalize' }}>{p.cycle}</td>
                        <td style={{ padding: '8px' }}>{formatDate(p.period_start)} — {formatDate(p.period_end)}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(p.amount)}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 'bold', backgroundColor: '#d1fae5', color: '#065f46' }}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDownloadInvoice(p, selectedClient)}
                            style={{ padding: '2px 6px', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 'bold' }}
                          >
                            📥 PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0', fontSize: '0.75rem' }}>
                  No payment transaction logs available for this client.
                </div>
              )}
            </div>

            {/* Customization upgrades */}
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '950', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '12px' }}>🎨 Customizations & Upgrades</h3>
              {selectedClient.customizations && selectedClient.customizations.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.7rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 'bold' }}>
                      <th style={{ padding: '8px' }}>Description</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Quote Cost</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '8px' }}>Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClient.customizations.map(cust => (
                      <tr key={cust.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', maxWidth: '300px' }}>
                          <div style={{ fontWeight: 'bold', color: '#334155' }}>{cust.customization_text}</div>
                          {cust.admin_notes && <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>Notes: {cust.admin_notes}</div>}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{cust.amount ? formatCurrency(cust.amount) : 'Not Quoted'}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 'bold', backgroundColor: cust.status === 'approved' ? '#d1fae5' : '#fee2e2', color: cust.status === 'approved' ? '#065f46' : '#991b1b', textTransform: 'uppercase' }}>
                            {cust.status}
                          </span>
                        </td>
                        <td style={{ padding: '8px', color: '#64748b' }}>{formatDate(cust.submitted_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0', fontSize: '0.75rem' }}>
                  No customization request records found.
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button 
                onClick={() => setShowClientModal(false)}
                style={{ padding: '10px 24px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Set Quote amount */}
      {showQuoteModal && selectedRequest && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}
          onClick={() => setShowQuoteModal(false)}
        >
          <div 
            style={{ backgroundColor: 'white', borderRadius: '20px', maxWidth: '400px', width: '100%', padding: '24px', border: '1px solid #cbd5e1', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '950', color: '#0f172a' }}>💵 Set Customization Quote</h3>
              <button onClick={() => setShowQuoteModal(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            
            <div style={{ fontSize: '0.75rem', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
              <strong style={{ color: '#0284c7' }}>Client:</strong> {selectedRequest.company_name}<br/>
              <strong style={{ color: '#475569', display: 'block', marginTop: '6px' }}>Request details:</strong>
              <span style={{ color: '#64748b' }}>{selectedRequest.customization_text}</span>
            </div>

            <form onSubmit={handleSetQuoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Quote Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quoteForm.amount}
                  onChange={(e) => setQuoteForm({ ...quoteForm, amount: e.target.value })}
                  placeholder="Enter quote amount in INR..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Admin Notes</label>
                <textarea
                  value={quoteForm.admin_notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, admin_notes: e.target.value })}
                  placeholder="Provide notes visible to the client..."
                  rows="3"
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', resize: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowQuoteModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Submit Quote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Update Request Status */}
      {showStatusModal && selectedRequest && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}
          onClick={() => setShowStatusModal(false)}
        >
          <div 
            style={{ backgroundColor: 'white', borderRadius: '20px', maxWidth: '400px', width: '100%', padding: '24px', border: '1px solid #cbd5e1', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '950', color: '#0f172a' }}>⚙️ Update Customization Status</h3>
              <button onClick={() => setShowStatusModal(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            
            <div style={{ fontSize: '0.75rem', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
              <strong style={{ color: '#0284c7' }}>Client:</strong> {selectedRequest.company_name}<br/>
              <strong style={{ color: '#475569', display: 'block', marginTop: '6px' }}>Current status:</strong>
              <span style={{ color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>{selectedRequest.status}</span>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>New Status</label>
                <select
                  required
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold' }}
                >
                  <option value="">Select status...</option>
                  <option value="pending">Pending</option>
                  <option value="amount_set">Quote Set</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Admin Remarks / Notes</label>
                <textarea
                  value={statusForm.admin_notes}
                  onChange={(e) => setStatusForm({ ...statusForm, admin_notes: e.target.value })}
                  placeholder="Provide status updates, notes, or rejection reasons..."
                  rows="3"
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', resize: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowStatusModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Update Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPortal;
