'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Autoreposter() {
  const [content, setContent] = useState('')
  const [platforms, setPlatforms] = useState({
    twitter: true,
    linkedin: false,
    instagram: false,
  })
  const [scheduled, setScheduled] = useState<string | null>(null)

  const schedulePost = async () => {
    // This would connect to API
    setScheduled(new Date().toISOString())
  }

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
            <Link href="/dashboard" className="text-white/60 hover:text-white">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-light mb-2">Autoreposter</h1>
        <p className="text-white/40 mb-8">One post → everywhere automatically</p>

        {/* Composer */}
        <div className="card mb-8">
          <h2 className="text-xl font-medium mb-4">Create Post</h2>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 min-h-[150px]"
          />

          {/* Character count */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-white/40 text-sm">{content.length} characters</span>
          </div>

          {/* Platform selection */}
          <div className="mt-6">
            <h3 className="text-sm text-white/60 mb-3">Post to:</h3>
            <div className="flex gap-4">
              {Object.entries(platforms).map(([platform, enabled]) => (
                <label key={platform} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setPlatforms({...platforms, [platform]: e.target.checked})}
                    className="accent-white"
                  />
                  <span className="capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <button className="btn-primary">
              Post Now
            </button>
            <button className="btn-secondary" onClick={schedulePost}>
              Schedule
            </button>
          </div>

          {scheduled && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <span className="text-green-400">✓ Scheduled for {new Date(scheduled).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Preview */}
        {content && (
          <div className="card">
            <h2 className="text-xl font-medium mb-4">Preview</h2>
            
            {platforms.twitter && (
              <div className="mb-4 p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🐦</span>
                  <span className="font-medium">Twitter</span>
                </div>
                <p className="text-white/80">{content.slice(0, 280)}</p>
                {content.length > 280 && <span className="text-red-400">... {content.length - 280} chars over limit</span>}
              </div>
            )}

            {platforms.linkedin && (
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💼</span>
                  <span className="font-medium">LinkedIn</span>
                </div>
                <p className="text-white/80">{content}</p>
              </div>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <div className="card">
            <h3 className="font-medium mb-2">Free</h3>
            <div className="text-3xl font-bold mb-4">$0</div>
            <ul className="text-sm text-white/60 space-y-2">
              <li>✓ 1 platform</li>
              <li>✓ 10 posts/mo</li>
            </ul>
          </div>
          <div className="card border-primary">
            <h3 className="font-medium mb-2">Pro</h3>
            <div className="text-3xl font-bold mb-4">$9<span className="text-sm font-normal">/mo</span></div>
            <ul className="text-sm text-white/60 space-y-2">
              <li>✓ 5 platforms</li>
              <li>✓ Unlimited posts</li>
              <li>✓ Scheduling</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="font-medium mb-2">Business</h3>
            <div className="text-3xl font-bold mb-4">$29<span className="text-sm font-normal">/mo</span></div>
            <ul className="text-sm text-white/60 space-y-2">
              <li>✓ All platforms</li>
              <li>✓ AI rewriting</li>
              <li>✓ Analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
