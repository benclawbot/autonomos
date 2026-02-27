'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Seller {
  id: string
  username: string
  fullName: string | null
  avatarUrl: string | null
  rating: number
  totalSales: number
  bio: string | null
  createdAt: string
}

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  buyer: {
    username: string
    avatarUrl: string | null
  }
}

interface Gig {
  id: string
  title: string
  description: string
  type: string
  thumbnailUrl: string | null
  pricing: {
    basic?: { price: number; deliveryDays: number; features: string[] }
    standard?: { price: number; deliveryDays: number; features: string[] }
    premium?: { price: number; deliveryDays: number; features: string[] }
  }
  seller: Seller
  category: { name: string; slug: string }
  reviews: Review[]
  _count: { reviews: number }
}

export default function GigDetail() {
  const params = useParams()
  const [gig, setGig] = useState<Gig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('basic')

  useEffect(() => {
    async function fetchGig() {
      try {
        const res = await fetch(`/api/gigs/${params.id}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('Gig not found')
          } else {
            setError('Failed to load gig')
          }
          return
        }
        const data = await res.json()
        setGig(data.gig)
      } catch (err) {
        setError('Failed to load gig')
      } finally {
        setLoading(false)
      }
    }
    if (params.id) {
      fetchGig()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-white/40">Loading...</div>
      </div>
    )
  }

  if (error || !gig) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-light mb-4">{error || 'Gig not found'}</h1>
        <Link href="/explore" className="text-blue-400 hover:underline">
          ← Back to Explore
        </Link>
      </div>
    )
  }

  const packages = ['basic', 'standard', 'premium'] as const
  const currentPackage = gig.pricing[selectedPackage]

  return (
    <>
      {/* SEO Meta Tags */}
      <title>{gig.title} | Autonomos</title>
      <meta name="description" content={gig.description.slice(0, 160)} />
      <meta property="og:title" content={gig.title} />
      <meta property="og:description" content={gig.description.slice(0, 160)} />
      <meta property="og:type" content="website" />
      {gig.thumbnailUrl && <meta property="og:image" content={gig.thumbnailUrl} />}

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

        <div className="pt-24 px-6 max-w-6xl mx-auto pb-20">
          {/* Back Link */}
          <Link href="/explore" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Explore
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    gig.type === 'BOT' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {gig.type === 'BOT' ? '🤖 Bot' : '👤 Human'}
                  </span>
                  <span className="text-white/40 text-sm">{gig.category.name}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-light mb-4">{gig.title}</h1>
                
                {/* Thumbnail */}
                {gig.thumbnailUrl && (
                  <div className="aspect-video bg-white/5 rounded-lg overflow-hidden mb-6">
                    <img src={gig.thumbnailUrl} alt={gig.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-medium mb-4">About This Service</h2>
                <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{gig.description}</p>
              </div>

              {/* Seller Info */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-medium mb-4">About the Seller</h2>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl overflow-hidden">
                    {gig.seller.avatarUrl ? (
                      <img src={gig.seller.avatarUrl} alt={gig.seller.username} className="w-full h-full object-cover" />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{gig.seller.fullName || gig.seller.username}</h3>
                    <p className="text-white/60 text-sm">@{gig.seller.username}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <span>⭐</span>
                        <span>{gig.seller.rating?.toFixed(1) || '0.0'}</span>
                      </span>
                      <span className="text-white/40">{gig.seller.totalSales || 0} sales</span>
                    </div>
                    {gig.seller.bio && (
                      <p className="text-white/60 text-sm mt-3">{gig.seller.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium">Reviews</h2>
                  <span className="text-white/60 text-sm">({gig._count.reviews} reviews)</span>
                </div>
                
                {gig.reviews && gig.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {gig.reviews.map((review) => (
                      <div key={review.id} className="border-b border-white/5 pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                            {review.buyer.avatarUrl ? (
                              <img src={review.buyer.avatarUrl} alt={review.buyer.username} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              review.buyer.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{review.buyer.username}</span>
                              <span className="flex items-center text-xs text-white/60">
                                {'⭐'.repeat(review.rating)}
                              </span>
                            </div>
                            <p className="text-white/80 text-sm mt-1">{review.comment}</p>
                            <p className="text-white/40 text-xs mt-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40">No reviews yet</p>
                )}
              </div>
            </div>

            {/* Sidebar - Pricing */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-medium mb-4">Choose a Package</h2>
                
                {/* Package Tabs */}
                <div className="flex gap-2 mb-6">
                  {packages.map((pkg) => (
                    <button
                      key={pkg}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm capitalize transition ${
                        selectedPackage === pkg
                          ? 'bg-white text-black'
                          : 'bg-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      {pkg}
                    </button>
                  ))}
                </div>

                {/* Package Details */}
                {currentPackage ? (
                  <div className="mb-6">
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-3xl font-light">${currentPackage.price}</span>
                      <span className="text-white/40 text-sm">
                        {currentPackage.deliveryDays} day{currentPackage.deliveryDays !== 1 ? 's' : ''} delivery
                      </span>
                    </div>
                    
                    {currentPackage.features && currentPackage.features.length > 0 && (
                      <ul className="space-y-2 mb-6">
                        {currentPackage.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-white/80">
                            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="mb-6 text-center text-white/40 py-8">
                    No pricing available for this package
                  </div>
                )}

                {/* Order Button */}
                <button className="w-full py-4 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Order Now
                </button>

                <p className="text-center text-white/40 text-xs mt-4">
                  Secure payment via Autonomos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
