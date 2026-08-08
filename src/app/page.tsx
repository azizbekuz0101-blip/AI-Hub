'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Sparkles, ArrowRight, Shield, Zap, Cpu, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-textMain flex flex-col font-sans selection:bg-accent/30 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-border bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent to-accent-purple flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">{t('brand')}</span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link
              href="/login"
              className="text-xs font-medium text-textMuted hover:text-textMain transition-colors hidden sm:inline"
            >
              {t('login')}
            </Link>
            <Link
              href="/chat"
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 group"
            >
              <span>{t('startChatting')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-28 px-6 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card/80 backdrop-blur-md text-xs font-medium text-textMuted shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span>{t('aiName')} — {t('aiSubtitle')}</span>
            <Badge variant="free" className="text-[10px] py-0 px-1.5 font-mono">FREE</Badge>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            One workspace. <br />
            <span className="bg-gradient-to-r from-accent via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              One powerful AI.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-textMuted max-w-xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/chat"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>{t('startChatting')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/settings"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-border bg-card/60 hover:bg-card text-textMain text-sm font-semibold transition-all text-center"
            >
              {t('exploreArchitecture')}
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-16 px-6 max-w-6xl mx-auto border-t border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <FeatureCard
              icon={<Zap className="w-5 h-5 text-accent" />}
              title="Real-Time SSE Streaming"
              description="Low-latency Server-Sent Events streaming with typewriter feedback and instant stop controllers."
            />
            <FeatureCard
              icon={<Cpu className="w-5 h-5 text-emerald-400" />}
              title="Cloudflare Workers AI Infrastructure"
              description="Hosted open-source AI infrastructure delivering fast and reliable responses."
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5 text-purple-400" />}
              title="3-Language Native Support"
              description="Full interface and AI responses natively translated across Russian, Uzbek, and English."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 bg-[#0E0E0E] text-center text-xs text-textDark">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="font-semibold text-textMain">{t('brand')}</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/chat" className="hover:text-textMain transition-colors">Workspace</Link>
            <Link href="/settings" className="hover:text-textMain transition-colors">{t('settings')}</Link>
            <Link href="/admin" className="hover:text-textMain transition-colors">{t('adminPanel')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-2.5">
      <div className="p-2.5 rounded-xl bg-muted w-fit">{icon}</div>
      <h3 className="font-bold text-sm text-white">{title}</h3>
      <p className="text-xs text-textMuted leading-relaxed">{description}</p>
    </div>
  );
}
