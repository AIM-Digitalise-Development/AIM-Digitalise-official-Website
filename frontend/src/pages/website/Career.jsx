import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const jobs = [
  {
    id: 'it-sales-executive',
    title: 'IT Sales Executive',
    department: 'Sales & Marketing Department',
    education: 'Any Graduation',
    experience: '0-3 yrs',
    openings: 4,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    description: 'We are seeking a proactive IT Sales Executive to identify business opportunities, pitch our software products/services, and build strong client relationships.'
  },
  {
    id: 'presales-executive',
    title: 'Presales Executive',
    department: 'Sales & Marketing Department',
    education: 'Any Graduation',
    experience: '0-3 yrs',
    openings: 2,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    description: 'Looking for a Presales Executive to support the sales team with technical presentations, requirement gathering, and proposing customized digital solutions.'
  },
  {
    id: 'backend-developer',
    title: 'Backend Development (PHP/Node JS)',
    department: 'Development Department',
    education: 'BE/Btech, C, C++ certificate',
    experience: '2-3 yrs',
    openings: 1,
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
    description: 'Join our development team to design, build, and maintain robust API systems and server-side logic using PHP and Node.js.'
  },
  {
    id: 'mobile-app-developer',
    title: 'Mobile Application Developer',
    department: 'Development Department',
    education: 'BE/Btech',
    experience: '3-5 yrs',
    openings: 0,
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80',
    description: 'Responsible for building high-quality native and cross-platform mobile applications. Experience with React Native or Flutter is a plus.'
  },
  {
    id: 'digital-marketing-executive',
    title: 'Digital Marketing Executive',
    department: 'Development Department',
    education: 'Diploma on Digital Marketing / MBA preference',
    experience: '1-3 yrs',
    openings: 0,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    description: 'Drive growth and brand awareness through SEO, SEM, content strategy, and social media campaigns to elevate our digital presence.'
  },
  {
    id: 'graphics-designer',
    title: 'Graphics Designer',
    department: 'Development Department',
    education: 'Diploma on Graphics Design',
    experience: '0-3 yrs',
    openings: 1,
    image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
    description: 'Create engaging visual materials, user interface designs, and branding assets. Proficiency in Adobe Suite or Figma is required.'
  }
]

const Career = () => {
  const [selectedJob, setSelectedJob] = useState(null)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', resume: '', coverLetter: '' })
  const [resumeType, setResumeType] = useState('file') // 'file' or 'link'
  const [resumeFile, setResumeFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [filterDept, setFilterDept] = useState('All')

  const handleOpenForm = (job) => {
    setSelectedJob(job)
    setFormSubmitted(false)
    setFormData({ name: '', email: '', resume: '', coverLetter: '' })
    setResumeType('file')
    setResumeFile(null)
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
    
    if (resumeType === 'link') {
      if (!formData.resume) {
        tempErrors.resume = 'Portfolio or resume URL is required'
      } else if (!formData.resume.startsWith('http://') && !formData.resume.startsWith('https://')) {
        tempErrors.resume = 'URL must start with http:// or https://'
      }
    } else {
      if (!resumeFile) {
        tempErrors.resume = 'Please upload your resume file'
      }
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors)
      return
    }

    setErrors({})
    setFormSubmitted(true)
    console.log('Submitting application for:', selectedJob.title, {
      ...formData,
      resumeType,
      resumeFile: resumeType === 'file' ? resumeFile : null
    })
  }

  const departments = ['All', 'Development Department', 'Sales & Marketing Department']
  const filteredJobs = jobs.filter(job => filterDept === 'All' || job.department === filterDept)

  return (
    <>
      <Helmet>
        <title>AIM Digitalise | Careers</title>
        <meta name="description" content="Build the future of digital systems. We are hiring sales executives, presales specialists, backend developers, mobile developers, digital marketers, and designers." />
      </Helmet>

      <div className="page-shell bg-aim-navy">
        {/* Compact Title Section like Portfolio */}
        <section className="relative pt-10 pb-8 border-b border-white/10 overflow-hidden">
          <div className="ambient-glows" aria-hidden />
          <div className="container-custom relative z-10 text-left">
            <div className="max-w-4xl space-y-3">
              <div className="badge-pill w-fit text-[10px] py-1 px-2.5 uppercase tracking-widest">
                <span className="badge-pill-dot" />
                Careers
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Build the Future with <span className="text-gradient">AIM Digitalise</span>
              </h1>
              <p className="text-xs sm:text-sm text-aim-copy-muted leading-relaxed max-w-3xl">
                At AIM Digitalise, we revere and recognize people who go beyond their call of duty. We always find the quality resources who can take this opportunity to perform according to the company’s demand.
              </p>
            </div>
          </div>
        </section>

        <section className="section-muted py-16 md:py-24">
          <div className="container-custom">
            
            {/* Filter Buttons */}
            <div className="flex justify-center gap-3 mb-16 flex-wrap">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setFilterDept(dept)}
                  className={`tab-filter-btn ${filterDept === dept ? 'active' : ''}`}
                >
                  {dept === 'All' ? 'All Departments' : dept}
                </button>
              ))}
            </div>

            {/* Open Roles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {filteredJobs.map((job) => (
                <Card key={job.title} padding="none" className="flex flex-col h-full overflow-hidden group rounded-3xl border border-white/5 hover:border-aim-gold/20 transition-all duration-300">
                  {/* Job Image Container */}
                  <div className="relative p-4 pb-0 overflow-hidden">
                    <div className="relative h-48 sm:h-52 overflow-hidden rounded-2xl">
                      <img 
                        src={job.image} 
                        alt={job.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    {/* Department Tag */}
                    <span className="absolute top-8 left-8 text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded bg-aim-navy/90 border border-white/10 text-aim-gold backdrop-blur-sm">
                      {job.department.replace(' Department', '')}
                    </span>
                  </div>

                  {/* Content Box */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-aim-gold transition-colors duration-250 leading-tight">
                        {job.title}
                      </h3>

                      {/* Detail Metrics */}
                      <div className="space-y-2.5 text-xs sm:text-sm border-t border-white/5 pt-4">
                        <div className="flex items-center gap-2.5 text-aim-copy-muted">
                          <svg className="w-4 h-4 text-aim-gold/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-4-9 4 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          </svg>
                          <span className="truncate">
                            <strong className="text-white font-medium">Education:</strong> {job.education}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-aim-copy-muted">
                          <svg className="w-4 h-4 text-aim-gold/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>
                            <strong className="text-white font-medium">Experience:</strong> {job.experience}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-aim-copy-muted">
                          <svg className="w-4 h-4 text-aim-gold/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>
                            <strong className="text-white font-medium">Openings:</strong>{' '}
                            {job.openings > 0 ? (
                              <span className="text-emerald-400 font-bold">{job.openings} Positions</span>
                            ) : (
                              <span className="text-red-400 font-bold">Closed</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <p className="text-aim-copy-muted text-xs leading-relaxed border-t border-white/5 pt-4">
                        {job.description}
                      </p>
                    </div>

                    {/* Apply Button */}
                    <Button
                      variant={job.openings > 0 ? 'primary' : 'secondary'}
                      onClick={() => job.openings > 0 && handleOpenForm(job)}
                      disabled={job.openings === 0}
                      className="w-full font-bold cursor-pointer transition-all duration-300 mt-4"
                    >
                      {job.openings > 0 ? 'Apply Now' : 'Positions Filled'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-20 bg-aim-navy-card/50 border border-white/5 rounded-3xl">
                <span className="text-4xl">🔍</span>
                <h3 className="text-xl font-bold text-white mt-4">No Open Positions</h3>
                <p className="text-aim-copy-muted text-sm mt-2">No matching positions found in this department. Check back later!</p>
              </div>
            )}

          </div>

          {/* Slide-in Modal Application Form */}
          <AnimatePresence>
            {selectedJob && (
              <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-sm">
                <div className="absolute inset-0" onClick={() => setSelectedJob(null)}></div>
                
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="relative w-full max-w-lg h-full bg-slate-900 border-l border-white/10 p-8 shadow-2xl overflow-y-auto flex flex-col justify-between z-10 text-left"
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-aim-gold">Apply Position</span>
                        <h3 className="text-2xl font-black text-white">{selectedJob.title}</h3>
                      </div>
                      <button
                        onClick={() => setSelectedJob(null)}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-aim-copy-muted hover:text-white transition cursor-pointer"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {!formSubmitted ? (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                          label="Full Name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          error={errors.name}
                          placeholder=""
                          className="bg-aim-navy-light/80 border-white/15 text-white"
                        />
                        <Input
                          label="Email Address"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          error={errors.email}
                          placeholder=""
                          className="bg-aim-navy-light/80 border-white/15 text-white"
                        />
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-aim-copy">Resume / Portfolio</label>
                          <div className="flex gap-2 p-1 rounded-xl bg-slate-950/40 border border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                setResumeType('file')
                                setErrors({ ...errors, resume: null })
                              }}
                              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                resumeType === 'file'
                                  ? 'bg-aim-gold text-aim-navy shadow-md font-extrabold'
                                  : 'text-aim-copy-muted hover:text-white hover:bg-white/5 font-semibold'
                              }`}
                            >
                              Upload File
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setResumeType('link')
                                setErrors({ ...errors, resume: null })
                              }}
                              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                resumeType === 'link'
                                  ? 'bg-aim-gold text-aim-navy shadow-md font-extrabold'
                                  : 'text-aim-copy-muted hover:text-white hover:bg-white/5 font-semibold'
                              }`}
                            >
                              Provide URL Link
                            </button>
                          </div>

                          {resumeType === 'file' ? (
                            <div className="space-y-1.5">
                              <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                                errors.resume
                                  ? 'border-red-400 bg-red-950/5'
                                  : resumeFile
                                    ? 'border-aim-gold bg-aim-navy-light/40'
                                    : 'border-white/15 bg-aim-navy-light/80 hover:border-aim-gold/30 hover:bg-aim-navy-light/90'
                              }`}>
                                {resumeFile ? (
                                  <div className="flex flex-col items-center space-y-2">
                                    <svg className="w-10 h-10 text-aim-gold animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div className="text-sm font-semibold text-white truncate max-w-xs">{resumeFile.name}</div>
                                    <div className="text-xs text-aim-copy-muted">{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                                    <button
                                      type="button"
                                      onClick={() => setResumeFile(null)}
                                      className="mt-2 text-xs font-bold text-red-400 hover:text-red-300 underline cursor-pointer"
                                    >
                                      Remove File
                                    </button>
                                  </div>
                                ) : (
                                  <label className="cursor-pointer block h-full w-full">
                                    <input
                                      type="file"
                                      name="resumeFile"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          const file = e.target.files[0]
                                          if (file.size > 5 * 1024 * 1024) {
                                            setErrors({ ...errors, resume: 'File size must be under 5MB' })
                                          } else {
                                            setResumeFile(file)
                                            setErrors({ ...errors, resume: null })
                                          }
                                        }
                                      }}
                                      className="hidden"
                                    />
                                    <div className="flex flex-col items-center space-y-2 py-2">
                                      <svg className="w-8 h-8 text-aim-copy-muted hover:text-aim-gold transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                      </svg>
                                      <div className="text-xs font-semibold text-white">Click or drag to upload document</div>
                                      <div className="text-[10px] text-aim-copy-muted">PDF, Word, or image up to 5MB</div>
                                    </div>
                                  </label>
                                )}
                              </div>
                              {errors.resume && (
                                <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.resume}</p>
                              )}
                            </div>
                          ) : (
                            <Input
                              name="resume"
                              value={formData.resume}
                              onChange={handleInputChange}
                              error={errors.resume}
                              placeholder="e.g. https://linkedin.com/in/username or Google Drive link"
                              className="bg-aim-navy-light/80 border-white/15 text-white"
                            />
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-aim-copy">Brief Intro / Cover Note</label>
                          <textarea
                            name="coverLetter"
                            value={formData.coverLetter}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Tell us about your background and why you want to join AIM Digitalise..."
                            className="w-full bg-aim-navy-light/80 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-aim-gold focus:ring-1 focus:ring-aim-gold text-sm transition resize-none"
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
                        className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-center space-y-4 my-10"
                      >
                        <span className="text-4xl">🎉</span>
                        <h4 className="text-lg font-bold text-white">Application Received!</h4>
                        <p className="text-xs text-aim-copy-muted leading-relaxed">
                          Thank you for applying to the {selectedJob.title} position. Our HR and technical teams will review your details and respond back to you within 3 business days.
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
