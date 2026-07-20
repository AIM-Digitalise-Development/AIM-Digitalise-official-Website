import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import RootLayout from './layouts/RootLayout'
import WebsiteLayout from './layouts/WebsiteLayout'
import AdminLayout from './layouts/AdminLayout'
import PartnerLayout from './layouts/PartnerLayout'
import EmployeeLayout from './layouts/EmployeeLayout'
import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeTasks from './pages/employee/Tasks'
import EmployeeTimesheet from './pages/employee/Timesheet'
import EmployeeSupport from './pages/employee/Support'
import EmployeeProfile from './pages/employee/Profile'
import EmployeePunchIn from './pages/employee/PunchIn'
import EmployeeLeads from './pages/employee/Leads'
import EmployeeDemoSlots from './pages/employee/DemoSlots'
import Home from './pages/website/Home'
import About from './pages/website/About'
import Contact from './pages/website/Contact'
import Products from './pages/website/Products'
import CustomDevelopment from './pages/website/CustomDevelopment'
import CodingClasses from './pages/website/CodingClasses'
import Portfolio from './pages/website/Portfolio'
import Career from './pages/website/Career'
import SaasBasedSoftware from './pages/website/SaasBasedSoftware'
import DigitalMarketing from './pages/website/DigitalMarketing'
import DigitalSignature from './pages/website/DigitalSignature'
import Users from './pages/website/Users'
import AdminLogin from './pages/website/AdminLogin'
import EmployeeLogin from './pages/website/EmployeeLogin'
import AdminDashboard from './pages/admin/Dashboard'
import AdminLeads from './pages/admin/Leads'
import AdminUsers from './pages/admin/Users'
import AdminSaasClients from './pages/admin/SaasClients'
import AdminProducts from './pages/admin/Products'
import AdminSettings from './pages/admin/Settings'
import AdminSubscribedClients from './pages/admin/SubscribedClients'
import AdminAnalytics from './pages/admin/Analytics'
import AdminPartners from './pages/admin/Partners'
import AdminSupport from './pages/admin/Support'
import AdminEmployee from './pages/admin/Employee'
import AdminCompliance from './pages/admin/Compliance'
import AdminImplementation from './pages/admin/Implementation'
import AdminAddonServices from './pages/admin/AddonServices'
import AdminPgKyc from './pages/admin/PgKyc'
import AdminDemoSlots from './pages/admin/DemoSlots'
import PartnerLogin from './pages/partner/Login'
import PartnerRegister from './pages/partner/Register'
import PartnerDashboard from './pages/partner/Dashboard'
import PartnerOrders from './pages/partner/Orders'
import PartnerPayouts from './pages/partner/Payouts'
import PartnerLeads from './pages/partner/Leads'
import PartnerMarketing from './pages/partner/Marketing'
import PartnerDueRenewal from './pages/partner/DueRenewal'
import PartnerSupport from './pages/partner/Support'
import PartnerDemoSlots from './pages/partner/DemoSlots'
import ClientLayout from './layouts/ClientLayout'
import ClientLogin from './pages/client/Login'
import ClientProducts from './pages/client/Products'
import ClientProfile from './pages/client/Profile'
import ClientSubscription from './pages/client/Subscription'
import ClientSupport from './pages/client/Support'
import ClientCustomization from './pages/client/Customization'
import ClientAddonServices from './pages/client/AddonServices'
import ClientPgKyc from './pages/client/PgKyc'
import DemoPortal from './pages/demo/DemoPortal'
import DemoDashboard from './pages/demo/DemoDashboard'
import DemoEmployeePunchIn from './pages/demo/DemoEmployeePunchIn'
import { DemoSaasClients, DemoComingSoon } from './pages/demo/DemoPages'
import { ROUTES } from './constants/routes'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      } else {
        const timer = setTimeout(() => {
          const el = document.getElementById(id)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 300)
        return () => clearTimeout(timer)
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return null
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* ── Public website (with header/footer) ── */}
          <Route element={<RootLayout />}>
            <Route element={<WebsiteLayout />}>
              <Route path={ROUTES.HOME} element={<Home />} />
              <Route path={ROUTES.ABOUT} element={<About />} />
              <Route path={ROUTES.CONTACT} element={<Contact />} />
              <Route path={ROUTES.CUSTOM_DEVELOPMENT} element={<CustomDevelopment />} />
              <Route path={ROUTES.SERVICES} element={<CustomDevelopment />} />
              <Route path={ROUTES.SAAS_SOFTWARE} element={<SaasBasedSoftware />} />
              <Route path="/subscription" element={<SaasBasedSoftware />} />
              <Route path={ROUTES.DIGITAL_MARKETING} element={<DigitalMarketing />} />
              <Route path={ROUTES.DIGITAL_SIGNATURE} element={<DigitalSignature />} />
              <Route path={ROUTES.CODING_CLASSES} element={<CodingClasses />} />
              <Route path={ROUTES.PORTFOLIO} element={<Portfolio />} />
              <Route path={ROUTES.CAREER} element={<Career />} />
              <Route path={ROUTES.PRODUCTS} element={<Products />} />
              <Route path={ROUTES.USERS} element={<Users />} />
            </Route>
          </Route>

          {/* ── Admin portal (standalone shell) ── */}
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="saas-clients" element={<AdminSaasClients />} />
            <Route path="products" element={<Navigate to="/admin/settings" replace />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="subscribed-clients" element={<AdminSubscribedClients />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="employee" element={<AdminEmployee />} />
            <Route path="compliance" element={<AdminCompliance />} />
            <Route path="implementation" element={<AdminImplementation />} />
            <Route path="addon-services" element={<AdminAddonServices />} />
            <Route path="demo" element={<AdminDemoSlots />} />
            <Route path="pg-kyc" element={<AdminPgKyc />} />
          </Route>

          {/* ── Employee portal (authenticated shell with sidebar) ── */}
          <Route path={ROUTES.EMPLOYEE.DASHBOARD} element={<EmployeeLayout />}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="saas-clients" element={<DemoSaasClients />} />
            <Route path="subscription" element={<DemoComingSoon title="Subscribed Clients" icon="💳" />} />
            <Route path="users" element={<DemoComingSoon title="General Clients" icon="👥" />} />
            <Route path="accounts" element={<DemoComingSoon title="Accounts" icon="💰" />} />
            <Route path="employee" element={<EmployeeProfile />} />
            <Route path="projects" element={<DemoComingSoon title="Projects" icon="📁" />} />
            <Route path="compliance" element={<DemoComingSoon title="Compliance" icon="🛡️" />} />
            <Route path="partners" element={<DemoComingSoon title="Partner Network" icon="🤝" />} />
            <Route path="reports" element={<DemoComingSoon title="Reports" icon="📊" />} />
            <Route path="support" element={<EmployeeSupport />} />
            <Route path="settings" element={<DemoComingSoon title="Settings" icon="⚙️" />} />
            <Route path="punch-in" element={<EmployeePunchIn />} />
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="leads" element={<EmployeeLeads />} />
            <Route path="demo" element={<EmployeeDemoSlots />} />
          </Route>

          {/* ── Partner auth pages (standalone, no header/footer) ── */}
          <Route path={ROUTES.PARTNER.LOGIN} element={<PartnerLogin />} />
          <Route path={ROUTES.PARTNER.REGISTER} element={<PartnerRegister />} />

          {/* ── Partner portal (authenticated shell with sidebar) ── */}
          <Route path={ROUTES.PARTNER.DASHBOARD} element={<PartnerLayout />}>
            <Route index element={<PartnerDashboard />} />
            <Route path="orders" element={<PartnerOrders />} />
            <Route path="payouts" element={<PartnerPayouts />} />
            <Route path="leads" element={<PartnerLeads />} />
            <Route path="marketing" element={<PartnerMarketing />} />
            <Route path="due-renewal" element={<PartnerDueRenewal />} />
            <Route path="support" element={<PartnerSupport />} />
            <Route path="demo" element={<PartnerDemoSlots />} />
          </Route>

          {/* ── Client portal & login (standalone, no header/footer) ── */}
          <Route path={ROUTES.CLIENT.LOGIN} element={<ClientLogin />} />
          
          {/* ── General Login (standalone, no header/footer) ── */}
          <Route path={ROUTES.AUTH.ADMIN_LOGIN} element={<AdminLogin />} />
          <Route path={ROUTES.AUTH.EMPLOYEE_LOGIN} element={<EmployeeLogin />} />
          <Route path={ROUTES.AUTH.LOGIN} element={<Navigate to={ROUTES.AUTH.EMPLOYEE_LOGIN} replace />} />
          
          <Route path={ROUTES.CLIENT.PORTAL} element={<ClientLayout />}>
            <Route index element={<ClientProducts />} />
            <Route path="profile" element={<ClientProfile />} />
            <Route path="subscription" element={<ClientSubscription />} />
            <Route path="support" element={<ClientSupport />} />
            <Route path="customization" element={<ClientCustomization />} />
            <Route path="addon-services" element={<ClientAddonServices />} />
            <Route path="pg-kyc" element={<ClientPgKyc />} />
          </Route>

          {/* ── Demo Portal (no auth required, dark admin-style with demo data) ── */}
          <Route path={ROUTES.DEMO.PORTAL} element={<DemoPortal />}>
            <Route index element={<DemoDashboard />} />
            <Route path="saas-clients" element={<DemoSaasClients />} />
            <Route path="subscription" element={<DemoComingSoon title="Subscribed Clients" icon="💳" />} />
            <Route path="users" element={<DemoComingSoon title="General Clients" icon="👥" />} />
            <Route path="accounts" element={<DemoComingSoon title="Accounts" icon="💰" />} />
            <Route path="employee" element={<DemoComingSoon title="Employee Management" icon="👤" />} />
            <Route path="projects" element={<DemoComingSoon title="Projects" icon="📁" />} />
            <Route path="compliance" element={<DemoComingSoon title="Compliance" icon="🛡️" />} />
            <Route path="partners" element={<DemoComingSoon title="Partner Network" icon="🤝" />} />
            <Route path="reports" element={<DemoComingSoon title="Reports" icon="📊" />} />
            <Route path="support" element={<EmployeeSupport />} />
            <Route path="settings" element={<DemoComingSoon title="Settings" icon="⚙️" />} />
            <Route path="punch-in" element={<DemoEmployeePunchIn />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App