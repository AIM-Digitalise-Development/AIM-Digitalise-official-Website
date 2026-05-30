import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const categories = ['All', 'Cloud & DevOps', 'AI Integrations', 'Web Platforms']

const projects = [
  {
    title: 'NeoBank Cloud Architecture Modernization',
    category: 'Cloud & DevOps',
    client: 'NeoBank Global',
    stats: { metric: '40% Saving', label: 'Infrastructure Costs' },
    description: 'Orchestrated the migration of a legacy high-transaction banking application to a multi-region AWS environment. Built with Terraform, utilizing Kubernetes for pod scaling and SOC2 compliance monitoring.',
    techs: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Prometheus'],
    gradient: 'from-blue-600/20 to-cyan-500/20'
  },
  {
    title: 'MedTech Intelligent Diagnostic Agent',
    category: 'AI Integrations',
    client: 'Apex Health Systems',
    stats: { metric: '98.5% Accuracy', label: 'OCR Classification' },
    description: 'Engineered an AI-powered pipeline utilizing LLMs and vector search databases to parse and classify complex patient history documents. Fully HIPAA compliant secure setup.',
    techs: ['OpenAI API', 'LangChain', 'Python', 'Pinecone', 'HIPAA AWS VPC'],
    gradient: 'from-purple-600/20 to-indigo-500/20'
  },
  {
    title: 'Real-Time Logistics Supply Chain Platform',
    category: 'Web Platforms',
    client: 'LogiLink Logistics',
    stats: { metric: '10K+ Assets', label: 'Tracked in Real-time' },
    description: 'Designed a dashboard to orchestrate, analyze, and track logistics assets. Developed using Vite/React and WebSockets, connecting with Laravel backend services.',
    techs: ['React', 'Node.js', 'WebSockets', 'Laravel', 'Tailwind CSS'],
    gradient: 'from-indigo-600/20 to-pink-500/20'
  },
  {
    title: 'LearnEd Certification Engine',
    category: 'Web Platforms',
    client: 'LearnEd Academy',
    stats: { metric: '100K+ Users', label: 'Monthly Active Learners' },
    description: 'Constructed a robust online bootcamp portal with real-time code execution containers and class enrollment gateways. Powered by Redis query caches.',
    techs: ['Next.js', 'Express', 'Redis', 'PostgreSQL', 'Docker Containers'],
    gradient: 'from-amber-600/20 to-orange-500/20'
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
        <title>Our Portfolio | AIM Innovations</title>
        <meta name="description" content="Browse our case studies: high-transaction cloud architectures, smart medical AI diagnostic agents, and high-performance web platforms." />
      </Helmet>

      <div className="relative overflow-hidden bg-slate-950 text-slate-100 min-h-screen py-20 bg-grid-pattern">
        {/* Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        </div>

        <div className="relative container-custom max-w-7xl mx-auto px-4 z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              OUR WORK & CASE STUDIES
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Architecting High-Impact <span className="text-gradient">Products</span>
            </h1>
            <p className="text-lg text-slate-400">
              Explore how we have engineered scalable solutions, optimized cloud architectures, and implemented AI integrations for enterprises and startups globally.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                  filter === cat
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
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
                  <Card hover padding="none" className="h-full overflow-hidden flex flex-col bg-slate-900/20 border-slate-800/80">
                    {/* Visual Card Top */}
                    <div className={`p-8 bg-gradient-to-tr ${proj.gradient} border-b border-slate-800/60 relative`}>
                      <span className="text-xs text-indigo-400 uppercase font-extrabold tracking-widest block mb-2">{proj.category}</span>
                      <h3 className="text-2xl font-black text-white leading-snug mb-4 text-left">{proj.title}</h3>
                      <div className="flex gap-4">
                        <div className="bg-slate-950/80 border border-slate-800 backdrop-blur rounded-xl p-3 max-w-[160px] text-left">
                          <span className="text-lg font-black text-indigo-400 block leading-tight">{proj.stats.metric}</span>
                          <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">{proj.stats.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-8 flex-grow flex flex-col justify-between space-y-6 text-left">
                      <div className="space-y-4">
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">CLIENT: {proj.client}</p>
                        <p className="text-slate-400 text-sm leading-relaxed">{proj.description}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {proj.techs.map((tech) => (
                            <span key={tech} className="px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 text-xs">
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
          <div className="glass-card max-w-5xl mx-auto p-10 text-center relative overflow-hidden border border-slate-800">
            <div className="absolute inset-0 bg-radial-glow pointer-events-none"></div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl font-bold text-white">Let's build your next system</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm">
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
      </div>
    </>
  )
}

export default Portfolio
