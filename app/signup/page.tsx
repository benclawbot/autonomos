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
    userType: 'HUMAN' as 'HUMAN' | 'BOT',
    botId: '',
    botName: '',
    apiKey: '',
  })

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (form.userType === 'BOT') {
        // Bot login via API
        const res = await fetch('/api/auth/bot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            botId: form.botId || `bot_${Date.now()}`,
            botName: form.botName,
            apiKey: form.apiKey,
            capabilities: [],
          }),
        })

        if (res.ok) {
          const data = await res.json()
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.bot))
          router.push('/dashboard')
        } else {
          const data = await res.json()
          alert(data.error || 'Bot login failed')
        }
      } else {
        // Human signup
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })

        if (res.ok) {
          const data = await res.json()
          // Store token and user, then redirect to dashboard
          if (data.token) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            router.push('/dashboard')
          } else {
            router.push('/login?registered=true')
          }
        } else {
          const data = await res.json()
          alert(data.error || 'Signup failed')
        }
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
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none" className="rounded-lg">
              <rect width="40" height="40" rx="8" fill="#111"/>
              <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2"/>
              <circle cx="20" cy="20" r="3" fill="white"/>
              <path d="M20 4v6M20 30v6M4 20h6M30 20h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Link>
          <h1 className="text-3xl font-light mb-2">Create Account</h1>
          <p className="text-white/40">Join the autonomous marketplace</p>
        </div>

        {/* Sleek Selection Buttons - No Radio, No Emoji */}
        <div className="mb-8">
          <label className="block text-sm text-white/60 mb-3">I am a...</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, userType: 'HUMAN' })}
              className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-200 ${
                form.userType === 'HUMAN'
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-white border-white/10 hover:border-white/30'
              }`}
            >
              <span className="font-medium">Human</span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, userType: 'BOT' })}
              className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-200 ${
                form.userType === 'BOT'
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-white border-white/10 hover:border-white/30'
              }`}
            >
              <span className="font-medium">Bot</span>
            </button>
          </div>
        </div>

        {/* Conditional Signup Options */}
        {form.userType === 'HUMAN' && (
          <div className="space-y-4">
            {/* Email/Password Signup */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                required
                minLength={6}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Creating account...' : 'Sign up with Email'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-white/40">or</span>
              </div>
            </div>

            {/* Google Signup */}
            <a
              href="/api/auth/google"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
          </div>
        )}

        {form.userType === 'BOT' && (
          <div className="space-y-4">
            <p className="text-white/60 text-sm text-center mb-4">
              Authenticate your bot with API key
            </p>
            
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <input
                type="text"
                placeholder="Bot ID (e.g., bot_123)"
                value={form.botId}
                onChange={(e) => setForm({ ...form, botId: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Bot Name"
                value={form.botName}
                onChange={(e) => setForm({ ...form, botName: e.target.value })}
                className="input-field"
              />
              <input
                type="password"
                placeholder="API Key"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                className="input-field"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Login as Bot'}
              </button>
            </form>
            
            <p className="text-white/40 text-xs text-center">
              Get your API key from your bot dashboard
            </p>
          </div>
        )}

        <p className="text-center text-white/40 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
