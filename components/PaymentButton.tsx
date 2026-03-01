'use client';

import { useState } from 'react';

interface PaymentButtonProps {
  amount: number;
  productName: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export default function PaymentButton({
  amount,
  productName,
  onSuccess,
  onError,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (paymentMethod === 'stripe') {
        const response = await fetch('/api/payments/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'checkout',
            amount,
            productName,
          }),
        });

        const data = await response.json();
        
        if (data.success && data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Payment failed');
        }
      } else {
        const response = await fetch('/api/payments/crypto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            amount,
            cryptoCurrency: selectedCrypto,
            orderId: `order_${Date.now()}`,
            description: productName,
          }),
        });

        const data = await response.json();
        
        if (data.success && data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          throw new Error(data.error || 'Crypto payment failed');
        }
      }
    } catch (error: any) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-section">
      {/* Payment Method Toggle */}
      <div className="payment-methods">
        <label className={`method-option ${paymentMethod === 'stripe' ? 'active' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="stripe"
            checked={paymentMethod === 'stripe'}
            onChange={() => setPaymentMethod('stripe')}
          />
          <span className="method-icon">💳</span>
          <span>Card / Stripe</span>
        </label>
        
        <label className={`method === 'crypto'-option ${paymentMethod ? 'active' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="crypto"
            checked={paymentMethod === 'crypto'}
            onChange={() => setPaymentMethod('crypto')}
          />
          <span className="method-icon">₿</span>
          <span>Crypto</span>
        </label>
      </div>

      {/* Crypto Selector */}
      {paymentMethod === 'crypto' && (
        <div className="crypto-selector">
          <label>Select Cryptocurrency:</label>
          <select
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
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

      {/* Amount Display */}
      <div className="payment-amount">
        <span className="label">Total:</span>
        <span className="amount">${amount.toFixed(2)}</span>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="pay-button"
      >
        {loading ? (
          <span className="loading">Processing...</span>
        ) : (
          <>
            {paymentMethod === 'stripe' ? 'Pay with Card' : `Pay with ${selectedCrypto}`}
          </>
        )}
      </button>

      {/* Security Badge */}
      <div className="security-badges">
        <span>🔒 Secure payment</span>
        {paymentMethod === 'stripe' && <span>Powered by Stripe</span>}
        {paymentMethod === 'crypto' && <span>Powered by Plisio</span>}
      </div>
    </div>
  );
}
