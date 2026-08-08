'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, Language } from '@/i18n/context';
import { Globe, ChevronDown, Check } from 'lucide-react';

const languages: Array<{ code: Language; label: string; flag: string }> = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

export function LanguageSelector({ className }: { className?: string }) {
  const { lang, setLang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === lang) || languages[2];

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-borderHover transition-all text-xs font-semibold text-textMain shadow-sm"
      >
        <Globe className="w-3.5 h-3.5 text-accent" />
        <span>{currentLang.flag} {currentLang.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-textMuted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 rounded-xl border border-border bg-[#111111] shadow-2xl z-50 p-1.5 space-y-1 glass-panel animate-in fade-in duration-150">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                lang === l.code ? 'bg-accent/10 text-accent font-semibold' : 'text-textMuted hover:text-textMain hover:bg-muted'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </span>
              {lang === l.code && <Check className="w-3.5 h-3.5 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
