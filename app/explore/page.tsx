'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Gig {
  id: string
  title: string
  description: string
  type: string
  thumbnailUrl: string
  pricing: any
  seller: {
    username: string
    rating: number
    totalSales: number
  }
  category: {
    name: string
    slug: string
  }
}

const categories = [
  { name: 'All Categories', slug: '' },
  { name: 'Web Design', slug: 'web-design' },
  { name: 'Bot Building', slug: 'bot-building' },
  { name: 'Automation', slug: 'automation' },
  { name: 'Data', slug: 'data' },
  { name: 'AI / ML', slug: 'ai-ml' },
  { name: 'Human Tasks', slug: 'human-tasks' },
  { name: 'SEO', slug: 'seo' },
  { name: 'Content', slug: 'content' },
]

export default function Explore() {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchGigs()
  }, [filter, category])

  async function fetchGigs() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('type', filter)
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    
    const url = `/api/gigs?${params.toString()}`
    const res = await fetch(url)
    const data = await res.json()
    setGigs(data.gigs || [])
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchGigs()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="rounded-lg">
              <rect width="40" height="40" rx="8" fill="#111"/>
              <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2"/>
              <circle cx="20" cy="20" r="3" fill="white"/>
              <path d="M20 4v6M20 30v6M4 20h6M30 20h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-medium">Autonomos</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/explore" className="text-white">Explore</Link>
            <Link href="/dashboard" className="text-white/60 hover:text-white">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-light mb-8">Explore Services</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white/5 border border-white/10 rounded-full text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white focus:outline-none focus:border-white/30 cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug} className="bg-black">
                {cat.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <div className="flex gap-2">
            {['all', 'bot', 'human'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm ${
                  filter === f
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white/60 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'bot' ? '🤖 Bots' : '👤 Humans'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-white/40">Loading...</div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            No services found. Be the first to list one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <Link
                key={gig.id}
                href={`/gig/${gig.id}`}
                className="card hover:border-white/20 transition"
              >
                <div className="aspect-video bg-white/5 rounded-lg mb-4 flex items-center justify-center">
                  {gig.thumbnailUrl ? (
                    <img src={gig.thumbnailUrl} alt={gig.title} className="w-full h-full object-cover rounded-lg" loading="lazy" decoding="async" />
                  ) : (
                    <span className="text-4xl">🤖</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2 py-1 rounded text-xs ${
                    gig.type === 'BOT' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {gig.type === 'BOT' ? '🤖 Bot' : '👤 Human'}
                  </span>
                  {gig.category?.name && (
                    <span className="px-2 py-1 rounded text-xs bg-white/10 text-white/60">
                      {gig.category.name}
                    </span>
                  )}
                </div>
                <h3 className="font-medium mb-2 line-clamp-2">{gig.title}</h3>
                <div className="flex items-center justify-between text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <span>⭐</span>
                    <span>{gig.seller?.rating || 0}</span>
                  </div>
                  <div className="text-blue-400">
                    From ${gig.pricing?.basic?.price || gig.pricing?.[0]?.price || '50'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
