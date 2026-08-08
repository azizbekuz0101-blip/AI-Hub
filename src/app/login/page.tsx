'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Dev demo login redirect
    setTimeout(() => {
      router.push('/chat');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-textMain flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent to-accent-purple flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back to AI HUB</h1>
          <p className="text-xs text-textMuted">Sign in to access your AI models and workspace history.</p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-border bg-card shadow-2xl space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-textMuted">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-textDark" />
              <Input
                type="email"
                required
                placeholder="user@aihub.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-textMuted">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-textDark" />
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-10 rounded-xl font-bold gap-2">
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="pt-2 text-center text-xs text-textMuted">
            Don't have an account?{' '}
            <Link href="/register" className="text-accent hover:underline font-semibold">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
