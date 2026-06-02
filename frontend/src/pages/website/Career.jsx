import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PageHero from '../../components/website/common/PageHero'

const jobs = [
  {
    title: 'Senior Frontend Architect',
    department: 'Engineering',
    location: 'Remote (US / India)',
    type: 'Full-time',
    salary: '$120,000 - $160,000',
    description: 'Lead the frontend engineering team in building highly responsive, performant, and interactive dashboards. Expertise in React, Vite, Tailwind CSS, and state management (Zustand) is required.'
  },
  {
    title: 'Lead DevOps & Cloud Engineer',
    department: 'Infrastructure',
    location: 'Hybrid (Delhi / NCR)',
    type: 'Full-time',
    salary: '$130,000 - $170,000',
    description: 'Design and deploy multi-region secure cloud clusters. Responsibilities include container orchestration (Kubernetes), infrastructure as code (Terraform), and compliance audits.'
  },
  {
    title: 'AI Solutions Engineer',
    department: 'AI Lab',
    location: 'Remote',
    type: 'Full-time',
    salary: '$110,000 - $150,000',
    description: 'Orchestrate intelligent workflows for enterprise clients. Work with LLM integrations, retrieval-augmented systems (RAG), vector storage optimization, and AI agents.'
  }
]

const benefits = [
  { title: 'Remote-First Culture', desc: 'Work from anywhere in the world. Flexible hours designed around asynchronous collaboration.' },
  { title: 'Top-Tier Compensation', desc: 'Highly competitive salary with equity packages, annual performance incentives, and tech bonuses.' },
  { title: 'Learning & Hardware Budget', desc: '$3,000 annual budget for courses, books, and conferences. We supply latest MacBook Pro setups.' }
]

const Career = () => {
  const [selectedJob, setSelectedJob] = useState(null)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', resume: '', coverLetter: '' })
  const [errors, setErrors] = useState({})

  const handleOpenForm = (job) => {
    setSelectedJob(job)
    setFormSubmitted(false)
    setFormData({ name: '', email: '', resume: '', coverLetter: '' })
    setErrors({})
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const tempErrors = {}
    if (!formData.name) tempErrors.name = 'Name is required'
    if (!formData.email || !formData.email.includes('@')) tempErrors.email = 'Valid email is required'
    if (!formData.resume || !formData.resume.startsWith('http')) tempErrors.resume = 'Valid portfolio or resume URL is required'

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors)
      return
    }

    setErrors({})
    setFormSubmitted(true)
    console.log('Submitting application for:', selectedJob.title, formData)
  }

  return (
    <>
      <Helmet>
        <title>Careers at AIM | Join Our Engineering Team</title>
        <meta name="description" content="Build the future of digital systems. We are hiring senior frontend engineers, cloud architects, and AI solutions specialists." />
      </Helmet>

      <div className="page-shell">
        <PageHero
          badge="Join The Team"
          title="Build the Future of"
          highlight="Technology"
          description="We are an engineering-centric consulting firm solving hard software, cloud infrastructure, and artificial intelligence problems. Join us and shape digital systems globally."
        />

        <section className="section-muted py-16 md:py-20">
        <div className="container-custom">
          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {benefits.map((b) => (
              <Card key={b.title} padding="md" className="bg-white border-slate-200 shadow-sm text-left">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{b.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{b.desc}</p>
              </Card>
            ))}
          </div>

          {/* Open Roles Section */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10">Open Engineering Roles</h2>
            <div className="space-y-6">
              {jobs.map((job) => (
                <Card key={job.title} padding="lg" className="bg-white border-slate-200 text-left hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs uppercase font-black text-blue-600 tracking-wider">
                          {job.department}
                        </span>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-600 font-bold">
                          {job.type}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">{job.title}</h3>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>📍 {job.location}</span>
                        <span>💰 {job.salary}</span>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => handleOpenForm(job)}
                      className="w-full md:w-auto font-bold cursor-pointer"
                    >
                      Apply Now
                    </Button>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mt-4 pt-4 border-t border-slate-200">
                    {job.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Slide-in Modal Application Form */}
        <AnimatePresence>
          {selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-sm">
              {/* Back drop click handler */}
              <div className="absolute inset-0" onClick={() => setSelectedJob(null)}></div>
              
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-lg h-full bg-white border-l border-slate-200 p-8 shadow-2xl overflow-y-auto flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Apply Position</span>
                      <h3 className="text-2xl font-black text-slate-900 text-left">{selectedJob.title}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {!formSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-5 text-left">
                      <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={errors.name}
                        placeholder="John Doe"
                        className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={errors.email}
                        placeholder="john@example.com"
                        className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <Input
                        label="Resume / Portfolio Link"
                        name="resume"
                        value={formData.resume}
                        onChange={handleInputChange}
                        error={errors.resume}
                        placeholder="https://linkedin.com/in/username or https://github.com/..."
                        className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-slate-700">Brief Intro / Cover Note</label>
                        <textarea
                          name="coverLetter"
                          value={formData.coverLetter}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Tell us about a technical challenge you solved recently..."
                          className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 px-4 py-3 placeholder-slate-400 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        ></textarea>
                      </div>
                      <Button type="submit" className="w-full py-3 text-sm font-bold cursor-pointer">
                        Submit Application
                      </Button>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-4 my-10"
                    >
                      <span className="text-4xl">🎉</span>
                      <h4 className="text-lg font-bold text-slate-900">Application Received!</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Thank you for applying to the {selectedJob.title} position. Our engineering team will review your profile and respond within 3 business days.
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() => setSelectedJob(null)}
                        className="w-full text-xs cursor-pointer"
                      >
                        Close Window
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        </section>
      </div>
    </>
  )
}

export default Career
