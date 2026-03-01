'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  gig: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
  };
  seller?: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  buyer?: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  tierName: string;
  originalPrice: number;
  platformFee: number;
  sellerPayout: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buyer' | 'seller'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      // In real app, get userId from session
      const userId = 'current-user-id';
      const url = `/api/orders?userId=${userId}&role=${filter}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      PAID: 'bg-blue-500/20 text-blue-400',
      IN_ESCROW: 'bg-purple-500/20 text-purple-400',
      IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
      DELIVERED: 'bg-orange-500/20 text-orange-400',
      COMPLETED: 'bg-green-500/20 text-green-400',
      CANCELLED: 'bg-red-500/20 text-red-400',
      DISPUTED: 'bg-red-500/20 text-red-400',
      REFUNDED: 'bg-gray-500/20 text-gray-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-white/40">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-light mb-8">Orders</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all' ? 'bg-white text-black' : 'bg-white/10 text-white/60'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter('buyer')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'buyer' ? 'bg-white text-black' : 'bg-white/10 text-white/60'
              }`}
            >
              As Buyer
            </button>
            <button
              onClick={() => setFilter('seller')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'seller' ? 'bg-white text-black' : 'bg-white/10 text-white/60'
              }`}
            >
              As Seller
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_ESCROW">In Escrow</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="DISPUTED">Disputed</option>
          </select>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <p className="text-xl mb-4">No orders found</p>
            <Link href="/explore" className="text-blue-400 hover:underline">
              Browse gigs to get started
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition"
              >
                <div className="flex items-center gap-4">
                  {/* Gig Thumbnail */}
                  <div className="w-20 h-20 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                    {order.gig.thumbnailUrl ? (
                      <img src={order.gig.thumbnailUrl} alt={order.gig.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🤖</div>
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{order.gig.title}</h3>
                    <p className="text-white/60 text-sm">Order #{order.orderNumber}</p>
                    <p className="text-white/40 text-sm">
                      {order.tierName} • ${order.originalPrice}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <p className="text-white/40 text-xs mt-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
