'use client';

import { useState, useEffect } from 'react';

interface UserProfile {
  username: string;
  fullName: string;
  email: string;
  bio: string;
  avatarUrl: string | null;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    username: 'gigtest31772189625',
    fullName: 'Gig Tester',
    email: 'test@example.com',
    bio: '',
    avatarUrl: null,
  });
  const [saving, setSaving] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailMessages: true,
    emailPayouts: true,
    pushOrders: true,
    pushMessages: false,
  });

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    // In real app, call API
    await new Promise(r => setTimeout(r, 1000));
    setSavingProfile(false);
    alert('Profile saved!');
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    // In real app, call API
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert('Notification settings saved!');
  };

  const connectStripe = async () => {
    // In real app, redirect to Stripe Connect
    alert('Redirecting to Stripe Connect...');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-light mb-8">Settings</h1>

        {/* Profile Section */}
        <section className="mb-8">
          <h2 className="text-xl font-medium mb-4">Profile</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium">
                Change Avatar
              </button>
            </div>
            
            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Username</label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Tell buyers about yourself..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-24"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="mt-6 bg-white text-black px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </section>

        {/* Payout Settings */}
        <section className="mb-8">
          <h2 className="text-xl font-medium mb-4">Payout Settings</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium mb-1">Stripe Connect</h3>
                <p className="text-white/60 text-sm">
                  {stripeConnected 
                    ? 'Your account is connected and ready to receive payments.' 
                    : 'Connect your Stripe account to receive payouts directly to your bank.'}
                </p>
              </div>
              {stripeConnected ? (
                <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg">
                  Connected
                </span>
              ) : (
                <button
                  onClick={connectStripe}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-medium"
                >
                  Connect Stripe
                </button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="font-medium mb-3">Crypto Wallet</h3>
              <div>
                <label className="block text-white/60 text-sm mb-2">USDT Wallet Address (TRC-20)</label>
                <input
                  type="text"
                  placeholder="0x..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm"
                />
                <p className="text-white/40 text-xs mt-2">
                  Receive USDT payments directly to your TRC-20 wallet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="mb-8">
          <h2 className="text-xl font-medium mb-4">Notifications</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <label className="flex items-center justify-between cursor-pointer py-2">
              <span>Email - New orders</span>
              <input 
                type="checkbox" 
                checked={notifications.emailOrders}
                onChange={(e) => setNotifications({...notifications, emailOrders: e.target.checked})}
                className="w-5 h-5" 
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-2">
              <span>Email - Messages</span>
              <input 
                type="checkbox" 
                checked={notifications.emailMessages}
                onChange={(e) => setNotifications({...notifications, emailMessages: e.target.checked})}
                className="w-5 h-5" 
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-2">
              <span>Email - Payouts</span>
              <input 
                type="checkbox" 
                checked={notifications.emailPayouts}
                onChange={(e) => setNotifications({...notifications, emailPayouts: e.target.checked})}
                className="w-5 h-5" 
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-2">
              <span>Push - New orders</span>
              <input 
                type="checkbox" 
                checked={notifications.pushOrders}
                onChange={(e) => setNotifications({...notifications, pushOrders: e.target.checked})}
                className="w-5 h-5" 
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-2">
              <span>Push - Messages</span>
              <input 
                type="checkbox" 
                checked={notifications.pushMessages}
                onChange={(e) => setNotifications({...notifications, pushMessages: e.target.checked})}
                className="w-5 h-5" 
              />
            </label>

            <button 
              onClick={handleSaveNotifications}
              disabled={saving}
              className="mt-4 bg-white text-black px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-xl font-medium mb-4 text-red-400">Danger Zone</h2>
          <div className="bg-white/5 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Delete Account</h3>
                <p className="text-white/60 text-sm">
                  Permanently delete your account and all data. This cannot be undone.
                </p>
              </div>
              <button className="border border-red-500 text-red-400 px-6 py-2 rounded-lg hover:bg-red-500/10">
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
