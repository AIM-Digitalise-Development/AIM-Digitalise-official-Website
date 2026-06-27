import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import useUIStore from '../../store/uiStore'
import PageHero from '../../components/website/common/PageHero'

const categories = ['Web', 'Graphics', 'Mobile Application', 'Software Development', 'Digital Marketing']

const projects = [
  // Web
  {
    title: 'AIM Digitalise Official Website & Portal',
    category: 'Web',
    client: 'AIM Digitalise Pvt. Ltd.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    description: 'Developed the high-performance modern official company website featuring full responsive layouts, automated billing integration, and customer dashboards.',
    techs: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Node.js']
  },
 
  // Graphics
  {
    title: 'SaaS Platform Rebranding & UI Kit',
    category: 'Graphics',
    client: 'NexGen ERP Systems',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    description: 'Created a comprehensive brand identity including modern logos, unified color schemes, marketing collateral, and a scalable Figma design library.',
    techs: ['Adobe Illustrator', 'Figma', 'Brand Guidelines', 'Vector Art']
  },
  {
    title: 'Creative Marketing Campaign Graphics',
    category: 'Graphics',
    client: 'Apex Digital Solutions',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80',
    description: 'Designed highly engaging social media graphic sets, visual banners, and vector assets for seasonal promotional digital marketing campaigns.',
    techs: ['Photoshop', 'Illustrator', 'Visual Design', 'Social Media Ads']
  },
  // Mobile Application
  {
    title: 'FinTech Wallet & Investment App',
    category: 'Mobile Application',
    client: 'PaySmart Financials',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    description: 'A native iOS and Android financial wallet app. Incorporates biometric login, money transfers, and real-time stock tracker feeds.',
    techs: ['React Native', 'Expo', 'Redux', 'Biometrics', 'Node.js API']
  },
  {
    title: 'On-Demand Delivery & Logistics App',
    category: 'Mobile Application',
    client: 'QuickDrop Logistics',
    image: 'https://images.unsplash.com/photo-1526253038957-b134e2fc9d49?auto=format&fit=crop&w=800&q=80',
    description: 'Designed a real-time driver tracking and user delivery booking app using integrated Google Maps API and push notification alerts.',
    techs: ['Flutter', 'Dart', 'Google Maps API', 'Firebase Cloud Messaging']
  },
  // Software Development
  {
    title: 'NexGen Institute Pro ERP System',
    category: 'Software Development',
    client: 'NexGen Education Group',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    description: 'Developed a comprehensive Institute Management ERP containing automated online attendance trackers, fee collection gateways, and grading pipelines.',
    techs: ['C# .NET Core', 'SQL Server', 'React', 'Entity Framework', 'Docker']
  },
  {
    title: 'AI-Powered Automated Inventory Engine',
    category: 'Software Development',
    client: 'SmartWare LogiTech',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    description: 'Engineered a local service script and neural network logic to automate logistics warehouse stock management and anticipate restock delays.',
    techs: ['Python', 'TensorFlow', 'PostgreSQL', 'FastAPI', 'Pandas']
  },
  // Digital Marketing
  {
    title: 'SEO Page Ranking & Growth Campaign',
    category: 'Digital Marketing',
    client: 'FitLife Organic Brands',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    description: 'Launched a multi-month search engine optimization and targeted keyword campaign that boosted monthly organic search traffic by 180%.',
    techs: ['Google Analytics', 'Ahrefs', 'SEM Rush', 'Content Strategy', 'SEO']
  },
  {
    title: 'Hyper-Targeted Pay-Per-Click Ad Management',
    category: 'Digital Marketing',
    client: 'Global Tech Retailers',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    description: 'Strategized, managed, and A/B tested high-converting Facebook and Google Search Ads campaigns, decreasing cost-per-acquisition (CPA) by 35%.',
    techs: ['Google Ads Manager', 'Meta Ads Manager', 'A/B Testing', 'Copywriting']
  }
]

const portfolioImages = import.meta.glob(
  '../../assets/images/portfolio/*.{png,jpg,jpeg,svg,webp,WEBP,PNG,JPG,JPEG}',
  { eager: true, import: 'default' }
)

const softwareList = [
  { name: 'Aim Educares', cat: 'Software Development', tech: ['React', 'Node.js', 'PostgreSQL', 'Docker'], desc: 'Complete school management ERP with student trackers, automated fee payment collection, attendance logs, and online marksheets.' },
  { name: 'Chosmic', cat: 'Graphics', tech: ['Figma', 'Adobe Illustrator', 'UI/UX Design'], desc: 'Brand identity, modern vector logos, visual guidelines, and interactive UI component prototypes.' },
  { name: 'Hotel Vinayek', cat: 'Web', tech: ['React', 'Vite', 'Tailwind CSS', 'Firebase'], desc: 'Premium responsive website featuring real-time room availability, online booking, and restaurant menu integration.' },
  { name: 'Gram Panchayat', cat: 'Software Development', tech: ['C# .NET', 'SQL Server', 'React'], desc: 'Custom local governance portal facilitating citizen certificates, scheme application trackers, and public grievance logs.' },
  { name: 'Anandamoyee Ananda Niwas', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Framer Motion'], desc: 'Elegantly designed promotional website and digital portal showcasing premium elder care facilities.' },
  { name: 'Bengal Fire Preservation', cat: 'Web', tech: ['React', 'Vite', 'Tailwind CSS'], desc: 'Industrial business site featuring custom compliance forms, safety service catalogs, and emergency inquiry forms.' },
  { name: 'Cooltronics Service Center', cat: 'Software Development', tech: ['Node.js', 'Express', 'MongoDB', 'React'], desc: 'Advanced repair tracking software managing appliance service records, technician assignments, and billing.' },
  { name: 'Fourclips Magma', cat: 'Graphics', tech: ['Illustrator', 'Photoshop', 'Brand Guide'], desc: 'Visual strategy, custom illustrations, banner designs, and high-impact social media campaign graphics.' },
  { name: 'INDIBIZZ', cat: 'Digital Marketing', tech: ['Meta Ads', 'Google Ads', 'SEO Campaign'], desc: 'Comprehensive digital marketing campaign boosting platform reach, vendor acquisitions, and monthly conversion metrics.' },
  { name: 'Legal Taxation', cat: 'Software Development', tech: ['React', 'Python', 'FastAPI', 'PostgreSQL'], desc: 'Advanced corporate tax calculator and tracking dashboard assisting corporate compliance audits.' },
  { name: 'Logixtime Automation', cat: 'Software Development', tech: ['Python', 'Django', 'PostgreSQL', 'Docker'], desc: 'Industrial process monitoring system integrating time-series data pipelines and real-time dashboard widgets.' },
  { name: 'Sasmal Consultancy', cat: 'Web', tech: ['React', 'Vite', 'Tailwind CSS'], desc: 'Sleek portfolio and scheduling platform for corporate consultation and financial advisory firms.' },
  { name: 'Shyamnagar X-Ray Clinic', cat: 'Software Development', tech: ['React', 'Node.js', 'MongoDB', 'WebRTC'], desc: 'Diagnostic clinic scheduler, automated SMS report dispatch system, and electronic medical record repository.' },
  { name: 'Spectrum Petromac Pvt. Ltd.', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Vite'], desc: 'Corporate website for energy sector solutions, including industrial oil distribution catalogues and quote tools.' },
  { name: 'Sparsh', cat: 'Mobile Application', tech: ['React Native', 'Redux', 'Node.js'], desc: 'A dedicated social impact and mobile NGO platform facilitating donor contributions and program updates.' },
  { name: 'Star Cooling Service Center', cat: 'Web', tech: ['React', 'Vite', 'Tailwind CSS'], desc: 'Responsive site featuring repair appointment booker, service warranty tracker, and dynamic client support.' },
  { name: 'Sujata Mishra Legal Firm', cat: 'Web', tech: ['React', 'Vite', 'Tailwind CSS'], desc: 'Professional legal advisory website showcasing case records, practitioner bios, and contact modules.' },
  { name: 'Dr Tushar Kanti', cat: 'Software Development', tech: ['React', 'Node.js', 'MongoDB'], desc: 'Healthcare patient scheduler, digital prescription writer, and clinic queue management system.' },
  { name: 'ESBEE Road', cat: 'Software Development', tech: ['React', 'Node.js', 'PostgreSQL'], desc: 'Logistics delivery routing software optimizing cargo load distributions and tracking transit schedules.' },
  { name: 'Subhoma Foods', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Vite'], desc: 'E-commerce platform for packaged food items integrated with local delivery networks and payment gateways.' },
  { name: 'Momo Chicken', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Firebase'], desc: 'Interactive food ordering portal for restaurant chains featuring dynamic cart checkout and order tracking.' },
  { name: 'Blue Birds Machinery', cat: 'Web', tech: ['React', 'Vite', 'Tailwind CSS'], desc: 'Industrial equipment manufacturing display website showcasing product lines and query intakes.' },
  { name: 'Nesha Mukti Kendra', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Framer Motion'], desc: 'Clean, compassionate website for rehabilitation centers offering counseling schedulers and support resources.' },
  { name: 'Banzara Restaurant', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Firebase'], desc: 'Premium culinary website featuring restaurant booking, online menus, and special event booking.' },
  { name: 'Diamond Pest Control', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Vite'], desc: 'Service inquiry site featuring service package builders, scheduling tools, and instant quotes.' },
  { name: 'Arati', cat: 'Graphics', tech: ['Figma', 'Illustrator', 'UI Design'], desc: 'Custom print collateral, brochure layouts, packaging design, and brand identity elements.' },
  { name: 'Printopia World', cat: 'Graphics', tech: ['Photoshop', 'Illustrator', 'Graphic Design'], desc: 'Creative layouts for print media, customized packaging vectors, and brand identity kits.' },
  { name: 'Atlas', cat: 'Software Development', tech: ['React', 'Node.js', 'PostgreSQL'], desc: 'Project planning tracker featuring task assignments, gantt charts, and team velocity dashboards.' },
  { name: 'H N Infotech', cat: 'Software Development', tech: ['C# .NET', 'SQL Server', 'React'], desc: 'Enterprise IT infrastructure monitoring portal with automated error logging and ticketing integration.' },
  { name: 'Fundage', cat: 'Digital Marketing', tech: ['Google Analytics', 'SEO Strategy', 'SEM'], desc: 'High-converting search engine marketing campaign that decreased customer acquisition cost by 40%.' },
  { name: 'Shiv Shivam Pharma', cat: 'Software Development', tech: ['React', 'Node.js', 'MongoDB'], desc: 'Pharmacy inventory and stock control engine managing expiration dates and batch distribution logs.' },
  { name: 'CA Baksi & Co.', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Vite'], desc: 'Corporate charter audit and accounting advisory portal with secure document submission vaults.' },
  { name: 'Head Zone', cat: 'Graphics', tech: ['Figma', 'Illustrator', 'UI/UX Design'], desc: 'Creative branding strategy, visual identity guides, typography schemes, and marketing collateral.' },
  { name: 'BMS Construction', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Framer Motion'], desc: 'Architectural portfolio website showing ongoing project renders, engineering credentials, and contact logs.' },
  { name: 'Dawn Investments', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Vite'], desc: 'Mutual funds and financial asset portfolio planner with calculator widgets and interactive rates.' },
  { name: 'Nortech', cat: 'Software Development', tech: ['React', 'Node.js', 'MongoDB'], desc: 'Local network activity manager displaying connected devices, packet feeds, and port safety guidelines.' },
  { name: 'AEC Infrastructure', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Vite'], desc: 'Heavy engineering infrastructure portfolio showcasing road construction projects and machinery fleets.' },
  { name: 'SEBA', cat: 'Software Development', tech: ['React', 'Node.js', 'PostgreSQL'], desc: 'Academic board registration platform managing student databases, board applications, and audit reports.' },
  { name: 'Samadhan Consulting', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Vite'], desc: 'Corporate legal compliance firm website featuring case evaluations and consultation bookings.' },
  { name: 'Samadhan Recruitment', cat: 'Software Development', tech: ['React', 'Node.js', 'MongoDB'], desc: 'Automated HR recruitment engine filtering applicant resumes, managing interview pipes, and release letters.' },
  { name: 'TWPS', cat: 'Software Development', tech: ['React', 'Node.js', 'PostgreSQL'], desc: 'Municipal water distribution monitoring portal tracking tank levels, pipe flows, and quality logs.' },
  { name: 'Hi Killing Pest Control', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Vite'], desc: 'Local booking platform featuring insect identification guides, package options, and direct scheduling.' },
  { name: 'Golden Times', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Framer Motion'], desc: 'Luxury event organizer website showcasing venue partnerships, decor portfolios, and scheduling engines.' },
  { name: 'EKVA', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Vite'], desc: 'Corporate site showcasing sustainable energy initiatives, project metrics, and investment pipelines.' },
  { name: 'Bengal TVS', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Firebase'], desc: 'Automobile dealership showcase page facilitating test-drive bookings and virtual showrooms.' },
  { name: 'Krishna Plywood', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Vite'], desc: 'Interior manufacturing catalogue website demonstrating custom plywood textures and query forms.' },
  { name: 'Rajrani Travels', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Vite'], desc: 'Online tour guide booking, package scheduler, and vehicle hire reservation system.' },
  { name: 'Future Vision', cat: 'Digital Marketing', tech: ['Social Media Ads', 'SMM', 'Brand Strategy'], desc: 'Targeted social media marketing and brand positioning campaign resulting in 150k+ organic impressions.' },
  { name: 'PPL MRI Parts', cat: 'Software Development', tech: ['React', 'Node.js', 'MongoDB'], desc: 'Specialized inventory database manager for medical scanning machinery replacement parts.' },
  { name: 'Gowardhan Dairy', cat: 'Software Development', tech: ['React', 'Node.js', 'PostgreSQL'], desc: 'Dairy distribution tracking software managing daily production milk levels, routes, and billing ledger logs.' },
  { name: 'Astrologer', cat: 'Digital Marketing', tech: ['Local SEO', 'Google Business Profile', 'SMM'], desc: 'Search engine optimization campaign boosting organic local traffic by 200% for spiritual consulting.' },
  { name: 'Banerjee Diagnostic', cat: 'Software Development', tech: ['React', 'Node.js', 'MongoDB'], desc: 'Diagnostic laboratory patient reports management portal with secure PDF delivery systems.' },
  { name: 'Sunrise Diagnostic', cat: 'Software Development', tech: ['React', 'Node.js', 'PostgreSQL'], desc: 'Pathology sample booking scheduler, laboratory workflow manager, and billing registers.' },
  { name: 'MobileLaptopFix.Com', cat: 'Web', tech: ['React', 'Tailwind CSS', 'Firebase'], desc: 'Electronic repairs portal showcasing services, pricing estimator widgets, and tracking tools.' }
]

const dynamicProjects = Object.entries(portfolioImages).map(([path, url]) => {
  const filename = path.split('/').pop().replace(/\.[^/.]+$/, "")
  
  const match = filename.match(/\d+/)
  const num = match ? parseInt(match[0], 10) : 0
  
  const software = (num > 0 && num <= softwareList.length) ? softwareList[num - 1] : null
  
  let title = software ? software.name : `AIM Project ${filename}`
  if (filename.includes('(2)') || filename.includes('alt')) {
    title += ' - Alternative Design'
  } else if (filename === 'template-48') {
    title += ' - Alternative Design'
  }
  
  return {
    title,
    category: software ? software.cat : 'Web',
    client: software ? software.name : 'Partner Brand',
    image: url,
    description: software ? software.desc : 'Premium responsive custom design solution tailored for client needs.',
    techs: software ? software.tech : ['React', 'Tailwind CSS', 'UI/UX']
  }
})

const allProjects = [...projects, ...dynamicProjects]

const Portfolio = () => {
  const [filter, setFilter] = useState('Web')
  const openAppointmentModal = useUIStore((state) => state.openAppointmentModal)

  const filteredProjects = allProjects.filter(p => p.category === filter)

  return (
    <>
      <Helmet>
        <title>AIM Digitalise | Our Portfolio</title>
        <meta name="description" content="Browse our case studies: web platforms, graphic designs, native mobile apps, custom enterprise software, and hyper-targeted digital marketing strategies." />
      </Helmet>

      <div className="page-shell bg-aim-navy">
        {/* Compact Title Section */}
        <section className="relative pt-10 pb-6 border-b border-white/10 overflow-hidden">
          <div className="ambient-glows" aria-hidden />
          <div className="container-custom relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
              <div className="space-y-2">
                <div className="badge-pill w-fit text-[10px] py-1 px-2.5 uppercase tracking-widest">
                  <span className="badge-pill-dot" />
                  Our Work
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Architecting High-Impact <span className="text-gradient">Products</span>
                </h1>
                <p className="text-xs sm:text-sm text-aim-copy-muted max-w-xl leading-relaxed">
                  Explore how we have engineered scalable solutions, custom software, and implemented marketing campaigns globally.
                </p>
              </div>

              <div className="shrink-0">
                <a 
                  href="/aim_digitalise_portfolio.pdf" 
                  download 
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-aim-gold to-aim-gold-light text-aim-navy font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-aim-gold/25 hover:shadow-aim-gold/45 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 cursor-pointer decoration-transparent font-sans"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Portfolio PDF
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section-muted py-12">
          <div className="container-custom">
            {/* Filter Bar */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 mb-10 border-b border-white/5 pb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`tab-filter-btn ${filter === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Projects Grid */}
            <motion.div 
              layout
              className="grid md:grid-cols-2 gap-8 mb-20"
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((proj) => (
                  <motion.div
                    key={`${proj.title}-${proj.image}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card hover padding="none" className="h-full overflow-hidden flex flex-col group/card rounded-3xl border border-white/5 transition-all duration-300">
                      {/* Visual Card Image Header */}
                      <div className="relative p-4 pb-0 overflow-hidden bg-aim-navy dark:bg-transparent">
                        <div className="relative h-48 sm:h-56 overflow-hidden rounded-2xl">
                          <img 
                            src={proj.image} 
                            alt={proj.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                          />
                        </div>
                        
                        {/* Category Badge */}
                        <div className="absolute top-8 left-8 z-10">
                          <span className="px-3 py-1 rounded-full bg-aim-navy/80 backdrop-blur border border-aim-gold/30 text-aim-gold text-[10px] font-black uppercase tracking-widest shadow-lg">
                            {proj.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between space-y-6 text-left">
                        <div className="space-y-3">
                          <p className="text-[10px] text-aim-copy-muted font-bold uppercase tracking-widest">CLIENT: {proj.client}</p>
                          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight transition-colors group-hover/card:text-aim-gold">{proj.title}</h3>
                          <p className="text-aim-copy-muted text-sm leading-relaxed">{proj.description}</p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-1.5">
                            {proj.techs.map((tech) => (
                              <span key={tech} className="px-2.5 py-1 rounded bg-slate-200/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/5 text-aim-copy-muted text-xs font-semibold">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* CTA */}
            <div className="cta-panel max-w-5xl mx-auto p-10 text-center relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-radial-glow pointer-events-none"></div>
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl font-bold text-white">Let's build your next system</h2>
                <p className="text-aim-copy-muted max-w-2xl mx-auto text-sm">
                  Connect with our solutions architects to discuss your technical specifications, legacy migrations, or scaling requirements.
                </p>
                <div className="flex justify-center">
                  <Button
                    variant="primary"
                    size="lg"
                    className="cursor-pointer"
                    onClick={openAppointmentModal}
                  >
                    Schedule Strategy Call
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Portfolio

