import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import useUIStore from '../../store/uiStore'

const services = [
  {
    title: 'Custom Software Engineering',
    description: 'We construct highly scalable enterprise web platforms, custom database schemas, API networks, and backend services optimized for performance and security.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    techs: ['React / Next.js', 'Laravel', 'Node.js', 'PostgreSQL', 'Golang'],
    accent: 'blue',
  },
  {
    title: 'Cloud & DevOps Solutions',
    description: 'Establish resilient, automated cloud infrastructure. We implement secure CI/CD pipelines, Dockerized deployments, microservice management, and network orchestration.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    techs: ['AWS / GCP', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
    accent: 'red',
  },
  {
    title: 'Custom AI & LLM Integration',
    description: 'Equip your apps with intelligence. We integrate LLMs, build custom AI agentic workflows, develop vector search embeddings, and orchestrate intelligent retrieval chains.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    techs: ['OpenAI API', 'LangChain', 'Pinecone / Vector DBs', 'Python', 'Agentic Workflows'],
    accent: 'blue',
  },
  {
    title: 'Product & System Architecture',
    description: 'Receive technical design documents, database entity diagrams, and performance roadmaps prior to code execution. Avoid costly re-build cycles.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    techs: ['System Design', 'ERD Schemas', 'SOC2 Roadmapping', 'Scalability Audits'],
    accent: 'red',
  },
]

const iconWrap = (accent) =>
  accent === 'red'
    ? 'p-3.5 rounded-xl bg-aim-purple/10 text-aim-purple border border-aim-purple/20'
    : 'p-3.5 rounded-xl bg-aim-gold/10 text-aim-gold border border-aim-gold/20'

const CustomDevelopment = () => {
  const openAppointmentModal = useUIStore((state) => state.openAppointmentModal)
  return (
    <>
      <Helmet>
        <title>AIM Digitalise | Custom Development Services</title>
        <meta name="description" content="Explore our enterprise-grade bespoke technical solutions: custom software development, cloud systems, and AI model integrations." />
      </Helmet>

      <div className="page-shell bg-aim-navy">
        {/* Compact Title Section */}
        <section className="relative pt-10 pb-8 border-b border-white/10 overflow-hidden">
          <div className="ambient-glows" aria-hidden />
          <div className="container-custom relative z-10 text-left">
            <div className="max-w-4xl space-y-3">
              <div className="badge-pill w-fit text-[10px] py-1 px-2.5 uppercase tracking-widest">
                <span className="badge-pill-dot" />
                Custom Software Engineering
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Bespoke Development <span className="text-gradient">Engineering Solutions</span>
              </h1>
              <p className="text-xs sm:text-sm text-aim-copy-muted leading-relaxed max-w-3xl">
                We leverage modern technology stacks, architectural blueprints, and agile delivery to build robust, tailormade software systems for global brands.
              </p>
            </div>
          </div>
        </section>

        <section className="section-muted py-16 md:py-20">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {services.map((service, i) => (
                <motion.div
                   key={service.title}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card hover padding="lg" className="h-full flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={iconWrap(service.accent)}>{service.icon}</div>
                        <h3 className="text-2xl font-bold text-aim-copy text-left">{service.title}</h3>
                      </div>
                      <p className="text-aim-copy-muted text-sm leading-relaxed text-left">{service.description}</p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-2">
                      {service.techs.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 rounded-lg bg-aim-navy-muted/10 border border-aim-border text-aim-copy-muted text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="cta-panel max-w-5xl mx-auto p-10 md:p-12">
              <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />
              <div className="relative z-10 space-y-6 pt-2">
                <h2 className="text-3xl font-bold text-aim-copy">Have a specific custom requirement?</h2>
                <p className="text-aim-copy-muted max-w-2xl mx-auto text-sm leading-relaxed">
                  Our principal software architects can scope your system design, suggest cloud mappings, and estimate budget targets.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    className="btn-primary cursor-pointer"
                    onClick={openAppointmentModal}
                  >
                    Request Free Scoping
                  </Button>
                  <Button variant="outline" size="lg" className="btn-outline-brand cursor-pointer">
                    View Our Process
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

export default CustomDevelopment
