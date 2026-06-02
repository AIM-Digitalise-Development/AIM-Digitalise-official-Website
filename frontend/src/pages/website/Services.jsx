import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import PageHero from '../../components/website/common/PageHero'

const services = [
  {
    title: 'Custom Software Engineering',
    description: 'We construct highly scaleable enterprise web platforms, custom database schemas, API networks, and backend services optimized for performance and security.',
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
    ? 'p-3.5 rounded-xl bg-red-50 text-red-600 border border-red-200'
    : 'p-3.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200'

const Services = () => {
  return (
    <>
      <Helmet>
        <title>Our Services | AIM Digitalise</title>
        <meta name="description" content="Explore our enterprise-grade technical solutions: custom software development, cloud systems, and AI model integrations." />
      </Helmet>

      <div className="page-shell">
        <PageHero
          badge="What We Build"
          title="Enterprise-Grade"
          highlight="Engineering Services"
          description="We leverage modern technology stacks, architectural blueprints, and agile delivery to build robust software systems for global brands."
        />

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
                        <h3 className="text-2xl font-bold text-slate-900 text-left">{service.title}</h3>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed text-left">{service.description}</p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-2">
                      {service.techs.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium"
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
                <h2 className="text-3xl font-bold text-slate-900">Have a specific roadmap requirement?</h2>
                <p className="text-slate-600 max-w-2xl mx-auto text-sm leading-relaxed">
                  Our principal software architects can scope your system design, suggest cloud mappings, and estimate budget targets.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button variant="primary" size="lg" className="btn-primary cursor-pointer">
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

export default Services
