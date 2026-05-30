import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import RootLayout from './layouts/RootLayout'
import WebsiteLayout from './layouts/WebsiteLayout'
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
import { ROUTES } from './constants/routes'

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
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
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App