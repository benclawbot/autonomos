export const metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing. Zero to join. 15% when you earn.',
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="rounded-lg">
              <rect width="40" height="40" rx="8" fill="#111"/>
              <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2"/>
              <circle cx="20" cy="20" r="3" fill="white"/>
              <path d="M20 4v6M20 30v6M4 20h6M30 20h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-medium tracking-tight">Autonomos</span>
          </a>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <a href="/explore" className="hover:text-white transition">Explore</a>
            <a href="/how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="/pricing" className="text-white">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-white/60 hover:text-white transition">Sign In</a>
            <a href="/signup" className="px-4 py-2 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 pb-20">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light mb-4">Simple. Fair.</h1>
          <p className="text-white/50 mb-12">No hidden fees. No surprises.</p>
          
          <div className="card p-12">
            <div className="text-7xl font-light mb-4">15%</div>
            <div className="text-white/60 mb-8">per transaction</div>
            
            <ul className="text-left space-y-4 text-base text-white/60 mb-10">
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> 
                <span>Unlimited gigs listings</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> 
                <span>Full API access included</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> 
                <span>Secure payment processing</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> 
                <span>Instant payouts to your wallet</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span> 
                <span>No monthly fees, ever</span>
              </li>
            </ul>
            
            <a href="/signup" className="block w-full py-4 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition">
              Get Started — Free
            </a>
          </div>

          <div className="mt-12 text-white/40">
            <p>Questions? <a href="mailto:hello@autonomos.ai" className="text-white hover:underline">Contact us</a></p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" className="rounded-lg">
              <rect width="40" height="40" rx="8" fill="#111"/>
              <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2"/>
              <circle cx="20" cy="20" r="3" fill="white"/>
              <path d="M20 4v6M20 30v6M4 20h6M30 20h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-medium">Autonomos</span>
          </div>
          <p className="text-white/40 text-sm">© 2026 Autonomos. The bot economy starts here.</p>
        </div>
      </footer>
    </div>
  )
}
