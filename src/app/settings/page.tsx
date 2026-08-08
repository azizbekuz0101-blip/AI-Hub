'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation, Language } from '@/i18n/context';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Sparkles, ArrowLeft, User, Moon, Cpu, BarChart3, ShieldCheck, Globe, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UsageStats {
  messagesToday: number;
  dailyLimit: number;
  totalTokens: number;
  totalEstimatedCost: number;
}

export default function SettingsPage() {
  const { t, lang, setLang } = useTranslation();
  const [activeTab, setActiveTab] = useState<'Account' | 'Appearance' | 'AI' | 'Usage' | 'About'>('Account');
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [aiResponseLang, setAiResponseLang] = useState('auto');

  const [usageStats] = useState<UsageStats>({
    messagesToday: 12,
    dailyLimit: 20,
    totalTokens: 4820,
    totalEstimatedCost: 0.0084,
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-textMain flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-[#0A0A0A]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/chat"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-textMuted hover:text-textMain transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="font-bold text-base text-white">{t('settings')}</span>
          </div>
        </div>

        <LanguageSelector />
      </header>

      {/* Main Grid */}
      <div className="max-w-4xl mx-auto w-full p-6 md:p-10 flex-1 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Tab List */}
        <div className="space-y-1.5 md:col-span-1">
          <button
            onClick={() => setActiveTab('Account')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'Account' ? 'bg-card border border-border text-white shadow-sm' : 'text-textMuted hover:text-textMain hover:bg-card/50'
            }`}
          >
            <User className={activeTab === 'Account' ? 'w-4 h-4 text-accent' : 'w-4 h-4 text-textDark'} />
            <span>{t('account')}</span>
          </button>

          <button
            onClick={() => setActiveTab('Appearance')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'Appearance' ? 'bg-card border border-border text-white shadow-sm' : 'text-textMuted hover:text-textMain hover:bg-card/50'
            }`}
          >
            <Moon className={activeTab === 'Appearance' ? 'w-4 h-4 text-accent' : 'w-4 h-4 text-textDark'} />
            <span>{t('appearance')}</span>
          </button>

          <button
            onClick={() => setActiveTab('AI')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'AI' ? 'bg-card border border-border text-white shadow-sm' : 'text-textMuted hover:text-textMain hover:bg-card/50'
            }`}
          >
            <Cpu className={activeTab === 'AI' ? 'w-4 h-4 text-accent' : 'w-4 h-4 text-textDark'} />
            <span>{t('aiConfig')}</span>
          </button>

          <button
            onClick={() => setActiveTab('Usage')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'Usage' ? 'bg-card border border-border text-white shadow-sm' : 'text-textMuted hover:text-textMain hover:bg-card/50'
            }`}
          >
            <BarChart3 className={activeTab === 'Usage' ? 'w-4 h-4 text-accent' : 'w-4 h-4 text-textDark'} />
            <span>{t('usage')}</span>
          </button>

          <button
            onClick={() => setActiveTab('About')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'About' ? 'bg-card border border-border text-white shadow-sm' : 'text-textMuted hover:text-textMain hover:bg-card/50'
            }`}
          >
            <Info className={activeTab === 'About' ? 'w-4 h-4 text-accent' : 'w-4 h-4 text-textDark'} />
            <span>{t('about')}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="md:col-span-3 p-6 rounded-2xl border border-border bg-card space-y-6 shadow-xl">
          {activeTab === 'Account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">{t('account')}</h2>
                <p className="text-xs text-textMuted">Profile details and active plan status.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl border border-border bg-muted/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 text-accent font-bold flex items-center justify-center">
                      U
                    </div>
                    <div>
                      <span className="block font-semibold text-sm text-white">Demo User</span>
                      <span className="block text-xs text-textMuted">user@aihub.app</span>
                    </div>
                  </div>
                  <Badge variant="free">{t('freeTier')}</Badge>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-card space-y-2">
                  <div className="flex items-center justify-between text-xs text-textMuted">
                    <span>{t('messagesToday')}</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {usageStats.messagesToday} / {usageStats.dailyLimit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(usageStats.messagesToday / usageStats.dailyLimit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">{t('appearance')}</h2>
                <p className="text-xs text-textMuted">Interface language and theme preferences.</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
                <span className="text-xs font-semibold text-textMain flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-accent" />
                  {t('language')}
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setLang('ru')}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                      lang === 'ru' ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-card text-textMuted'
                    }`}
                  >
                    🇷🇺 Русский
                  </button>
                  <button
                    onClick={() => setLang('uz')}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                      lang === 'uz' ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-card text-textMuted'
                    }`}
                  >
                    🇺🇿 O'zbekcha
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                      lang === 'en' ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-card text-textMuted'
                    }`}
                  >
                    🇺🇸 English
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'AI' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">{t('aiConfig')}</h2>
                <p className="text-xs text-textMuted">Configure AI HUB AI options.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border bg-muted/40 flex items-center justify-between">
                  <div>
                    <span className="block font-semibold text-xs text-white">{t('autoResponseLanguage')}</span>
                    <span className="block text-[11px] text-textMuted">Target language for AI HUB AI responses</span>
                  </div>
                  <select
                    value={aiResponseLang}
                    onChange={(e) => setAiResponseLang(e.target.value)}
                    className="bg-card border border-border text-xs text-textMain rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent"
                  >
                    <option value="auto">{t('auto')}</option>
                    <option value="ru">Русский</option>
                    <option value="uz">O'zbekcha</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/40 flex items-center justify-between">
                  <div>
                    <span className="block font-semibold text-xs text-white">Real-Time Streaming</span>
                    <span className="block text-[11px] text-textMuted">Stream responses token by token</span>
                  </div>
                  <button
                    onClick={() => setStreamingEnabled(!streamingEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                      streamingEnabled ? 'bg-accent' : 'bg-muted border border-border'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        streamingEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Usage' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">{t('usage')}</h2>
                <p className="text-xs text-textMuted">Daily messages usage and quota.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-1">
                  <span className="text-[11px] text-textMuted block font-medium">{t('messagesToday')}</span>
                  <span className="text-xl font-bold text-white font-mono block">
                    {usageStats.messagesToday} / {usageStats.dailyLimit}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-1">
                  <span className="text-[11px] text-textMuted block font-medium">Estimated Tokens</span>
                  <span className="text-xl font-bold text-white font-mono block">
                    {usageStats.totalTokens.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'About' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">{t('about')}</h2>
                <p className="text-xs text-textMuted">{t('brand')} Platform Version 1.0.0</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3 text-xs text-textMuted">
                <div className="flex items-center gap-2 text-accent font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('aiName')}</span>
                </div>
                <p className="leading-relaxed">{t('aboutDesc')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
