'use client';

import { useState, useEffect } from 'react';

interface EarningsData {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  recentPayouts: Payout[];
  recentEarnings: Earnings[];
}

interface Payout {
  id: string;
  amount: number;
  date: string;
  status: string;
}

interface Earnings {
  id: string;
  orderId: string;
  amount: number;
  date: string;
  gigTitle: string;
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingBalance: 0,
    recentPayouts: [],
    recentEarnings: [],
  });
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    // In real app, fetch from API
    // Simulating data for now
    setEarnings({
      totalEarnings: 1250.00,
      availableBalance: 850.00,
      pendingBalance: 400.00,
      recentPayouts: [
        { id: '1', amount: 250.00, date: '2026-02-25', status: 'completed' },
        { id: '2', amount: 500.00, date: '2026-02-20', status: 'completed' },
      ],
      recentEarnings: [
        { id: '1', orderId: 'order_123', amount: 150.00, date: '2026-02-28', gigTitle: 'Discord Bot Development' },
        { id: '2', orderId: 'order_124', amount: 250.00, date: '2026-02-27', gigTitle: 'Telegram Bot Setup' },
        { id: '3', orderId: 'order_125', amount: 100.00, date: '2026-02-26', gigTitle: 'Automation Script' },
      ],
    });
    setLoading(false);
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    if (parseFloat(withdrawAmount) > earnings.availableBalance) {
      alert('Insufficient balance');
      return;
    }
    setWithdrawing(true);
    // In real app, call API
    setTimeout(() => {
      setWithdrawing(false);
      setWithdrawAmount('');
      alert('Withdrawal request submitted!');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-white/40">Loading earnings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-light mb-8">Earnings</h1>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-white/60 text-sm mb-1">Total Earnings</p>
            <p className="text-3xl font-light text-green-400">${earnings.totalEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-white/60 text-sm mb-1">Available Balance</p>
            <p className="text-3xl font-light text-blue-400">${earnings.availableBalance.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-white/60 text-sm mb-1">Pending (In Escrow)</p>
            <p className="text-3xl font-light text-yellow-400">${earnings.pendingBalance.toFixed(2)}</p>
          </div>
        </div>

        {/* Withdraw Section */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">Withdraw Funds</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-white/60 text-sm mb-2">Amount</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
              />
            </div>
            <button
              onClick={handleWithdraw}
              disabled={withdrawing || !withdrawAmount}
              className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-white/90 disabled:opacity-50"
            >
              {withdrawing ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
          <p className="text-white/40 text-sm mt-2">
            Available methods: Stripe, Crypto (USDT-TRC20)
          </p>
        </div>

        {/* Recent Earnings */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">Recent Earnings</h2>
          {earnings.recentEarnings.length === 0 ? (
            <p className="text-white/40">No earnings yet</p>
          ) : (
            <div className="space-y-3">
              {earnings.recentEarnings.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-medium">{earning.gigTitle}</p>
                    <p className="text-white/40 text-sm">{earning.date}</p>
                  </div>
                  <p className="text-green-400 font-medium">+${earning.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payouts */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-medium mb-4">Recent Payouts</h2>
          {earnings.recentPayouts.length === 0 ? (
            <p className="text-white/40">No payouts yet</p>
          ) : (
            <div className="space-y-3">
              {earnings.recentPayouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-medium">Payout #{payout.id}</p>
                    <p className="text-white/40 text-sm">{payout.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">-${payout.amount.toFixed(2)}</p>
                    <p className="text-green-400 text-sm capitalize">{payout.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
