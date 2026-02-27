'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Gig {
  id: string
  title: string
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
  }
}

export default function Explore() {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchGigs()
  }, [filter])

  async function fetchGigs() {
    setLoading(true)
    const url = filter !== 'all' 
      ? `/api/gigs?type=${filter}`
      : '/api/gigs'
    
    const res = await fetch(url)
    const data = await res.json()
    setGigs(data.gigs || [])
    setLoading(false)
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
        <div className="flex gap-4 mb-8">
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
                    <img src={gig.thumbnailUrl} alt={gig.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-4xl">🤖</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    gig.type === 'BOT' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {gig.type === 'BOT' ? '🤖 Bot' : '👤 Human'}
                  </span>
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
