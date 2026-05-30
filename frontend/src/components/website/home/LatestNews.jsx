import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Card from '../../ui/Card'
import Button from '../../ui/Button'

const mockPosts = [
  {
    id: 1,
    title: 'Designing for Scale: React 19 and Vite 6 in Enterprise Systems',
    excerpt: 'Explore how React 19’s compiler and Vite 6’s new hot module replacement API optimize loading times for enterprise platforms.',
    date: '2026-05-18',
    category: 'Software Engineering',
    readTime: '6 min read'
  },
  {
    id: 2,
    title: 'Zero-Trust Architecture: Securing Modern Hybrid Clouds',
    excerpt: 'A comprehensive engineering guide to implementing Zero-Trust network boundaries across AWS VPCs, GCP folders, and legacy data centers.',
    date: '2026-05-12',
    category: 'Cloud & DevOps',
    readTime: '9 min read'
  },
  {
    id: 3,
    title: 'The Developer’s Guide to Integrating LLMs in Legacy Codebases',
    excerpt: 'Practical strategies for integrating large language models, managing vector embedding caches, and validating agentic pipelines safety.',
    date: '2026-05-05',
    category: 'Artificial Intelligence',
    readTime: '11 min read'
  }
]

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const LatestNews = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(mockPosts)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-slate-900/30 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-slate-850 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-slate-850 rounded w-3/4 mb-4"></div>
                <div className="h-16 bg-slate-850 rounded mb-4"></div>
                <div className="h-10 bg-slate-850 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-slate-900/30 border-t border-slate-900 relative overflow-hidden">
      {/* Background glow bottom left */}
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Publications
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Tech Insights & Publications
          </h2>
          <p className="text-lg text-slate-400">
            Read about deep technical deep dives, cloud architectural guides, and software engineering best practices.
          </p>
        </div>

        {/* Blog Cards Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
        >
          {posts.map((post) => (
            <motion.div key={post.id} variants={itemVariants} className="flex">
              <Card hover padding="lg" className="flex flex-col justify-between w-full bg-slate-900/20 border-slate-800/80">
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800/60">
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer">
                    <span>Read Article</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default LatestNews