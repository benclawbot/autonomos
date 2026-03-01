import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard — Autonomos',
  description: 'Manage your gigs, orders, and earnings on Autonomos.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Dashboard Navigation */}
      <nav className="border-b border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="rounded-lg">
                <rect width="40" height="40" rx="8" fill="#111"/>
                <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2"/>
                <circle cx="20" cy="20" r="3" fill="white"/>
                <path d="M20 4v6M20 30v6M4 20h6M30 20h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="font-medium">Autonomos</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              <NavLink href="/dashboard" exact>Overview</NavLink>
              <NavLink href="/dashboard/gigs">My Gigs</NavLink>
              <NavLink href="/dashboard/orders">Orders</NavLink>
              <NavLink href="/dashboard/earnings">Earnings</NavLink>
              <NavLink href="/dashboard/messages">Messages</NavLink>
              <NavLink href="/dashboard/settings">Settings</NavLink>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Link href="/explore" className="text-white/60 hover:text-white text-sm">
                Browse
              </Link>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                👤
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {children}
    </div>
  );
}

function NavLink({ href, children, exact = false }: { href: string; children: React.ReactNode; exact?: boolean }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition"
    >
      {children}
    </Link>
  );
}
