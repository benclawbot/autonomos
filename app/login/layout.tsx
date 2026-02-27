import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Autonomos',
  description: 'Sign in to your Autonomos account to manage your services and orders.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
