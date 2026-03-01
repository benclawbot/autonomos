'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Gig {
  id: string
  title: string
  description: string
  type: string
  status: string
  thumbnailUrl: string | null
  totalOrders: number
  createdAt: string
  category?: {
    name: string
    slug: string
  }
  pricing?: {
    basic?: { price: number }
    standard?: { price: number }
    premium?: { price: number }
  }
}

export default function MyGigs() {
  const router = useRouter()
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGigs()
  }, [])

  async function fetchGigs() {
    try {
      // Get token from localStorage
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token')
      }

      if (!token) {
        setError('Please log in to view your gigs')
        setLoading(false)
        return
      }

      const res = await fetch('/api/gigs/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        setGigs(data.gigs || [])
      } else if (res.status === 401) {
        setError('Please log in to view your gigs')
      } else {
        setError('Failed to load gigs')
      }
    } catch (err) {
      console.error('Error fetching gigs:', err)
      setError('Failed to load gigs')
    }
    setLoading(false)
  }

  async function handleDelete(gigId: string) {
    if (!confirm('Are you sure you want to delete this gig?')) return

    try {
      let token = localStorage.getItem('token')
      const res = await fetch(`/api/gigs/${gigId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        setGigs(gigs.filter(g => g.id !== gigId))
      } else {
        alert('Failed to delete gig')
      }
    } catch (err) {
      console.error('Error deleting gig:', err)
      alert('Failed to delete gig')
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white/40">Loading gigs...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light mb-2">My Gigs</h1>
          <p className="text-white/40">Manage your service listings</p>
        </div>
        <Link href="/dashboard/gigs/new" className="btn-primary">
          + Create New Gig
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Gigs List */}
      {gigs.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl mb-2">No gigs yet</h3>
          <p className="text-white/40 mb-6">Create your first gig to start earning</p>
          <Link href="/dashboard/gigs/new" className="btn-primary inline-block">
            Create Your First Gig
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {gigs.map((gig) => (
            <div key={gig.id} className="card flex gap-4">
              {/* Thumbnail */}
              <div className="w-32 h-24 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                {gig.thumbnailUrl ? (
                  <img src={gig.thumbnailUrl} alt={gig.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium mb-1 truncate">{gig.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-white/40">
                      {gig.category && <span>{gig.category.name}</span>}
                      <span>•</span>
                      <span className="capitalize">{gig.type.toLowerCase()}</span>
                      <span>•</span>
                      <span>{gig.totalOrders} orders</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      gig.status === 'ACTIVE' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {gig.status}
                    </span>
                  </div>
                </div>

                {/* Pricing preview */}
                <div className="flex gap-4 mt-3">
                  {gig.pricing?.basic && (
                    <span className="text-sm text-white/60">Basic: ${gig.pricing.basic.price}</span>
                  )}
                  {gig.pricing?.standard && (
                    <span className="text-sm text-white/60">Standard: ${gig.pricing.standard.price}</span>
                  )}
                  {gig.pricing?.premium && (
                    <span className="text-sm text-white/60">Premium: ${gig.pricing.premium.price}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link 
                  href={`/dashboard/gigs/${gig.id}`}
                  className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition"
                  title="Edit"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </Link>
                <Link 
                  href={`/gig/${gig.id}`}
                  target="_blank"
                  className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition"
                  title="View"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </Link>
                <button 
                  onClick={() => handleDelete(gig.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-white/60 hover:text-red-400 transition"
                  title="Delete"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
