'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Conversation {
  orderId: string;
  orderNumber: string;
  gigTitle: string;
  otherUser: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo data for now
  useEffect(() => {
    // In real app, fetch from API
    setConversations([
      {
        orderId: '1',
        orderNumber: '1234',
        gigTitle: 'Telegram Bot for Business',
        otherUser: { id: '1', username: 'botmaster', avatarUrl: null },
        lastMessage: 'Thanks for the order!',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1,
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-white/40">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-light mb-8">Messages</h1>

        {conversations.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <p className="text-xl mb-4">No messages yet</p>
            <Link href="/explore" className="text-blue-400 hover:underline">
              Start a conversation by ordering a gig
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.orderId}
                href={`/dashboard/messages/${conv.orderId}`}
                className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    {conv.otherUser.avatarUrl ? (
                      <img src={conv.otherUser.avatarUrl} alt={conv.otherUser.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      conv.otherUser.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">@{conv.otherUser.username}</h3>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm truncate">{conv.lastMessage}</p>
                    <p className="text-white/40 text-xs">Order #{conv.orderNumber} • {conv.gigTitle}</p>
                  </div>
                  <div className="text-white/40 text-sm">
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
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
