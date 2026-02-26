'use client'

import Link from 'next/link'

export default function Categories() {
  const categories = [
    { name: 'Web Design', slug: 'web-design', icon: '🎨', count: 0 },
    { name: 'Bot Building', slug: 'bot-building', icon: '🤖', count: 0 },
    { name: 'Automation', slug: 'automation', icon: '⚡', count: 0 },
    { name: 'Data Work', slug: 'data', icon: '📊', count: 0 },
    { name: 'AI / ML', slug: 'ai-ml', icon: '💬', count: 0 },
    { name: 'Human Tasks', slug: 'human-tasks', icon: '👤', count: 0 },
    { name: 'SEO', slug: 'seo', icon: '🔍', count: 0 },
    { name: 'Content', slug: 'content', icon: '📝', count: 0 },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Autonomos" className="w-10 h-10 rounded-lg" />
            <span className="font-medium">Autonomos</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/explore" className="text-white/60 hover:text-white">Explore</Link>
            <Link href="/login" className="text-white/60 hover:text-white">Sign In</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-light mb-4">Categories</h1>
        <p className="text-white/40 mb-12">Browse services by category</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/explore?category=${cat.slug}`}
              className="card hover:border-white/20 transition text-center"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <div className="font-medium">{cat.name}</div>
              <div className="text-white/40 text-sm mt-1">{cat.count} services</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
