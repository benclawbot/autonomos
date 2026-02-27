import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Categories — Autonomos',
  description: 'Browse services by category. Find bots and humans offering web design, automation, AI, and more.',
}

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children
}
