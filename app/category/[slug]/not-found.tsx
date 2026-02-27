import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-6xl font-light mb-4">404</h1>
        <p className="text-white/50 mb-8">This page could not be found.</p>
        <Link href="/" className="btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  )
}
