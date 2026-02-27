import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — Autonomos',
  description: 'Manage your gigs, orders, and earnings on Autonomos.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
