frontend/                              # React application root directory
│
├── public/                            # Static assets served as-is (no processing)
│   ├── favicon.svg                    # Browser tab icon
│   ├── icons.svg                      # SVG sprite for icons across the app
│   └── icons/                         # Individual icon files
│
├── src/                               # Main source code directory
│   │
│   ├── main.jsx                       # App entry point - mounts React to DOM
│   ├── App.jsx                        # Root component - routing + global providers
│   ├── index.css                      # Global CSS reset + Tailwind imports
│   ├── App.css                        # App-level styles
│   │
│   ├── api/                           # 🌐 API LAYER - Calls Laravel backend on Hostinger
│   │   ├── client.js                  # Axios instance with baseURL pointing to Hostinger
│   │   ├── auth.js                    # login(), logout(), refreshToken() to Laravel
│   │   ├── users.js                   # getUsers(), createUser(), updateUser()
│   │   ├── orders.js                  # getOrders(), placeOrder(), cancelOrder()
│   │   ├── products.js                # getProducts(), getProductById()
│   │   ├── analytics.js               # getDashboardStats(), getChartsData()
│   │   ├── partner.js                 # getPartnerEarnings(), getPayouts()
│   │   ├── clientPortal.js            # clientLogin(), getClientProfile(), getClientProducts()
│   │   └── index.js                   # Re-exports all API modules
│   │
│   ├── store/                         # 📦 STATE MANAGEMENT
│   │   ├── index.js                   # Zustand stores + React Query client setup
│   │   ├── authStore.js               # Zustand: User identity, roles, tokens (client state)
│   │   ├── uiStore.js                 # Zustand: Sidebar toggle, modals, toasts (UI state)
│   │   ├── clientAuthStore.js         # Zustand: Client identity, tokens, caching (client state)
│   │   └── queries/                   # React Query - Server state management
│   │       ├── queryKeys.js           # Centralized cache keys for invalidation
│   │       ├── useUsersQuery.js       # Fetch users with caching + auto-refresh
│   │       ├── useOrdersQuery.js      # Fetch orders with pagination
│   │       ├── useProductsQuery.js    # Fetch products with filters
│   │       └── useAnalyticsQuery.js   # Fetch analytics data
│   │
│   ├── config/                        # ⚙️ CONFIGURATION FILES
│   │   ├── env.js                     # Environment variables (API_URL, APP_NAME, etc.)
│   │   ├── features.js                # Feature flag toggles (optional)
│   │   └── queryClient.js             # React Query defaults (staleTime, retries)
│   │
│   ├── i18n/                          # 🌍 INTERNATIONALIZATION (optional)
│   │   ├── index.js                   # i18next + react-i18next setup
│   │   └── locales/                   # Translation files
│   │       ├── en.json                # English translations
│   │       └── hi.json                # Hindi translations
│   │
│   ├── assets/                        # 🖼️ STATIC MEDIA
│   │   ├── hero.png                   # Homepage hero image
│   │   ├── react.svg                  # React logo
│   │   └── vite.svg                   # Vite logo
│   │
│   ├── layouts/                       # 🏗️ PAGE LAYOUT WRAPPERS
│   │   ├── RootLayout.jsx             # Base layout with Header + Footer
│   │   ├── WebsiteLayout.jsx          # Marketing pages layout
│   │   ├── AdminLayout.jsx            # Screenshot-style admin shell (left nav + content area)
│   │   ├── EmployeeLayout.jsx         # Employee portal layout
│   │   ├── PartnerLayout.jsx          # Partner dashboard layout
│   │   ├── CustomerLayout.jsx         # Customer account layout
│   │   └── ClientLayout.jsx           # Client dashboard shell layout
│   │
│   ├── pages/                         # 📄 ROUTE-BASED PAGES
│   │   ├── website/                   # Public marketing pages
│   │   │   ├── Home.jsx               # Landing page
│   │   │   ├── About.jsx              # Company info
│   │   │   ├── Contact.jsx            # Contact form
│   │   │   ├── Products.jsx           # Product catalog
│   │   │   ├── Services.jsx           # Technical engineering services
│   │   │   ├── CodingClasses.jsx      # Academy and bootcamps
│   │   │   ├── Portfolio.jsx          # Case studies and works
│   │   │   ├── Career.jsx             # Open roles and job application
│   │   │   ├── MonthlySubscription.jsx # Subscription billing models
│   │   │   └── Users.jsx              # Public user profiles
│   │   ├── admin/                     # Admin-only pages (requires RBAC)
│   │   │   ├── Dashboard.jsx          # Pixel-inspired dashboard UI based on provided reference image
│   │   │   ├── Users.jsx              # User management CRUD
│   │   │   ├── Settings.jsx           # System configuration
│   │   │   ├── Analytics.jsx          # Advanced business metrics
│   │   │   └── Partners.jsx           # Partner approvals & agent rank hierarchy tree
│   │   ├── employee/                  # Employee-only pages
│   │   │   ├── Dashboard.jsx          # Employee tasks overview
│   │   │   ├── Tasks.jsx              # Task management board
│   │   │   └── Timesheet.jsx          # Time logging
│   │   ├── partner/                   # Partner portal pages
│   │   │   ├── Dashboard.jsx          # Partner earnings/stats
│   │   │   ├── Orders.jsx             # Partner orders
│   │   │   └── Payouts.jsx            # Payment history
│   │   ├── customer/                  # Customer account pages
│   │   │   ├── Dashboard.jsx          # Order history + recommendations
│   │   │   ├── Orders.jsx             # Past orders + tracking
│   │   │   └── Profile.jsx            # Account management
│   │   └── client/                    # Client portal pages
│   │       ├── Login.jsx              # Client Login page
│   │       ├── Products.jsx           # Client active products page
│   │       └── Profile.jsx            # Client profile details page
│   │
│   ├── components/                    # 🧩 REUSABLE UI COMPONENTS
│   │   ├── common/                    # Cross-app components
│   │   │   ├── ErrorBoundary.jsx      # Catches JS errors, shows fallback
│   │   │   ├── ErrorFallback.jsx      # UI shown when error occurs
│   │   │   ├── Skeleton.jsx           # Loading placeholders
│   │   │   ├── PermissionGate.jsx     # RBAC wrapper (show if user has role)
│   │   │   └── DataTable.jsx          # Reusable table with sort/pagination
│   │   ├── ui/                        # Design system primitives
│   │   │   ├── Button.jsx             # Button with variants (primary, danger)
│   │   │   ├── Card.jsx               # Content container with styling
│   │   │   ├── Modal.jsx              # Dialog/popup component
│   │   │   ├── Input.jsx              # Form input with validation
│   │   │   ├── Select.jsx             # Dropdown selector
│   │   │   └── Toast.jsx              # Notification popup
│   │   ├── auth/                      # Authentication UI (login modals/forms)
│   │   │   └── AdminEmployeeLoginModal.jsx # Footer dropdown: Employee + Admin login
│   │   ├── website/                   # Marketing site components
│   │   │   ├── home/                  # Homepage sections
│   │   │   │   ├── HeroSection.jsx    # Main banner + CTA
│   │   │   │   ├── FeaturesGrid.jsx   # Product features grid
│   │   │   │   ├── AboutCompanySection.jsx # Detailed company intro with team photo
│   │   │   │   ├── NxtGenErpSection.jsx # Detailed ERP showcase with 3 videos
│   │   │   │   ├── SpecialtiesSection.jsx # Specialties and Expertise cards
│   │   │   │   ├── OurClientsSection.jsx # Our Clients logo grid section
│   │   │   │   ├── TestimonialsSection.jsx # Customer reviews
│   │   │   │   ├── PricingCard.jsx    # Pricing plan cards
│   │   │   │   ├── LatestNews.jsx     # Blog/news feed
│   │   │   │   └── CTASection.jsx     # Call-to-action banner
│   │   │   ├── about/                 # About page sections
│   │   │   │   ├── CompanyHistory.jsx # Timeline/company story
│   │   │   │   ├── TeamMembers.jsx    # Employee profiles
│   │   │   │   ├── MissionVision.jsx  # Company values
│   │   │   │   ├── StatsCounter.jsx   # Animated number counters
│   │   │   │   └── ValuesSection.jsx  # Core values list
│   │   │   ├── contact/               # Contact page
│   │   │   │   ├── ContactForm.jsx    # Form submission
│   │   │   │   ├── MapLocation.jsx    # Google Maps embed
│   │   │   │   ├── OfficeInfo.jsx     # Address/hours/phone
│   │   │   │   └── SocialLinks.jsx    # Social media buttons
│   │   │   └── products/              # Product listing components
│   │   │       ├── ProductCard.jsx    # Individual product display
│   │   │       ├── ProductFilter.jsx  # Filter sidebar
│   │   │       ├── ProductGrid.jsx    # Grid layout of products
│   │   │       └── ProductSearch.jsx  # Search bar with autocomplete
│   │   ├── admin/                     # Admin dashboard components
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsWidget.jsx    # Legacy simple KPI card widget (kept for reuse)
│   │   │   │   ├── RevenueChart.jsx   # Legacy chart placeholder (kept for reuse)
│   │   │   │   ├── RecentActivity.jsx # Legacy activity feed placeholder
│   │   │   │   └── QuickActions.jsx   # Legacy shortcut actions
│   │   │   ├── users/
│   │   │   │   ├── UserTable.jsx      # User list with actions
│   │   │   │   ├── UserForm.jsx       # Create/edit user
│   │   │   │   ├── UserFilters.jsx    # Search/filter users
│   │   │   │   └── UserRoleBadge.jsx  # Role indicator
│   │   │   ├── settings/
│   │   │   │   ├── GeneralSettings.jsx # App name, logo, timezone
│   │   │   │   ├── SecuritySettings.jsx # 2FA, password policy
│   │   │   │   ├── NotificationSettings.jsx # Email/SMS config
│   │   │   │   └── APISettings.jsx    # API key management
│   │   │   └── analytics/
│   │   │       ├── AnalyticsChart.jsx # Chart wrapper
│   │   │       ├── DateRangePicker.jsx # Date selector
│   │   │       ├── MetricsGrid.jsx    # KPI dashboard
│   │   │       └── ReportsExport.jsx  # PDF/CSV export
│   │   ├── employee/                  # Employee portal components
│   │   │   ├── dashboard/
│   │   │   │   ├── WelcomeBanner.jsx  # Personalized greeting
│   │   │   │   ├── TaskSummary.jsx    # Task count by status
│   │   │   │   ├── UpcomingDeadlines.jsx # Due dates list
│   │   │   │   └── ProductivityChart.jsx # Performance graph
│   │   │   ├── tasks/
│   │   │   │   ├── TaskBoard.jsx      # Kanban board
│   │   │   │   ├── TaskCard.jsx       # Individual task
│   │   │   │   ├── TaskFilters.jsx    # Filter by status/assignee
│   │   │   │   └── CreateTaskModal.jsx # Task creation form
│   │   │   └── timesheet/
│   │   │       ├── Timer.jsx          # Start/stop time tracking
│   │   │       ├── TimesheetList.jsx  # Logged time entries
│   │   │       ├── WeeklySummary.jsx  # Hours per week
│   │   │       └── TimeLogForm.jsx    # Manual time entry
│   │   ├── partner/                   # Partner portal components
│   │   │   ├── dashboard/
│   │   │   │   ├── EarningsWidget.jsx # Revenue summary
│   │   │   │   ├── PartnerStats.jsx   # Orders/commission stats
│   │   │   │   ├── RecentOrders.jsx   # Latest partner orders
│   │   │   │   └── PayoutStatus.jsx   # Payment pending/sent
│   │   │   ├── orders/
│   │   │   │   ├── OrderCard.jsx      # Order summary card
│   │   │   │   ├── OrderDetails.jsx   # Detailed order view
│   │   │   │   ├── OrderFilters.jsx   # Filter by date/status
│   │   │   │   └── OrderStatusBadge.jsx # Status indicator
│   │   │   └── payouts/
│   │   │       ├── PayoutHistory.jsx  # Past payments list
│   │   │       ├── PayoutChart.jsx    # Earnings trend
│   │   │       ├── WithdrawForm.jsx   # Request withdrawal
│   │   │       └── BankAccountForm.jsx # Bank details form
│   │   └── customer/                  # Customer account components
│   │       ├── dashboard/
│   │       │   ├── WelcomeMessage.jsx # Personalized greeting
│   │       │   ├── RecentOrders.jsx   # Last 5 orders
│   │       │   ├── RecommendedProducts.jsx # AI recommendations
│   │       │   └── LoyaltyCard.jsx    # Points/status display
│   │       ├── orders/
│   │       │   ├── OrderHistory.jsx   # All past orders
│   │       │   ├── OrderDetails.jsx   # Order tracking + items
│   │       │   ├── TrackOrder.jsx     # Live tracking map
│   │       │   └── CancelOrderModal.jsx # Cancellation form
│   │       └── profile/
│   │           ├── ProfileForm.jsx    # Edit personal info
│   │           ├── ChangePassword.jsx # Password update
│   │           ├── AddressBook.jsx    # Saved addresses
│   │           └── NotificationPrefs.jsx # Email/SMS preferences
│   │       └── client/                    # Client portal components
│   │           ├── profile/               # Client profile sub-cards
│   │           │   ├── BasicInfoCard.jsx
│   │           │   ├── OrgDetailsCard.jsx
│   │           │   ├── AddressCard.jsx
│   │           │   └── PurchaseInfoCard.jsx
│   │           └── products/              # Client active products and billing sub-cards
│   │               ├── ProductActiveCard.jsx
│   │               ├── BillingDetailsCard.jsx
│   │               └── PurchaseSummaryCard.jsx
│   │
│   ├── contexts/                      # 🔄 REACT CONTEXT (for simple state)
│   │   └── AuthContext.jsx            # Provides auth state to entire app
│   │
│   ├── hooks/                         # 🪝 CUSTOM REACT HOOKS
│   │   ├── usePerformance.js          # Track component render performance
│   │   ├── usePrefetch.js             # Preload data before navigation
│   │   ├── useAuth.js                 # Access auth state anywhere
│   │   ├── useRoleAccess.js           # Check user permissions
│   │   └── useToast.js                # Show notification toasts
│   │
│   ├── constants/                     # 📋 GLOBAL CONSTANTS
│   │   ├── routes.js                  # App route paths (ROUTES.HOME, etc.)
│   │   ├── roles.js                   # User role definitions (ADMIN, USER, etc.)
│   │   └── permissions.js             # Permission mappings per role
│   │
│   └── utils/                         # 🔧 UTILITY FUNCTIONS
│       ├── performance.js             # Performance monitoring helpers
│       ├── rbac.js                    # Role-based access control logic
│       ├── format.js                  # Date/currency/number formatters
│       └── errors.js                  # API error normalization
│
├── index.html                         # Entry HTML file
├── vite.config.js                     # Vite build configuration
├── tailwind.config.js                 # Tailwind CSS configuration
├── postcss.config.js                  # PostCSS (Tailwind + autoprefixer)
├── eslint.config.js                   # ESLint rules (code quality) - optional
├── .env.example                       # Template for environment variables
├── .env.local                         # Local secrets (gitignored)
├── jsconfig.json                      # Path aliases (@/components, @/utils)
├── package.json                       # Dependencies + scripts
├── package-lock.json                  # Locked dependency versions
├── .gitignore                         # Files ignored by Git
└── README.md                          # Project documentation