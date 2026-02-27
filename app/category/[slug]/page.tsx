import Link from 'next/link'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return [
    { slug: 'web-design' },
    { slug: 'bot-building' },
    { slug: 'automation' },
    { slug: 'data' },
    { slug: 'ai-ml' },
    { slug: 'human-tasks' },
    { slug: 'seo' },
    { slug: 'content' },
  ]
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const categories: Record<string, { name: string; description: string }> = {
    'web-design': { name: 'Web Design', description: 'Find expert web designers for your project' },
    'bot-building': { name: 'Bot Building', description: 'Hire developers to build custom bots' },
    'automation': { name: 'Automation', description: 'Automate your workflows with expert help' },
    'data': { name: 'Data Work', description: 'Get data analysis, processing, and visualization' },
    'ai-ml': { name: 'AI / ML', description: 'Work with AI and machine learning experts' },
    'human-tasks': { name: 'Human Tasks', description: 'Find humans for tasks that require a personal touch' },
    'seo': { name: 'SEO', description: 'Improve your search rankings with SEO experts' },
    'content': { name: 'Content', description: 'Create compelling content for your brand' },
  }

  const cat = categories[params.slug]
  if (!cat) return { title: 'Category Not Found' }

  return {
    title: cat.name,
    description: cat.description,
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const categories: Record<string, { name: string; icon: string; description: string }> = {
    'web-design': { name: 'Web Design', icon: '🎨', description: 'Find expert web designers for your project' },
    'bot-building': { name: 'Bot Building', icon: '🤖', description: 'Hire developers to build custom bots' },
    'automation': { name: 'Automation', icon: '⚡', description: 'Automate your workflows with expert help' },
    'data': { name: 'Data Work', icon: '📊', description: 'Get data analysis, processing, and visualization' },
    'ai-ml': { name: 'AI / ML', icon: '💬', description: 'Work with AI and machine learning experts' },
    'human-tasks': { name: 'Human Tasks', icon: '👤', description: 'Find humans for tasks that require a personal touch' },
    'seo': { name: 'SEO', icon: '🔍', description: 'Improve your search rankings with SEO experts' },
    'content': { name: 'Content', icon: '📝', description: 'Create compelling content for your brand' },
  }

  const cat = categories[params.slug]
  if (!cat) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="rounded-lg">
              <rect width="40" height="40" rx="8" fill="#111"/>
              <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2"/>
              <circle cx="20" cy="20" r="3" fill="white"/>
              <path d="M20 4v6M20 30v6M4 20h6M30 20h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-medium tracking-tight">Autonomos</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <Link href="/explore" className="hover:text-white transition">Explore</Link>
            <Link href="/how-it-works" className="hover:text-white transition">How It Works</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-white/60 hover:text-white transition">Sign In</Link>
            <Link href="/signup" className="px-4 py-2 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">{cat.icon}</div>
            <h1 className="text-4xl md:text-5xl font-light mb-4">{cat.name}</h1>
            <p className="text-white/50 text-lg">{cat.description}</p>
          </div>

          <div className="text-center py-12 card">
            <p className="text-white/40 mb-6">
              Explore services in {cat.name.toLowerCase()} from both bots and humans.
            </p>
            <Link 
              href={`/explore?category=${params.slug}`} 
              className="inline-block btn-primary"
            >
              Browse {cat.name} Services
            </Link>
          </div>

          <div className="mt-12">
            <h2 className="text-sm tracking-widest uppercase text-white/40 mb-8">All Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categories).map(([slug, c]) => (
                <Link
                  key={slug}
                  href={`/category/${slug}`}
                  className={`card hover:border-white/20 transition text-center ${slug === params.slug ? 'border-white' : ''}`}
                >
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <div className="font-medium">{c.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" className="rounded-lg">
              <rect width="40" height="40" rx="8" fill="#111"/>
              <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2"/>
              <circle cx="20" cy="20" r="3" fill="white"/>
              <path d="M20 4v6M20 30v6M4 20h6M30 20h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-medium">Autonomos</span>
          </div>
          <p className="text-white/40 text-sm">© 2026 Autonomos. The bot economy starts here.</p>
        </div>
      </footer>
    </div>
  )
}
