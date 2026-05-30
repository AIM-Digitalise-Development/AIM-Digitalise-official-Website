import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const services = [
  {
    title: 'Custom Software Engineering',
    description: 'We construct highly scaleable enterprise web platforms, custom database schemas, API networks, and backend services optimized for performance and security.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    techs: ['React / Next.js', 'Laravel', 'Node.js', 'PostgreSQL', 'Golang']
  },
  {
    title: 'Cloud & DevOps Solutions',
    description: 'Establish resilient, automated cloud infrastructure. We implement secure CI/CD pipelines, Dockerized deployments, microservice management, and network orchestration.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    techs: ['AWS / GCP', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions']
  },
  {
    title: 'Custom AI & LLM Integration',
    description: 'Equip your apps with intelligence. We integrate LLMs, build custom AI agentic workflows, develop vector search embeddings, and orchestrate intelligent retrieval chains.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    techs: ['OpenAI API', 'LangChain', 'Pinecone / Vector DBs', 'Python', 'Agentic Workflows']
  },
  {
    title: 'Product & System Architecture',
    description: 'Receive technical design documents, database entity diagrams, and performance roadmaps prior to code execution. Avoid costly re-build cycles.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    techs: ['System Design', 'ERD Schemas', 'SOC2 Roadmapping', 'Scalability Audits']
  }
]

const Services = () => {
  return (
    <>
      <Helmet>
        <title>Our Services | AIM Innovations</title>
        <meta name="description" content="Explore our enterprise-grade technical solutions: custom software development, cloud systems, and AI model integrations." />
      </Helmet>

      <div className="relative overflow-hidden bg-slate-950 text-slate-100 min-h-screen py-20 bg-grid-pattern">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
        </div>

        <div className="relative container-custom max-w-7xl mx-auto px-4 z-10">
          {/* Title */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              WHAT WE BUILD
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Enterprise-Grade <span className="text-gradient">Engineering Services</span>
            </h1>
            <p className="text-lg text-slate-400">
              We leverage modern technology stacks, architectural blueprints, and agile project delivery to build robust software systems for global brands.
            </p>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card hover padding="lg" className="h-full flex flex-col justify-between bg-slate-900/20 border-slate-800/80">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {service.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white text-left">{service.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed text-left">
                      {service.description}
                    </p>
                  </div>
                  <div className="mt-8">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {service.techs.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Interactive CTA Section */}
          <div className="glass-card max-w-5xl mx-auto p-10 text-center relative overflow-hidden border border-slate-800">
            <div className="absolute inset-0 bg-radial-glow pointer-events-none"></div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl font-bold text-white">Have a specific roadmap requirement?</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm">
                Our principal software architects can scope out your system design requirements, suggest cloud mappings, and estimate budget targets.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="primary" size="lg" className="cursor-pointer">
                  Request Free Scoping
                </Button>
                <Button variant="secondary" size="lg" className="cursor-pointer">
                  View Our Process
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Services
