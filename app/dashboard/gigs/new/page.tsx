'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateGig() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'HUMAN',
    categoryId: '',
    basicPrice: 50,
    basicDays: 3,
    proPrice: 150,
    proDays: 7,
    premiumPrice: 500,
    premiumDays: 14,
    deliveryDays: 7,
    revisionRounds: 2,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const pricing = {
      basic: { name: 'Basic', price: form.basicPrice, delivery: form.basicDays },
      pro: { name: 'Pro', price: form.proPrice, delivery: form.proDays },
      premium: { name: 'Premium', price: form.premiumPrice, delivery: form.premiumDays },
    }

    try {
      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          pricing,
          sellerId: 'demo-user', // Replace with actual user
        }),
      })

      if (res.ok) {
        router.push('/dashboard/gigs')
      }
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/logo.png" alt="Autonomos" className="w-8 h-8 rounded-lg" />
            <span className="font-medium">Autonomos</span>
          </Link>
          <Link href="/dashboard" className="text-white/60 hover:text-white">
            Cancel
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-4xl mx-auto pb-20">
        <h1 className="text-3xl font-light mb-8">Create New Gig</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Gig Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="I will create..."
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Type</label>
              <div className="flex gap-4">
                {['HUMAN', 'BOT', 'BOTH'].map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={form.type === t}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="accent-white"
                    />
                    <span>{t === 'HUMAN' ? '👤 Human' : t === 'BOT' ? '🤖 Bot' : '🔄 Both'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your service..."
                className="input-field min-h-[150px]"
                required
              />
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Pricing</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Basic */}
              <div className="card">
                <h3 className="font-medium mb-4">Basic</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Price ($)</label>
                    <input
                      type="number"
                      value={form.basicPrice}
                      onChange={(e) => setForm({ ...form, basicPrice: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Days</label>
                    <input
                      type="number"
                      value={form.basicDays}
                      onChange={(e) => setForm({ ...form, basicDays: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Pro */}
              <div className="card border-primary">
                <h3 className="font-medium mb-4">Pro ⭐</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Price ($)</label>
                    <input
                      type="number"
                      value={form.proPrice}
                      onChange={(e) => setForm({ ...form, proPrice: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Days</label>
                    <input
                      type="number"
                      value={form.proDays}
                      onChange={(e) => setForm({ ...form, proDays: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Premium */}
              <div className="card">
                <h3 className="font-medium mb-4">Premium</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Price ($)</label>
                    <input
                      type="number"
                      value={form.premiumPrice}
                      onChange={(e) => setForm({ ...form, premiumPrice: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Days</label>
                    <input
                      type="number"
                      value={form.premiumDays}
                      onChange={(e) => setForm({ ...form, premiumDays: parseInt(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Publish Gig'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
