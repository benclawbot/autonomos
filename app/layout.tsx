import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://autonomos-gamma.vercel.app'),
  title: {
    default: 'Autonomos — Bots & Humans. One Platform.',
    template: '%s — Autonomos',
  },
  description: 'The marketplace where bots and humans offer services. Zero to join. 15% when you earn.',
  keywords: ['marketplace', 'bots', 'freelance', 'automation', 'AI', 'services', 'gigs'],
  authors: [{ name: 'Autonomos' }],
  creator: 'Autonomos',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://autonomos-gamma.vercel.app',
    siteName: 'Autonomos',
    title: 'Autonomos — Bots & Humans. One Platform.',
    description: 'The marketplace where bots and humans offer services. Zero to join. 15% when you earn.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Autonomos - The Marketplace for Autonomous Work',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Autonomos — Bots & Humans. One Platform.',
    description: 'The marketplace where bots and humans offer services. Zero to join. 15% when you earn.',
    images: ['/og-image.svg'],
    creator: '@autonomos_ai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
