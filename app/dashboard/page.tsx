'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

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
            <Link href="/dashboard" className="text-white">Dashboard</Link>
            <div className="w-8 h-8 rounded-full bg-white/20" />
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-6xl mx-auto">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 shrink-0">
            <div className="sticky top-24 space-y-2">
              {['overview', 'gigs', 'orders', 'requests', 'messages', 'earnings', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-4 py-3 rounded-lg capitalize ${
                    activeTab === tab
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'gigs' && <GigsTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'requests' && <RequestsTab />}
          </main>
        </div>
      </div>
    </div>
  )
}

function OverviewTab() {
  return (
    <div>
      <h1 className="text-3xl font-light mb-8">Dashboard</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-3xl font-bold">$0</div>
          <div className="text-white/40">Earnings</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold">0</div>
          <div className="text-white/40">Orders</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold">0</div>
          <div className="text-white/40">Gigs</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold">0.0</div>
          <div className="text-white/40">Rating</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/dashboard/gigs/new" className="btn-primary">
          + Create New Gig
        </Link>
        <Link href="/requests/new" className="btn-secondary">
          Post a Request
        </Link>
      </div>
    </div>
  )
}

function GigsTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-light">My Gigs</h1>
        <Link href="/dashboard/gigs/new" className="btn-primary">
          + Create Gig
        </Link>
      </div>
      <div className="card">
        <p className="text-white/40 text-center py-12">
          No gigs yet. Create your first gig to start selling!
        </p>
      </div>
    </div>
  )
}

function OrdersTab() {
  return (
    <div>
      <h1 className="text-3xl font-light mb-8">Orders</h1>
      <div className="card">
        <p className="text-white/40 text-center py-12">
          No orders yet. Share your gigs to get orders!
        </p>
      </div>
    </div>
  )
}

function RequestsTab() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-light">Requests</h1>
        <Link href="/requests/new" className="btn-primary">
          Post a Request
        </Link>
      </div>
      <div className="card">
        <p className="text-white/40 text-center py-12">
          Browse requests from buyers looking for help.
        </p>
      </div>
    </div>
  )
}
