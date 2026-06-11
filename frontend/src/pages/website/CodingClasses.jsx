import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import PageHero from '../../components/website/common/PageHero'

const classes = [
  {
    title: 'Full-Stack React & Node.js Mastery',
    category: 'Web Development',
    level: 'Intermediate',
    duration: '8 Weeks',
    price: '$1,199',
    description: 'Construct full-stack web platforms. Master React 19, custom custom hook design, Node.js controllers, REST APIs, and database migrations with PostgreSQL.',
    skills: ['React 19', 'Tailwind v4', 'NodeJS', 'Express', 'PostgreSQL'],
    starts: 'June 15, 2026'
  },
  {
    title: 'Cloud Orchestration & DevOps Systems',
    category: 'Cloud Engineering',
    level: 'Advanced',
    duration: '6 Weeks',
    price: '$999',
    description: 'Learn enterprise system reliability. Secure AWS configurations, setup Docker packaging, deploy multi-node Kubernetes clusters, and automate with Terraform.',
    skills: ['AWS IAM & VPC', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD Pipelines'],
    starts: 'July 01, 2026'
  },
  {
    title: 'Enterprise AI & Custom Agents',
    category: 'AI & Data Science',
    level: 'Advanced',
    duration: '4 Weeks',
    price: '$799',
    description: 'Integrate custom intelligence systems. Master prompt engineering, vector database embeddings, retrieval-augmented generation (RAG), and multi-agent systems.',
    skills: ['OpenAI SDK', 'LangChain', 'Pinecone', 'Python', 'Vector Embeddings'],
    starts: 'July 10, 2026'
  },
  {
    title: 'System Design & Architectural Patterns',
    category: 'Software Architecture',
    level: 'Intermediate',
    duration: '4 Weeks',
    price: '$599',
    description: 'Learn to design before you code. Master SOLID design principles, Entity Relationship Diagrams (ERDs), API design patterns, microservices architecture, and unit testing.',
    skills: ['System Design', 'UML / ERDs', 'API Design', 'Design Patterns', 'Jest / Testing'],
    starts: 'June 20, 2026'
  }
]

const CodingClasses = () => {
  return (
    <>
      <Helmet>
        <title>AIM Digitalise | Professional Coding Classes</title>
        <meta name="description" content="Upskill your team or accelerate your career with professional development bootcamps in React, Cloud DevOps, AI Systems, and Software Architecture." />
      </Helmet>

      <div className="page-shell">
        <PageHero
          badge="Academy & Training"
          title="Cohort-Based"
          highlight="Coding Classes"
          description="Accelerate your engineering skills with instructor-led, hands-on masterclasses. Real-world systems, production-ready curriculum, and active project feedback."
        />

        <section className="section-muted py-16 md:py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 mb-24">
            {classes.map((cls, i) => (
              <motion.div
                key={cls.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card hover padding="lg" className="h-full flex flex-col justify-between">
                  <div className="space-y-6 text-left">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-aim-gold text-xs font-black uppercase tracking-wider block mb-1">
                          {cls.category}
                        </span>
                        <h3 className="text-2xl font-bold text-white leading-tight">
                          {cls.title}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-aim-gold/10 border border-aim-gold/25 text-aim-gold text-xs font-semibold">
                        {cls.level}
                      </span>
                    </div>

                    <div className="flex gap-6 text-xs text-aim-copy-muted border-b border-aim-border pb-4">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-aim-copy-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{cls.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-aim-copy-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Starts {cls.starts}</span>
                      </div>
                    </div>

                    <p className="text-aim-copy-muted text-sm leading-relaxed">
                      {cls.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {cls.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded bg-white/5 border border-aim-border text-aim-copy-muted text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-aim-border flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-aim-copy-muted block uppercase font-semibold">TUTION</span>
                      <span className="text-2xl font-black text-white">{cls.price}</span>
                    </div>
                    <Button variant="primary" className="cursor-pointer">
                      Enroll / Apply
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="cta-panel max-w-5xl mx-auto p-10 md:p-12 mt-8">
            <div className="relative z-10 space-y-6 pt-2">
              <h2 className="text-3xl font-bold text-white">Corporate Upskilling & Training</h2>
              <p className="text-aim-copy-muted max-w-2xl mx-auto text-sm leading-relaxed">
                Need to train your existing software team on React 19, AWS deployments, or AI APIs? We offer customized corporate training structures designed to align your engineering speeds.
              </p>
              <div className="flex justify-center">
                <Button variant="outline" size="lg" className="btn-outline-brand cursor-pointer">
                  Request Corporate Brochure
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

export default CodingClasses
