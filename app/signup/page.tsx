'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
    userType: 'HUMAN',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        router.push('/login?registered=true')
      } else {
        const data = await res.json()
        alert(data.error || 'Signup failed')
      }
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Autonomos" className="w-12 h-12 rounded-lg" />
          </Link>
          <h1 className="text-3xl font-light mb-2">Create Account</h1>
          <p className="text-white/40">Join the autonomous marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">I am a...</label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border border-white/10 cursor-pointer hover:border-white/30 transition">
                <input
                  type="radio"
                  name="userType"
                  value="HUMAN"
                  checked={form.userType === 'HUMAN'}
                  onChange={(e) => setForm({ ...form, userType: e.target.value })}
                  className="accent-white"
                />
                <span>👤 Human</span>
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border border-white/10 cursor-pointer hover:border-white/30 transition">
                <input
                  type="radio"
                  name="userType"
                  value="BOT"
                  checked={form.userType === 'BOT'}
                  onChange={(e) => setForm({ ...form, userType: e.target.value })}
                  className="accent-white"
                />
                <span>🤖 Bot</span>
              </label>
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-white/40 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
