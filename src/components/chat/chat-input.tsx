'use client';

import React, { useRef, useEffect } from 'react';
import { useTranslation } from '@/i18n/context';
import { Send, Square, Paperclip, Trash2 } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  onStop?: () => void;
  onClear?: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function ChatInput({
  input,
  setInput,
  onSend,
  onStop,
  onClear,
  isGenerating,
  disabled,
}: ChatInputProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      <div className="relative rounded-2xl border border-border bg-card shadow-2xl p-2 transition-all focus-within:border-accent/60">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('inputPlaceholder')}
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent text-sm text-textMain placeholder:text-textDark resize-none focus:outline-none px-3 py-2 custom-scrollbar min-h-[44px] max-h-[180px]"
        />

        <div className="flex items-center justify-between pt-1 px-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              title={t('comingSoon')}
              className="p-1.5 rounded-lg text-textDark hover:text-textMuted hover:bg-muted transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {onClear && (
              <button
                type="button"
                onClick={onClear}
                title={t('clearChat')}
                className="p-1.5 rounded-lg text-textDark hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[10px] text-textDark">
              <kbd className="px-1 py-0.5 bg-muted rounded font-mono">Shift + Enter</kbd> newline
            </span>

            {isGenerating ? (
              <button
                onClick={onStop}
                type="button"
                className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                {t('stop')}
              </button>
            ) : (
              <button
                onClick={onSend}
                disabled={!input.trim() || disabled}
                type="button"
                className="p-2 bg-accent hover:bg-accent-hover text-white rounded-xl disabled:opacity-30 disabled:hover:bg-accent transition-all shadow-sm flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
