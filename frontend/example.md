example 1

import { useState, useEffect } from 'react';

const API_URL = 'https://api.nexgn.in/api';

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerDocs, setPartnerDocs] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Product states
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productDiscounts, setProductDiscounts] = useState({
    monthly_discount: 0,
    quarterly_discount: 0,
    half_yearly_discount: 0,
    annual_discount: 0
  });
  
  // Hierarchy states
  const [hierarchyData, setHierarchyData] = useState(null);
  const [partnersWithoutRank, setPartnersWithoutRank] = useState([]);
  const [partnersByRank, setPartnersByRank] = useState({ associate: [], master: [], premium: [] });
  const [selectedRank, setSelectedRank] = useState('');
  const [selectedSubordinate, setSelectedSubordinate] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [showRankModal, setShowRankModal] = useState(false);
  const [showSubordinateModal, setShowSubordinateModal] = useState(false);
  const [rankLevels, setRankLevels] = useState({});
  const [hierarchyRules, setHierarchyRules] = useState({});
  
  // Delivery modal state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedClientForDelivery, setSelectedClientForDelivery] = useState(null);
  const [deliveryAfter, setDeliveryAfter] = useState('');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      const result = await response.json();
      console.log('Login response:', result);
      
      if (result.success) {
        setToken(result.data.token);
        setAdmin(result.data.admin);
        setIsLoggedIn(true);
        localStorage.setItem('admin_token', result.data.token);
        localStorage.setItem('admin_data', JSON.stringify(result.data.admin));
        setSuccess('Login successful!');
        
        // Fetch all data after login
        fetchDashboard(result.data.token);
        fetchClients(result.data.token);
        fetchPartners(result.data.token);
        fetchHierarchy(result.data.token);
        fetchProducts(result.data.token);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/admin/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      if (result.success) {
        setIsLoggedIn(false);
        setToken('');
        setAdmin(null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
        setSuccess('Logged out successfully');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  
  // Check for existing token on load
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedAdmin = localStorage.getItem('admin_data');
    if (savedToken && savedAdmin) {
      setToken(savedToken);
      setAdmin(JSON.parse(savedAdmin));
      setIsLoggedIn(true);
      fetchDashboard(savedToken);
      fetchClients(savedToken);
      fetchPartners(savedToken);
      fetchHierarchy(savedToken);
      fetchProducts(savedToken);
    }
  }, []);
  
  // Fetch Dashboard Stats
  const fetchDashboard = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
  };
  
  // Fetch All Clients
  const fetchClients = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/admin/clients`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      if (result.success) {
        setClients(result.data.all_clients || []);
      }
    } catch (err) {
      console.error('Clients fetch error:', err);
    }
  };
  
  // Fetch All Products
  const fetchProducts = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (err) {
      console.error('Products fetch error:', err);
    }
  };
  
  // Update Delivery After
  const handleUpdateDelivery = async () => {
    if (!selectedClientForDelivery || !deliveryAfter) {
      setError('Please enter delivery after value');
      return;
    }
    
    const daysValue = parseInt(deliveryAfter);
    if (isNaN(daysValue) || daysValue < 0) {
      setError('Please enter a valid number of days (0 or more)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/admin/clients/${selectedClientForDelivery.id}/delivery`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ delivery_after: daysValue })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess(`Delivery after set to ${daysValue} days for ${selectedClientForDelivery.client_name}`);
        fetchClients(token);
        setShowDeliveryModal(false);
        setSelectedClientForDelivery(null);
        setDeliveryAfter('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update delivery: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Update Product Discounts
  const handleUpdateDiscounts = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/admin/products/${selectedProduct.id}/discounts`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productDiscounts)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess(`Discounts updated for ${selectedProduct.name}`);
        fetchProducts(token);
        setShowProductModal(false);
        setSelectedProduct(null);
        setProductDiscounts({
          monthly_discount: 0,
          quarterly_discount: 0,
          half_yearly_discount: 0,
          annual_discount: 0
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update discounts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch All Partners
  const fetchPartners = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/admin/partners`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      if (result.success) {
        setPartners(result.data.all_partners || []);
      }
    } catch (err) {
      console.error('Partners fetch error:', err);
    }
  };
  
  // Fetch Hierarchy Data
  const fetchHierarchy = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/admin/partners-hierarchy`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('Response status:', response.status);
      
      const result = await response.json();
      console.log('FULL HIERARCHY RESPONSE:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        setHierarchyData(result.data.hierarchy_tree);
        setPartnersWithoutRank(result.data.partners_without_rank);
        setPartnersByRank(result.data.partners_by_rank);
        setRankLevels(result.data.rank_levels);
        setHierarchyRules(result.data.rules);
      } else {
        console.error('Hierarchy API error:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('Hierarchy fetch error:', err);
      setError('Failed to fetch hierarchy: ' + err.message);
    }
  };
  
  // Fetch Partner Documents
  const fetchPartnerDocuments = async (partnerId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/partners/${partnerId}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setPartnerDocs(result.data);
        setSelectedPartner(result.data.partner);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch documents: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Set Partner Rank
  const handleSetRank = async () => {
    if (!selectedPartner || !selectedRank) {
      setError('Please select a partner and a rank');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/admin/partners/${selectedPartner.id}/set-rank`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rank: selectedRank })
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess(`Rank set to ${selectedRank} for ${selectedPartner.name}`);
        fetchHierarchy(token);
        fetchPartners(token);
        setShowRankModal(false);
        setSelectedRank('');
        setSelectedPartner(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to set rank: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Set Subordinate Relationship
  const handleSetSubordinate = async () => {
    if (!selectedSubordinate || !selectedParent) {
      setError('Please select both subordinate and parent partners');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/admin/partners/subordinate/set`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subordinate_id: selectedSubordinate,
          parent_id: selectedParent
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess(result.message);
        fetchHierarchy(token);
        fetchPartners(token);
        setShowSubordinateModal(false);
        setSelectedSubordinate('');
        setSelectedParent('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to set relationship: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Remove Subordinate
  const handleRemoveSubordinate = async (subordinateId, subordinateName) => {
    if (!window.confirm(`Remove ${subordinateName} from hierarchy?`)) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/admin/partners/subordinate/set`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subordinate_id: subordinateId,
          parent_id: null
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess(result.message);
        fetchHierarchy(token);
        fetchPartners(token);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to remove: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Approve Partner
  const handleApprovePartner = async (partnerId) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/admin/partners/${partnerId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(`Partner ${result.data.partner.name} approved successfully!`);
        fetchPartners(token);
        setPartnerDocs(null);
        setSelectedPartner(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Approval failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Reject Partner
  const handleRejectPartner = async (partnerId) => {
    if (!rejectionReason) {
      setError('Please provide a rejection reason');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/admin/partners/${partnerId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(`Partner rejected successfully`);
        fetchPartners(token);
        setPartnerDocs(null);
        setSelectedPartner(null);
        setRejectionReason('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Rejection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Render hierarchy tree recursively
  const renderHierarchyTree = (node, level = 0) => {
    const rankColors = {
      premium: { bg: '#fef3c7', color: '#92400e', label: 'PREMIUM' },
      master: { bg: '#dbeafe', color: '#1e40af', label: 'MASTER' },
      associate: { bg: '#d1fae5', color: '#065f46', label: 'ASSOCIATE' }
    };
    const rankStyle = node.rank ? rankColors[node.rank] : { bg: '#f3f4f6', color: '#6b7280', label: 'NO RANK' };
    
    return (
      <div key={node.id} style={{ marginLeft: `${level * 30}px`, marginBottom: '8px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '8px 12px', 
          backgroundColor: rankStyle.bg,
          borderRadius: '8px',
          borderLeft: `3px solid ${rankStyle.color}`
        }}>
          <span style={{ fontWeight: 'bold', minWidth: '150px' }}>{node.partner_name}</span>
          <span style={{ fontSize: '0.75rem', color: rankStyle.color, fontWeight: 'bold' }}>{rankStyle.label}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(ID: {node.partner_id})</span>
          <span style={{ fontSize: '0.75rem', color: '#059669' }}>
            {node.total_subordinates} subordinate{node.total_subordinates !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => {
              setSelectedPartner(node);
              setSelectedRank(node.rank || '');
              setShowRankModal(true);
            }}
            style={{ padding: '4px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
          >
            Set Rank
          </button>
        </div>
        {node.children && node.children.map(child => renderHierarchyTree(child, level + 1))}
      </div>
    );
  };
  
  // Login Screen
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Admin Login</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '8px' }}>Enter your credentials to access the dashboard</p>
          </div>
          
          {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
          {success && <div style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{success}</div>}
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@aim.com"
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  // Main Dashboard
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>Admin Dashboard</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Welcome, {admin?.name} ({admin?.role})</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
        >
          Logout
        </button>
      </div>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '16px 24px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        {['dashboard', 'clients', 'partners', 'products', 'hierarchy'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPartnerDocs(null); setSelectedPartner(null); }}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === tab ? '#3b82f6' : 'transparent',
              color: activeTab === tab ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {tab === 'dashboard' && 'Dashboard'}
            {tab === 'clients' && 'Clients'}
            {tab === 'partners' && 'Partners'}
            {tab === 'products' && 'Products'}
            {tab === 'hierarchy' && 'Hierarchy'}
          </button>
        ))}
      </div>
      
      {/* Content Area */}
      <div style={{ padding: '24px' }}>
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
        {success && <div style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{success}</div>}
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardData && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Clients</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{dashboardData.clients?.total || 0}</p>
                <p style={{ fontSize: '0.75rem', color: '#059669' }}>+{dashboardData.clients?.new_this_month || 0} this month</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Revenue</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>₹{dashboardData.revenue?.total?.toLocaleString() || 0}</p>
                <p style={{ fontSize: '0.75rem', color: '#059669' }}>₹{dashboardData.revenue?.this_month?.toLocaleString() || 0} this month</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Partners</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{dashboardData.partners?.total || 0}</p>
                <p style={{ fontSize: '0.75rem', color: '#f59e0b' }}>{dashboardData.partners?.pending || 0} pending approval</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '0.875rem', color: '#64748b' }}>Active Partners</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{dashboardData.partners?.active || 0}</p>
              </div>
            </div>
            
            {/* Hierarchy Summary */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>Partner Hierarchy Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div><strong>Premium:</strong> {dashboardData.partners?.by_rank?.premium || 0}</div>
                <div><strong>Master:</strong> {dashboardData.partners?.by_rank?.master || 0}</div>
                <div><strong>Associate:</strong> {dashboardData.partners?.by_rank?.associate || 0}</div>
                <div><strong>Unassigned:</strong> {dashboardData.partners?.by_rank?.unassigned || 0}</div>
                <div><strong>Top Level Partners:</strong> {dashboardData.partners?.hierarchy?.top_level_partners || 0}</div>
                <div><strong>With Downline:</strong> {dashboardData.partners?.hierarchy?.partners_with_downline || 0}</div>
              </div>
            </div>
            
            {/* Recent Activities */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>Recent Activities</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Type</th>
                      <th style={{ padding: '8px' }}>Details</th>
                      <th style={{ padding: '8px' }}>Amount</th>
                      <th style={{ padding: '8px' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recent_activities?.map((activity, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px' }}>
                          <span style={{ 
                            display: 'inline-block', 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem',
                            backgroundColor: activity.type === 'new_order' ? '#dbeafe' : '#fef3c7',
                            color: activity.type === 'new_order' ? '#1e40af' : '#92400e'
                          }}>
                            {activity.type === 'new_order' ? 'Order' : 'Partner'}
                          </span>
                        </td>
                        <td style={{ padding: '8px' }}>
                          {activity.type === 'new_order' ? activity.client_name : activity.partner_name}
                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                            {activity.type === 'new_order' ? activity.product_name : `${activity.organization} - Rank: ${activity.rank || 'None'}`}
                          </span>
                        </td>
                        <td style={{ padding: '8px' }}>{activity.amount ? `₹${activity.amount}` : '-'}</td>
                        <td style={{ padding: '8px', fontSize: '0.875rem', color: '#64748b' }}>
                          {new Date(activity.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Clients Tab - Updated with Delivery After column and Edit button */}
        {activeTab === 'clients' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>All Clients ({clients.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Client ID</th>
                    <th style={{ padding: '8px' }}>Name</th>
                    <th style={{ padding: '8px' }}>Email</th>
                    <th style={{ padding: '8px' }}>Product</th>
                    <th style={{ padding: '8px' }}>Amount</th>
                    <th style={{ padding: '8px' }}>Delivery After (Days)</th>
                    <th style={{ padding: '8px' }}>Status</th>
                    <th style={{ padding: '8px' }}>Partner</th>
                    <th style={{ padding: '8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px', fontFamily: 'monospace' }}>{client.client_id}</td>
                      <td style={{ padding: '8px' }}>{client.client_name}</td>
                      <td style={{ padding: '8px' }}>{client.email}</td>
                      <td style={{ padding: '8px' }}>{client.product_name}</td>
                      <td style={{ padding: '8px' }}>₹{client.processing_fee}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          backgroundColor: client.delivery_after ? '#dbeafe' : '#f3f4f6',
                          color: client.delivery_after ? '#1e40af' : '#6b7280'
                        }}>
                          {client.delivery_after || 'Not set'}
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem',
                          backgroundColor: client.is_active ? '#d1fae5' : '#fee2e2',
                          color: client.is_active ? '#059669' : '#dc2626'
                        }}>
                          {client.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        {client.partner_name ? (
                          <span>
                            {client.partner_name} 
                            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontFamily: 'monospace' }}>
                              ID: {client.partner_id}
                            </span>
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedClientForDelivery(client);
                            setDeliveryAfter(client.delivery_after || '');
                            setShowDeliveryModal(true);
                          }}
                          style={{ padding: '4px 12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          Set Delivery
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>Products & Discounts</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>ID</th>
                    <th style={{ padding: '8px' }}>Product Name</th>
                    <th style={{ padding: '8px' }}>Monthly Price</th>
                    <th style={{ padding: '8px' }}>Processing Fee</th>
                    <th style={{ padding: '8px' }}>Monthly Discount</th>
                    <th style={{ padding: '8px' }}>Quarterly Discount</th>
                    <th style={{ padding: '8px' }}>Half-Yearly Discount</th>
                    <th style={{ padding: '8px' }}>Annual Discount</th>
                    <th style={{ padding: '8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px' }}>{product.id}</td>
                      <td style={{ padding: '8px', fontWeight: '500' }}>{product.name}</td>
                      <td style={{ padding: '8px' }}>₹{product.monthly_subscription}</td>
                      <td style={{ padding: '8px' }}>₹{product.processing_fee}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ color: product.pricing?.monthly?.discount_percentage > 0 ? '#10b981' : '#64748b' }}>
                          {product.pricing?.monthly?.discount_percentage || 0}%
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ color: product.pricing?.quarterly?.discount_percentage > 0 ? '#10b981' : '#64748b' }}>
                          {product.pricing?.quarterly?.discount_percentage || 0}%
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ color: product.pricing?.half_yearly?.discount_percentage > 0 ? '#10b981' : '#64748b' }}>
                          {product.pricing?.half_yearly?.discount_percentage || 0}%
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ color: product.pricing?.annual?.discount_percentage > 0 ? '#10b981' : '#64748b' }}>
                          {product.pricing?.annual?.discount_percentage || 0}%
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setProductDiscounts({
                              monthly_discount: product.pricing?.monthly?.discount_percentage || 0,
                              quarterly_discount: product.pricing?.quarterly?.discount_percentage || 0,
                              half_yearly_discount: product.pricing?.half_yearly?.discount_percentage || 0,
                              annual_discount: product.pricing?.annual?.discount_percentage || 0
                            });
                            setShowProductModal(true);
                          }}
                          style={{ padding: '4px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          Edit Discounts
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pricing Info Card */}
            {products.length > 0 && (
              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>📊 Pricing Information</h4>
                <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                  <p><strong>Monthly:</strong> Pay as you go - No discount</p>
                  <p><strong>Quarterly:</strong> Pay for 3 months - Get discount on total</p>
                  <p><strong>Half-Yearly:</strong> Pay for 6 months - Higher discount</p>
                  <p><strong>Annual:</strong> Pay for 12 months - Best discount</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <div>
            {/* Partner List */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>All Partners ({partners.length})</h3>
                <button
                  onClick={() => setShowSubordinateModal(true)}
                  style={{ padding: '8px 16px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Set Hierarchy
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>ID</th>
                      <th style={{ padding: '8px' }}>Partner Name</th>
                      <th style={{ padding: '8px' }}>Organization</th>
                      <th style={{ padding: '8px' }}>Rank</th>
                      <th style={{ padding: '8px' }}>Status</th>
                      <th style={{ padding: '8px' }}>Sales</th>
                      <th style={{ padding: '8px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner) => (
                      <tr key={partner.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px', fontFamily: 'monospace' }}>{partner.partner_id}</td>
                        <td style={{ padding: '8px' }}>{partner.partner_name}</td>
                        <td style={{ padding: '8px' }}>{partner.organization_name}</td>
                        <td style={{ padding: '8px' }}>
                          <span style={{ 
                            display: 'inline-block', 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            backgroundColor: partner.rank === 'premium' ? '#fef3c7' : partner.rank === 'master' ? '#dbeafe' : partner.rank === 'associate' ? '#d1fae5' : '#f3f4f6',
                            color: partner.rank === 'premium' ? '#92400e' : partner.rank === 'master' ? '#1e40af' : partner.rank === 'associate' ? '#065f46' : '#6b7280'
                          }}>
                            {partner.rank ? partner.rank.toUpperCase() : 'No Rank'}
                          </span>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <span style={{ 
                            display: 'inline-block', 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem',
                            backgroundColor: partner.is_active ? '#d1fae5' : partner.registration_status === 'pending' ? '#fef3c7' : '#fee2e2',
                            color: partner.is_active ? '#059669' : partner.registration_status === 'pending' ? '#d97706' : '#dc2626'
                          }}>
                            {partner.is_active ? 'Active' : partner.registration_status === 'pending' ? 'Pending' : 'Rejected'}
                          </span>
                        </td>
                        <td style={{ padding: '8px' }}>{partner.total_sales || 0}</td>
                        <td style={{ padding: '8px' }}>
                          <button
                            onClick={() => {
                              setSelectedPartner(partner);
                              setSelectedRank(partner.rank || '');
                              setShowRankModal(true);
                            }}
                            style={{ padding: '4px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '5px' }}
                          >
                            Set Rank
                          </button>
                          <button
                            onClick={() => fetchPartnerDocuments(partner.id)}
                            style={{ padding: '4px 12px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            View Docs
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Partner Documents Modal */}
            {partnerDocs && selectedPartner && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Partner Documents</h3>
                    <button onClick={() => { setPartnerDocs(null); setSelectedPartner(null); }} style={{ fontSize: '1.5rem', cursor: 'pointer', background: 'none', border: 'none' }}>&times;</button>
                  </div>
                  
                  <p><strong>Name:</strong> {selectedPartner.name}</p>
                  <p><strong>Organization:</strong> {selectedPartner.organization}</p>
                  <p><strong>Email:</strong> {selectedPartner.email}</p>
                  
                  <hr style={{ margin: '16px 0' }} />
                  
                  <h4>Documents:</h4>
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {partnerDocs.documents.pan_card && (
                      <a href={partnerDocs.documents.pan_card} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>📄 PAN Card</a>
                    )}
                    {partnerDocs.documents.id_proof && (
                      <a href={partnerDocs.documents.id_proof} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>🆔 ID Proof</a>
                    )}
                    {partnerDocs.documents.organization_proof && (
                      <a href={partnerDocs.documents.organization_proof} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>🏢 Organization Proof</a>
                    )}
                    {partnerDocs.documents.signed_agreement && (
                      <a href={partnerDocs.documents.signed_agreement} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>📝 Signed Agreement</a>
                    )}
                  </div>
                  
                  <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleApprovePartner(selectedPartner.id)}
                      disabled={loading}
                      style={{ flex: 1, padding: '10px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      ✅ Approve Partner
                    </button>
                    <button
                      onClick={() => handleRejectPartner(selectedPartner.id)}
                      disabled={loading}
                      style={{ flex: 1, padding: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      ❌ Reject Partner
                    </button>
                  </div>
                  
                  <div style={{ marginTop: '12px' }}>
                    <textarea
                      placeholder="Rejection reason (required for rejection)"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows="2"
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
                    ></textarea>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Hierarchy Tab */}
        {activeTab === 'hierarchy' && (
          <div>
            {/* Hierarchy Visualization */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>Partner Hierarchy Tree</h3>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {hierarchyData && hierarchyData.length > 0 ? (
                  hierarchyData.map(node => renderHierarchyTree(node))
                ) : (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
                    No hierarchy established yet. Use "Set Hierarchy" button to create relationships.
                  </p>
                )}
              </div>
            </div>
            
            {/* Partners Without Rank */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>Partners Without Rank</h3>
              {partnersWithoutRank.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {partnersWithoutRank.map(partner => (
                    <div key={partner.id} style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span><strong>{partner.partner_name}</strong> ({partner.partner_id})</span>
                      <button
                        onClick={() => {
                          setSelectedPartner(partner);
                          setSelectedRank('');
                          setShowRankModal(true);
                        }}
                        style={{ padding: '4px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        Assign Rank
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b' }}>All partners have ranks assigned.</p>
              )}
            </div>
            
            {/* Hierarchy Rules */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>Hierarchy Rules</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569' }}>
                <li><strong>Premium</strong> (Level 3) - Can have Master and Associate subordinates, cannot be under anyone</li>
                <li><strong>Master</strong> (Level 2) - Can have Associate subordinates, can only be under Premium</li>
                <li><strong>Associate</strong> (Level 1) - Cannot have subordinates, can be under Premium or Master</li>
                <li>Same rank cannot be subordinate to each other</li>
                <li>Higher rank cannot be under lower rank</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Delivery Modal - Fixed with number input */}
      {showDeliveryModal && selectedClientForDelivery && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Set Delivery After (Days)</h3>
            <p><strong>Client:</strong> {selectedClientForDelivery.client_name} ({selectedClientForDelivery.client_id})</p>
            
            <div style={{ marginTop: '16px', marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Delivery After (Days)</label>
              <input
                type="number"
                value={deliveryAfter}
                onChange={(e) => setDeliveryAfter(e.target.value)}
                placeholder="Enter number of days"
                min="0"
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              />
              <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                Enter number of days after activation (e.g., 30, 45, 90)
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleUpdateDelivery}
                disabled={loading}
                style={{ flex: 1, padding: '10px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                {loading ? 'Updating...' : 'Update Delivery'}
              </button>
              <button
                onClick={() => { setShowDeliveryModal(false); setSelectedClientForDelivery(null); setDeliveryAfter(''); }}
                style={{ flex: 1, padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Product Discount Modal */}
      {showProductModal && selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', maxWidth: '450px', width: '90%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Edit Product Discounts</h3>
            <p><strong>Product:</strong> {selectedProduct.name}</p>
            
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Monthly Discount (%)</label>
                <input
                  type="number"
                  value={productDiscounts.monthly_discount}
                  onChange={(e) => setProductDiscounts({ ...productDiscounts, monthly_discount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  step="1"
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Quarterly Discount (%)</label>
                <input
                  type="number"
                  value={productDiscounts.quarterly_discount}
                  onChange={(e) => setProductDiscounts({ ...productDiscounts, quarterly_discount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  step="1"
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Half-Yearly Discount (%)</label>
                <input
                  type="number"
                  value={productDiscounts.half_yearly_discount}
                  onChange={(e) => setProductDiscounts({ ...productDiscounts, half_yearly_discount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  step="1"
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Annual Discount (%)</label>
                <input
                  type="number"
                  value={productDiscounts.annual_discount}
                  onChange={(e) => setProductDiscounts({ ...productDiscounts, annual_discount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  step="1"
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                onClick={handleUpdateDiscounts}
                disabled={loading}
                style={{ flex: 1, padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                {loading ? 'Updating...' : 'Update Discounts'}
              </button>
              <button
                onClick={() => { setShowProductModal(false); setSelectedProduct(null); }}
                style={{ flex: 1, padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Set Rank Modal */}
      {showRankModal && selectedPartner && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Set Partner Rank</h3>
            <p><strong>Partner:</strong> {selectedPartner.partner_name} ({selectedPartner.partner_id})</p>
            
            <div style={{ marginTop: '16px', marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Select Rank</label>
              <select
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              >
                <option value="">Select Rank...</option>
                <option value="associate">Associate (Level 1)</option>
                <option value="master">Master (Level 2)</option>
                <option value="premium">Premium (Level 3)</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleSetRank}
                disabled={loading}
                style={{ flex: 1, padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Set Rank
              </button>
              <button
                onClick={() => { setShowRankModal(false); setSelectedRank(''); setSelectedPartner(null); }}
                style={{ flex: 1, padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Set Subordinate Modal */}
      {showSubordinateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Set Subordinate Relationship</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Subordinate Partner (will be under)</label>
              <select
                value={selectedSubordinate}
                onChange={(e) => setSelectedSubordinate(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              >
                <option value="">Select Subordinate...</option>
                {partners.filter(p => p.registration_status === 'active' || p.is_active).map(partner => (
                  <option key={partner.id} value={partner.id}>
                    {partner.partner_name} ({partner.partner_id}) - Rank: {partner.rank || 'None'}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Parent Partner (will be above)</label>
              <select
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              >
                <option value="">Select Parent... (Leave empty to remove from hierarchy)</option>
                {partners.filter(p => p.registration_status === 'active' || p.is_active).map(partner => (
                  <option key={partner.id} value={partner.id}>
                    {partner.partner_name} ({partner.partner_id}) - Rank: {partner.rank || 'None'}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleSetSubordinate}
                disabled={loading}
                style={{ flex: 1, padding: '10px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Set Relationship
              </button>
              <button
                onClick={() => { setShowSubordinateModal(false); setSelectedSubordinate(''); setSelectedParent(''); }}
                style={{ flex: 1, padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


example 2


import { useState, useEffect } from 'react';

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
  
  // Subscription States
  const [studentCount, setStudentCount] = useState(null);
  const [paymentCycles, setPaymentCycles] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState('monthly');
  const [calculatedAmount, setCalculatedAmount] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
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
      fetchProfile(savedToken);
      fetchMyProducts(savedToken);
      fetchStudentCount(savedToken);
      fetchPaymentCycles(savedToken);
    }
  }, []);
  
  // Fetch Client Profile
  const fetchProfile = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/client/profile`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      if (result.success) {
        setProfileData(result.data);
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
      const result = await response.json();
      if (result.success) {
        setProductData(result.data);
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
      const result = await response.json();
      if (result.success) {
        setStudentCount(result.data);
      }
    } catch (err) {
      console.error('Student count fetch error:', err);
    }
  };
  
  // Fetch Payment Cycles with Discounts
// Fetch Payment Cycles with Discounts
const fetchPaymentCycles = async (authToken) => {
  setLoadingSubscription(true);
  try {
    console.log('Fetching payment cycles with token:', authToken);
    const response = await fetch(`${API_URL}/client/payment-cycles`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const result = await response.json();
    console.log('Payment cycles response:', result);
    
    if (result.success) {
      setPaymentCycles(result.data);
      console.log('Payment cycles set:', result.data);
      // Auto-calculate for default cycle
      calculateSubscriptionForCycle('quarterly', authToken);
    } else {
      console.error('Payment cycles error:', result.message);
      setError(result.message || 'Failed to load payment options');
    }
  } catch (err) {
    console.error('Payment cycles fetch error:', err);
    setError('Failed to load payment options: ' + err.message);
  } finally {
    setLoadingSubscription(false);
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
      const result = await response.json();
      if (result.success) {
        setCalculatedAmount(result.data);
        setSelectedCycle(cycle);
      } else {
        setError(result.message || 'Failed to calculate subscription');
      }
    } catch (err) {
      console.error('Calculation error:', err);
      setError('Failed to calculate subscription amount');
    } finally {
      setLoadingSubscription(false);
    }
  };
  
  // Handle Cycle Selection
  const handleCycleChange = (cycle) => {
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
  
  // Process Subscription Payment
  const processSubscriptionPayment = async () => {
    if (!calculatedAmount) {
      setError('Please calculate subscription amount first');
      return;
    }
    
    setProcessingPayment(true);
    setError('');
    
    try {
      // Step 1: Create order
      const orderResponse = await fetch(`${API_URL}/client/create-subscription-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cycle: selectedCycle })
      });
      
      const orderResult = await orderResponse.json();
      console.log('Order response:', orderResult);
      
      if (!orderResult.success) {
        setError(orderResult.message || 'Failed to create order');
        setProcessingPayment(false);
        return;
      }
      
      // Step 2: Handle simulation mode
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
              amount: orderResult.amount
            })
          });
          
          const verifyResult = await verifyResponse.json();
          
          if (verifyResult.success) {
            setSuccess(`✅ ${verifyResult.message} Amount: ₹${orderResult.amount}`);
            setTimeout(() => {
              setSuccess('');
            }, 5000);
          } else {
            setError(verifyResult.message || 'Payment verification failed');
          }
        }
        setProcessingPayment(false);
        return;
      }
      
      // Step 3: Load Razorpay and process real payment
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
                amount: orderResult.amount
              })
            });
            
            const verifyResult = await verifyResponse.json();
            
            if (verifyResult.success) {
              setSuccess(`✅ Payment successful! ${verifyResult.message}`);
              setTimeout(() => {
                setSuccess('');
              }, 5000);
            } else {
              setError(verifyResult.message || 'Payment verification failed');
            }
          } catch (err) {
            console.error('Verification error:', err);
            setError('Payment verification failed: ' + err.message);
          }
          setProcessingPayment(false);
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
        setToken(result.data.token);
        setClientData(result.data.client);
        setIsLoggedIn(true);
        localStorage.setItem('client_token', result.data.token);
        localStorage.setItem('client_data', JSON.stringify(result.data.client));
        fetchProfile(result.data.token);
        fetchMyProducts(result.data.token);
        fetchStudentCount(result.data.token);
        fetchPaymentCycles(result.data.token);
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
    setActiveTab('profile');
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
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
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
              onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
          {['profile', 'products', 'subscription'].map((tab) => (
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
              {tab === 'profile' && '👤 My Profile'}
              {tab === 'products' && '📦 My Products'}
              {tab === 'subscription' && '💰 Subscription'}
            </button>
          ))}
        </div>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
        {success && <div style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '8px', marginBottom: '20px', whiteSpace: 'pre-line' }}>{success}</div>}
        
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
    {/* Student Count Card */}
    {studentCount && (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>👨‍🎓 Student Count</span>
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>School: <strong>{studentCount.school_name}</strong></p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{studentCount.student_count} Students</p>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Last updated: {new Date(studentCount.last_updated).toLocaleString()}
          </div>
        </div>
      </div>
    )}
    
    {/* Payment Cycles Card */}
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>💳 Select Payment Cycle</h3>
      
      {!paymentCycles && !loadingSubscription ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <p>Loading payment options...</p>
        </div>
      ) : paymentCycles?.cycles ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {Object.entries(paymentCycles.cycles).map(([cycle, data]) => (
            <div 
              key={cycle}
              onClick={() => handleCycleChange(cycle)}
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: `2px solid ${selectedCycle === cycle ? '#3b82f6' : '#e2e8f0'}`,
                backgroundColor: selectedCycle === cycle ? '#eff6ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
            >
              <h4 style={{ 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                marginBottom: '8px', 
                textTransform: 'capitalize',
                color: selectedCycle === cycle ? '#3b82f6' : '#1e293b'
              }}>
                {cycle} {data.multiplier > 1 && `(${data.multiplier} months)`}
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Discount: {data.discount}%</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '8px' }}>
                ₹{data.discounted_monthly}
              </p>
              <p style={{ fontSize: '0.7rem', color: '#64748b' }}>per month</p>
              <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Subtotal: ₹{data.subtotal}</p>
                <p style={{ fontSize: '0.75rem', color: '#f59e0b' }}>GST (18%): ₹{data.gst_amount}</p>
                <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
                  Total: ₹{data.total}
                </p>
              </div>
              {data.savings > 0 && (
                <p style={{ fontSize: '0.7rem', color: '#059669', marginTop: '8px' }}>
                  Save ₹{data.savings}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fef3c7', borderRadius: '12px' }}>
          <p style={{ color: '#d97706' }}>⚠️ Unable to load payment cycles. Please contact support.</p>
          <button 
            onClick={() => fetchPaymentCycles(token)}
            style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
    
    {/* Calculation Result Card - Shows after selecting a cycle */}
    {calculatedAmount && (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>🧮 Payment Summary</h3>
        
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span>Student Count:</span>
            <strong>{calculatedAmount.student_count} students</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span>Base Monthly Amount:</span>
            <strong>₹{calculatedAmount.calculation?.base_monthly_amount?.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span>Discount ({calculatedAmount.calculation?.discount_percentage}%):</span>
            <strong style={{ color: '#059669' }}>-₹{((calculatedAmount.calculation?.base_monthly_amount || 0) - (calculatedAmount.calculation?.discounted_monthly_amount || 0)).toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span>Discounted Monthly:</span>
            <strong>₹{calculatedAmount.calculation?.discounted_monthly_amount?.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span>Selected Cycle:</span>
            <strong style={{ textTransform: 'capitalize' }}>{calculatedAmount.calculation?.cycle}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span>Number of Months:</span>
            <strong>{calculatedAmount.calculation?.multiplier}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span>Subtotal:</span>
            <strong>₹{calculatedAmount.calculation?.subtotal?.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span>GST ({calculatedAmount.calculation?.gst_percentage}%):</span>
            <strong style={{ color: '#f59e0b' }}>₹{calculatedAmount.calculation?.gst_amount?.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '2px solid #e2e8f0', marginTop: '8px', backgroundColor: '#eff6ff', borderRadius: '8px', marginTop: '12px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total Amount to Pay (incl. GST):</span>
            <strong style={{ fontSize: '1.5rem', color: '#3b82f6' }}>₹{calculatedAmount.calculation?.total_amount?.toLocaleString()}</strong>
          </div>
          {calculatedAmount.calculation?.savings > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#d1fae5', marginTop: '12px', borderRadius: '8px' }}>
              <span>💰 Your Total Savings:</span>
              <strong style={{ color: '#059669' }}>₹{calculatedAmount.calculation?.savings?.toLocaleString()}</strong>
            </div>
          )}
        </div>
        
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '8px' }}>📊 Calculation Breakdown:</p>
          <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '4px' }}>{calculatedAmount.breakdown?.formula}</p>
          <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '4px' }}>{calculatedAmount.breakdown?.with_discount}</p>
          <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '4px' }}>{calculatedAmount.breakdown?.subtotal}</p>
          <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '4px', color: '#f59e0b' }}>{calculatedAmount.breakdown?.gst}</p>
          <p style={{ fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#3b82f6', marginTop: '8px' }}>{calculatedAmount.breakdown?.total_for_cycle}</p>
        </div>
        
        <button
          onClick={processSubscriptionPayment}
          disabled={processingPayment}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: processingPayment ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: processingPayment ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!processingPayment) e.target.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            if (!processingPayment) e.target.style.backgroundColor = '#3b82f6';
          }}
        >
          {processingPayment ? 'Processing...' : `Proceed to Pay ₹${calculatedAmount.calculation?.total_amount?.toLocaleString()} (incl. GST)`}
        </button>
      </div>
    )}
    
    {/* Loading State */}
    {loadingSubscription && !calculatedAmount && (
      <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px' }}>
        <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '16px', color: '#64748b' }}>Loading payment options...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default ClientPortal;