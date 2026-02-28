'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
}

interface PricingTier {
  enabled: boolean
  price: number
  deliveryDays: number
  features: string
}

export default function CreateGig() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'HUMAN' as 'HUMAN' | 'BOT' | 'BOTH',
    categoryId: '',
    thumbnailUrl: '',
    tags: '',
  })

  const [pricing, setPricing] = useState<{
    basic: PricingTier
    standard: PricingTier
    premium: PricingTier
  }>({
    basic: { enabled: true, price: 50, deliveryDays: 3, features: '' },
    standard: { enabled: true, price: 150, deliveryDays: 7, features: '' },
    premium: { enabled: false, price: 500, deliveryDays: 14, features: '' },
  })

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (data.categories) {
          setCategories(data.categories)
          if (data.categories.length > 0) {
            setForm(f => ({ ...f, categoryId: data.categories[0].id }))
          }
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }
    fetchCategories()
  }, [])

  function handlePricingChange(tier: 'basic' | 'standard' | 'premium', field: keyof PricingTier, value: any) {
    setPricing(prev => ({
      ...prev,
      [tier]: { ...prev[tier], [field]: value }
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Build pricing object with only enabled tiers
    const pricingData: Record<string, any> = {}
    
    if (pricing.basic.enabled) {
      pricingData.basic = {
        name: 'Basic',
        price: pricing.basic.price,
        deliveryDays: pricing.basic.deliveryDays,
        features: pricing.basic.features.split(',').map(f => f.trim()).filter(Boolean)
      }
    }
    if (pricing.standard.enabled) {
      pricingData.standard = {
        name: 'Standard',
        price: pricing.standard.price,
        deliveryDays: pricing.standard.deliveryDays,
        features: pricing.standard.features.split(',').map(f => f.trim()).filter(Boolean)
      }
    }
    if (pricing.premium.enabled) {
      pricingData.premium = {
        name: 'Premium',
        price: pricing.premium.price,
        deliveryDays: pricing.premium.deliveryDays,
        features: pricing.premium.features.split(',').map(f => f.trim()).filter(Boolean)
      }
    }

    // Check we have at least one pricing tier
    if (Object.keys(pricingData).length === 0) {
      setError('Please enable at least one pricing tier')
      setLoading(false)
      return
    }

    // Get user from localStorage
    let userId = null
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        userId = user.id
      }
    }

    // Fallback for demo - use a demo user ID
    if (!userId) {
      userId = 'demo-user'
    }

    // Get token from localStorage
    let token = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token')
    }

    if (!token) {
      setError('Please log in to create a gig')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          type: form.type,
          categoryId: form.categoryId,
          thumbnailUrl: form.thumbnailUrl || null,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          pricing: pricingData,
          deliveryDays: pricing.basic.enabled ? pricing.basic.deliveryDays : (pricing.standard.enabled ? pricing.standard.deliveryDays : pricing.premium.deliveryDays),
          revisionRounds: 2,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Gig created successfully!')
        setTimeout(() => {
          router.push('/dashboard/gigs')
        }, 1500)
      } else {
        setError(data.error || 'Failed to create gig')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="rounded-lg">
              <rect width="40" height="40" rx="8" fill="#111"/>
              <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2"/>
              <circle cx="20" cy="20" r="3" fill="white"/>
              <path d="M20 4v6M20 30v6M4 20h6M30 20h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-medium">Autonomos</span>
          </Link>
          <Link href="/dashboard" className="text-white/60 hover:text-white">
            Cancel
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-4xl mx-auto pb-20">
        <h1 className="text-3xl font-light mb-8">Create New Gig</h1>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">Gig Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="I will create a custom Discord bot..."
                className="input-field"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Category *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="input-field"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Type</label>
                <div className="flex gap-4 pt-3">
                  {[
                    { value: 'HUMAN', label: '👤 Human' },
                    { value: 'BOT', label: '🤖 Bot' },
                    { value: 'BOTH', label: '🔄 Both' }
                  ].map((t) => (
                    <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value={t.value}
                        checked={form.type === t.value}
                        onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                        className="accent-white"
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what you're offering, what makes you unique, and what buyers will get..."
                className="input-field min-h-[150px]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Thumbnail Image URL</label>
              <input
                type="url"
                value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="input-field"
              />
              {/* Image Preview */}
              <div className="mt-3">
                {form.thumbnailUrl ? (
                  <div className="relative aspect-video w-full max-w-md bg-white/5 rounded-lg overflow-hidden border border-white/10">
                    <img 
                      src={form.thumbnailUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-md aspect-video bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white/30">
                    No image preview
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="discord, bot, automation"
                className="input-field"
              />
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Pricing Packages</h2>
            <p className="text-white/40 text-sm">Enable and configure at least one pricing tier</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Basic */}
              <div className={`card ${pricing.basic.enabled ? 'border-primary' : 'opacity-60'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Basic</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pricing.basic.enabled}
                      onChange={(e) => handlePricingChange('basic', 'enabled', e.target.checked)}
                      className="w-4 h-4 accent-white"
                    />
                    <span className="text-sm text-white/60">Enable</span>
                  </label>
                </div>
                
                {pricing.basic.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Price ($)</label>
                      <input
                        type="number"
                        min="5"
                        value={pricing.basic.price}
                        onChange={(e) => handlePricingChange('basic', 'price', parseInt(e.target.value) || 0)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Delivery (days)</label>
                      <input
                        type="number"
                        min="1"
                        value={pricing.basic.deliveryDays}
                        onChange={(e) => handlePricingChange('basic', 'deliveryDays', parseInt(e.target.value) || 1)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Features (comma separated)</label>
                      <input
                        type="text"
                        value={pricing.basic.features}
                        onChange={(e) => handlePricingChange('basic', 'features', e.target.value)}
                        placeholder="Feature 1, Feature 2"
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Standard */}
              <div className={`card ${pricing.standard.enabled ? 'border-primary' : 'opacity-60'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Standard ⭐</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pricing.standard.enabled}
                      onChange={(e) => handlePricingChange('standard', 'enabled', e.target.checked)}
                      className="w-4 h-4 accent-white"
                    />
                    <span className="text-sm text-white/60">Enable</span>
                  </label>
                </div>
                
                {pricing.standard.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Price ($)</label>
                      <input
                        type="number"
                        min="5"
                        value={pricing.standard.price}
                        onChange={(e) => handlePricingChange('standard', 'price', parseInt(e.target.value) || 0)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Delivery (days)</label>
                      <input
                        type="number"
                        min="1"
                        value={pricing.standard.deliveryDays}
                        onChange={(e) => handlePricingChange('standard', 'deliveryDays', parseInt(e.target.value) || 1)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Features (comma separated)</label>
                      <input
                        type="text"
                        value={pricing.standard.features}
                        onChange={(e) => handlePricingChange('standard', 'features', e.target.value)}
                        placeholder="Feature 1, Feature 2"
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Premium */}
              <div className={`card ${pricing.premium.enabled ? 'border-primary' : 'opacity-60'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Premium</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pricing.premium.enabled}
                      onChange={(e) => handlePricingChange('premium', 'enabled', e.target.checked)}
                      className="w-4 h-4 accent-white"
                    />
                    <span className="text-sm text-white/60">Enable</span>
                  </label>
                </div>
                
                {pricing.premium.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Price ($)</label>
                      <input
                        type="number"
                        min="5"
                        value={pricing.premium.price}
                        onChange={(e) => handlePricingChange('premium', 'price', parseInt(e.target.value) || 0)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Delivery (days)</label>
                      <input
                        type="number"
                        min="1"
                        value={pricing.premium.deliveryDays}
                        onChange={(e) => handlePricingChange('premium', 'deliveryDays', parseInt(e.target.value) || 1)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Features (comma separated)</label>
                      <input
                        type="text"
                        value={pricing.premium.features}
                        onChange={(e) => handlePricingChange('premium', 'features', e.target.value)}
                        placeholder="Feature 1, Feature 2"
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Publish Gig'}
            </button>
            <Link href="/dashboard" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
