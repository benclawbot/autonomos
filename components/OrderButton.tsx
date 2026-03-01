'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PackagePrice {
  price: number;
  deliveryDays: number;
  features: string[];
}

interface Gig {
  id: string;
  title: string;
  seller: {
    id: string;
    username: string;
    fullName: string | null;
  };
}

export default function OrderButton({ 
  gig, 
  packageType, 
  packagePrice 
}: { 
  gig: Gig; 
  packageType: string; 
  packagePrice: PackagePrice 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [error, setError] = useState<string | null>(null);

  const handleOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Create order in database
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gigId: gig.id,
          packageType,
          amount: packagePrice.price,
          currency: 'usd',
        }),
      });

      const orderData = await orderRes.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const orderId = orderData.order.id;

      // 2. Initiate payment based on selected method
      if (paymentMethod === 'stripe') {
        // Create Stripe checkout session
        const stripeRes = await fetch('/api/payments/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'checkout',
            amount: packagePrice.price,
            productName: `${gig.title} (${packageType} package)`,
            metadata: {
              orderId,
              gigId: gig.id,
              sellerId: gig.seller.id,
              packageType,
            },
          }),
        });

        const stripeData = await stripeRes.json();
        
        if (stripeData.success && stripeData.url) {
          // Redirect to Stripe checkout
          window.location.href = stripeData.url;
          return;
        } else {
          throw new Error(stripeData.error || 'Stripe payment failed');
        }
      } else {
        // Create Crypto payment
        const cryptoRes = await fetch('/api/payments/crypto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            amount: packagePrice.price,
            cryptoCurrency: selectedCrypto,
            orderId,
            description: `${gig.title} (${packageType} package)`,
          }),
        });

        const cryptoData = await cryptoRes.json();
        
        if (cryptoData.success && cryptoData.paymentUrl) {
          // Store order ID for verification
          localStorage.setItem('pendingOrderId', orderId);
          // Redirect to crypto payment page
          window.location.href = cryptoData.paymentUrl;
          return;
        } else {
          throw new Error(cryptoData.error || 'Crypto payment failed');
        }
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="w-full py-4 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {loading ? 'Processing...' : 'Order Now'}
      </button>

      <p className="text-center text-white/40 text-xs mt-4">
        Secure payment via Autonomos
      </p>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !loading && setShowModal(false)} />
          <div className="relative bg-[#111] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-medium mb-4">Complete Your Order</h3>
            
            {/* Order Summary */}
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Service</span>
                <span className="text-white">{gig.title}</span>
              </div>
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Package</span>
                <span className="capitalize text-white">{packageType}</span>
              </div>
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Seller</span>
                <span className="text-white">@{gig.seller.username}</span>
              </div>
              <div className="border-t border-white/10 mt-3 pt-3 flex justify-between font-medium">
                <span>Total</span>
                <span className="text-green-400">${packagePrice.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="text-sm text-white/60 mb-3 block">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 rounded-lg border transition ${
                    paymentMethod === 'stripe' 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">💳</div>
                  <div className="text-sm font-medium">Card</div>
                  <div className="text-xs text-white/40">Visa, MC, Amex</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-4 rounded-lg border transition ${
                    paymentMethod === 'crypto' 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">₿</div>
                  <div className="text-sm font-medium">Crypto</div>
                  <div className="text-xs text-white/40">BTC, ETH, USDT</div>
                </button>
              </div>
            </div>

            {/* Crypto Selection */}
            {paymentMethod === 'crypto' && (
              <div className="mb-6">
                <label className="text-sm text-white/60 mb-2 block">Select Cryptocurrency</label>
                <select
                  value={selectedCrypto}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="TRX">Tron (TRX)</option>
                  <option value="LTC">Litecoin (LTC)</option>
                  <option value="DOGE">Dogecoin (DOGE)</option>
                </select>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleOrder}
                disabled={loading}
                className="flex-1 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay $${packagePrice.price.toFixed(2)}`}
              </button>
            </div>

            {/* Security Note */}
            <p className="text-center text-white/30 text-xs mt-4">
              🔒 Payments secured by {paymentMethod === 'stripe' ? 'Stripe' : 'Plisio'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
