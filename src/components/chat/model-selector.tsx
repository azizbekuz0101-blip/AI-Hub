'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AIModel } from '@/lib/ai/types';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/context';
import { Sparkles, ChevronDown, Check, Info, Lock } from 'lucide-react';

interface ModelSelectorProps {
  selectedModelId: string;
  onSelectModel: (model: AIModel) => void;
}

export function ModelSelector({ selectedModelId, onSelectModel }: ModelSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const primaryModel: AIModel = {
    id: 'openrouter-free',
    name: 'AI HUB AI',
    provider: 'cloudflare',
    modelId: 'openrouter/free',
    description: 'Your everyday intelligent AI assistant powered by open-source infrastructure.',
    category: 'Recommended',
    enabled: true,
    isFree: true,
    isSystemModel: true,
    supportsStreaming: true,
    supportsVision: true,
    supportsFiles: false,
    supportsTools: false,
    contextLength: 128000,
    inputPrice: 0,
    outputPrice: 0,
  };

  const comingSoonModels: Array<{ id: string; name: string; provider: string; desc: string }> = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', desc: 'High-intelligence flagship model.' },
    { id: 'claude-3-5', name: 'Claude 3.5 Sonnet', provider: 'anthropic', desc: 'Writing and reasoning specialist.' },
    { id: 'gemini-1-5', name: 'Gemini 1.5 Pro', provider: 'google', desc: 'Immense 2M token context window.' },
    { id: 'grok-2', name: 'Grok 2', provider: 'xai', desc: 'Real-time knowledge and reasoning.' },
    { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'deepseek', desc: 'Advanced open reasoning model.' },
    { id: 'kimi-moonshot', name: 'Kimi Moonshot', provider: 'kimi', desc: 'Long-text context AI specialist.' },
  ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectComingSoon = (name: string) => {
    setNotice(`${name}: ${t('comingSoonDesc')}`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-borderHover transition-all text-sm font-medium shadow-sm"
      >
        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
        <span className="text-textMain font-semibold">AI HUB AI</span>
        <Badge variant="free" className="text-[10px] py-0 px-1.5 font-mono">
          PRIMARY
        </Badge>
        <ChevronDown className={`w-4 h-4 text-textMuted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Notice Banner */}
      {notice && (
        <div className="absolute top-full left-0 mt-2 w-72 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs shadow-xl z-50 animate-in fade-in">
          {notice}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[340px] sm:w-[400px] max-h-[500px] rounded-2xl border border-border bg-[#111111] shadow-2xl z-50 flex flex-col overflow-hidden glass-panel animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="p-3 border-b border-border space-y-1">
            <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Select AI Model</span>
            <p className="text-[11px] text-textDark">AI HUB AI is active. Additional proprietary models coming soon.</p>
          </div>

          {/* Model Options Scroll List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
            
            {/* Primary Model */}
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-emerald-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Active Model
              </div>

              <div
                onClick={() => {
                  onSelectModel(primaryModel);
                  setIsOpen(false);
                }}
                className="p-3 rounded-xl border border-accent/40 bg-accent/10 cursor-pointer flex items-start justify-between gap-3 shadow-sm transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">AI HUB AI</span>
                    <Badge variant="free" className="text-[9px]">AVAILABLE</Badge>
                  </div>
                  <p className="text-[11px] text-textMuted leading-relaxed">{t('aiSubtitle')}</p>
                  <span className="inline-block text-[10px] text-textDark font-mono bg-muted/60 px-1.5 py-0.5 rounded">
                    {t('poweredByOpenSource')}
                  </span>
                </div>
                <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              </div>
            </div>

            {/* Coming Soon Models */}
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-textMuted uppercase flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-textDark" />
                Coming Soon
              </div>

              <div className="space-y-1 mt-1">
                {comingSoonModels.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectComingSoon(m.name)}
                    className="p-2.5 rounded-xl border border-border/50 bg-card/40 hover:bg-muted/40 cursor-pointer flex items-center justify-between gap-2 transition-all opacity-70 hover:opacity-100"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-textMain">{m.name}</span>
                        <span className="text-[10px] text-textDark uppercase font-mono">[{m.provider}]</span>
                      </div>
                      <p className="text-[11px] text-textMuted truncate">{m.desc}</p>
                    </div>

                    <Badge variant="default" className="text-[9px] py-0.5 px-1.5 shrink-0">
                      {t('comingSoon')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-2.5 bg-muted/30 border-t border-border flex items-center justify-between text-[11px] text-textMuted">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-textDark" />
              AI HUB AI Router
            </span>
            <span className="text-textDark font-mono text-[10px]">Cloudflare Workers AI</span>
          </div>

        </div>
      )}
    </div>
  );
}
