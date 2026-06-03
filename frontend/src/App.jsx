import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import RootLayout from './layouts/RootLayout'
import WebsiteLayout from './layouts/WebsiteLayout'
import AdminLayout from './layouts/AdminLayout'
import PartnerLayout from './layouts/PartnerLayout'
import Home from './pages/website/Home'
import About from './pages/website/About'
import Contact from './pages/website/Contact'
import Products from './pages/website/Products'
import Services from './pages/website/Services'
import CodingClasses from './pages/website/CodingClasses'
import Portfolio from './pages/website/Portfolio'
import Career from './pages/website/Career'
import MonthlySubscription from './pages/website/MonthlySubscription'
import Users from './pages/website/Users'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminSettings from './pages/admin/Settings'
import AdminAnalytics from './pages/admin/Analytics'
import AdminPartners from './pages/admin/Partners'
import PartnerLogin from './pages/partner/Login'
import PartnerRegister from './pages/partner/Register'
import PartnerDashboard from './pages/partner/Dashboard'
import PartnerOrders from './pages/partner/Orders'
import PartnerPayouts from './pages/partner/Payouts'
import { ROUTES } from './constants/routes'

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public website (with header/footer) ── */}
          <Route element={<RootLayout />}>
            <Route element={<WebsiteLayout />}>
              <Route path={ROUTES.HOME} element={<Home />} />
              <Route path={ROUTES.ABOUT} element={<About />} />
              <Route path={ROUTES.CONTACT} element={<Contact />} />
              <Route path={ROUTES.SERVICES} element={<Services />} />
              <Route path={ROUTES.CODING_CLASSES} element={<CodingClasses />} />
              <Route path={ROUTES.PORTFOLIO} element={<Portfolio />} />
              <Route path={ROUTES.CAREER} element={<Career />} />
              <Route path={ROUTES.SUBSCRIPTION} element={<MonthlySubscription />} />
              <Route path={ROUTES.PRODUCTS} element={<Products />} />
              <Route path={ROUTES.USERS} element={<Users />} />
            </Route>
          </Route>

          {/* ── Admin portal (standalone shell) ── */}
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="partners" element={<AdminPartners />} />
          </Route>

          {/* ── Partner auth pages (standalone, no header/footer) ── */}
          <Route path={ROUTES.PARTNER.LOGIN} element={<PartnerLogin />} />
          <Route path={ROUTES.PARTNER.REGISTER} element={<PartnerRegister />} />

          {/* ── Partner portal (authenticated shell with sidebar) ── */}
          <Route path={ROUTES.PARTNER.DASHBOARD} element={<PartnerLayout />}>
            <Route index element={<PartnerDashboard />} />
            <Route path="orders" element={<PartnerOrders />} />
            <Route path="payouts" element={<PartnerPayouts />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App