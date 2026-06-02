import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import PageHero from '../../components/website/common/PageHero'

const categories = ['All', 'Cloud & DevOps', 'AI Integrations', 'Web Platforms']

const projects = [
  {
    title: 'NeoBank Cloud Architecture Modernization',
    category: 'Cloud & DevOps',
    client: 'NeoBank Global',
    stats: { metric: '40% Saving', label: 'Infrastructure Costs' },
    description: 'Orchestrated the migration of a legacy high-transaction banking application to a multi-region AWS environment. Built with Terraform, utilizing Kubernetes for pod scaling and SOC2 compliance monitoring.',
    techs: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Prometheus'],
    gradient: 'from-blue-50 via-blue-50/30 to-transparent'
  },
  {
    title: 'MedTech Intelligent Diagnostic Agent',
    category: 'AI Integrations',
    client: 'Apex Health Systems',
    stats: { metric: '98.5% Accuracy', label: 'OCR Classification' },
    description: 'Engineered an AI-powered pipeline utilizing LLMs and vector search databases to parse and classify complex patient history documents. Fully HIPAA compliant secure setup.',
    techs: ['OpenAI API', 'LangChain', 'Python', 'Pinecone', 'HIPAA AWS VPC'],
    gradient: 'from-red-50 via-rose-50/30 to-transparent'
  },
  {
    title: 'Real-Time Logistics Supply Chain Platform',
    category: 'Web Platforms',
    client: 'LogiLink Logistics',
    stats: { metric: '10K+ Assets', label: 'Tracked in Real-time' },
    description: 'Designed a dashboard to orchestrate, analyze, and track logistics assets. Developed using Vite/React and WebSockets, connecting with Laravel backend services.',
    techs: ['React', 'Node.js', 'WebSockets', 'Laravel', 'Tailwind CSS'],
    gradient: 'from-blue-50 via-red-50/20 to-transparent'
  },
  {
    title: 'LearnEd Certification Engine',
    category: 'Web Platforms',
    client: 'LearnEd Academy',
    stats: { metric: '100K+ Users', label: 'Monthly Active Learners' },
    description: 'Constructed a robust online bootcamp portal with real-time code execution containers and class enrollment gateways. Powered by Redis query caches.',
    techs: ['Next.js', 'Express', 'Redis', 'PostgreSQL', 'Docker Containers'],
    gradient: 'from-red-50 via-red-50/20 to-transparent'
  }
]

const Portfolio = () => {
  const [filter, setFilter] = useState('All')

  const filteredProjects = filter === 'All'
    ? projects
    : projects.filter(p => p.category === filter)

  return (
    <>
      <Helmet>
        <title>Our Portfolio | AIM Digitalise</title>
        <meta name="description" content="Browse our case studies: high-transaction cloud architectures, smart medical AI diagnostic agents, and high-performance web platforms." />
      </Helmet>

      <div className="page-shell">
        <PageHero
          badge="Our Work & Case Studies"
          title="Architecting High-Impact"
          highlight="Products"
          description="Explore how we have engineered scalable solutions, optimized cloud architectures, and implemented AI integrations for enterprises and startups globally."
        />

        <section className="section-muted py-16 md:py-20">
        <div className="container-custom">
          {/* Filter Bar */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                  filter === cat
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/15'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <motion.div 
            layout
            className="grid lg:grid-cols-2 gap-8 mb-20"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((proj) => (
                <motion.div
                  key={proj.title}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card hover padding="none" className="h-full overflow-hidden flex flex-col bg-white border-slate-200 shadow-sm">
                    {/* Visual Card Top */}
                    <div className={`p-8 bg-gradient-to-tr ${proj.gradient} border-b border-slate-200 relative`}>
                      <span className="text-xs text-blue-600 uppercase font-black tracking-widest block mb-2">{proj.category}</span>
                      <h3 className="text-2xl font-black text-slate-900 leading-snug mb-4 text-left">{proj.title}</h3>
                      <div className="flex gap-4">
                        <div className="bg-white/90 border border-slate-200 backdrop-blur rounded-xl p-3 max-w-[160px] text-left shadow-sm">
                          <span className="text-lg font-black text-blue-600 block leading-tight">{proj.stats.metric}</span>
                          <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">{proj.stats.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-8 flex-grow flex flex-col justify-between space-y-6 text-left">
                      <div className="space-y-4">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">CLIENT: {proj.client}</p>
                        <p className="text-slate-600 text-sm leading-relaxed">{proj.description}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {proj.techs.map((tech) => (
                            <span key={tech} className="px-2.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium">
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
          <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/20 max-w-5xl mx-auto p-10 text-center relative overflow-hidden border border-slate-200 shadow-xl rounded-3xl">
            <div className="absolute inset-0 bg-radial-glow pointer-events-none"></div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">Let's build your next system</h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-sm">
                Connect with our solutions architects to discuss your technical specifications, legacy migrations, or scaling requirements.
              </p>
              <div className="flex justify-center">
                <Button variant="primary" size="lg" className="cursor-pointer">
                  Schedule Strategy Strategy Call
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
