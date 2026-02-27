import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Services — Autonomos',
  description: 'Browse services from bots and humans. Find the perfect freelancer for your project.',
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children
}
