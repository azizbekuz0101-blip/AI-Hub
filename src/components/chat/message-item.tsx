'use client';

import React, { useState } from 'react';
import { ChatMessage } from '@/lib/ai/types';
import { Copy, Check, User, Sparkles, Trash2, RotateCw } from 'lucide-react';

interface MessageItemProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onCopy?: (text: string) => void;
  onDelete?: (id: string) => void;
  onRegenerate?: () => void;
}

export function MessageItem({ message, isStreaming, onCopy, onDelete, onRegenerate }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    if (onCopy) onCopy(message.content);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group py-5 px-4 sm:px-6 rounded-2xl transition-colors ${
        isUser ? 'bg-card/40 border border-border/40' : 'bg-card/80 border border-border'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-4 items-start">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            isUser
              ? 'bg-accent/20 border border-accent/30 text-accent'
              : 'bg-gradient-to-tr from-accent to-accent-purple text-white'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>

        {/* Content Body */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-textMain">{isUser ? 'You' : 'AI HUB'}</span>
              {!isUser && message.model && (
                <span className="text-[10px] text-textDark bg-muted px-2 py-0.5 rounded font-mono">
                  {message.model}
                </span>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                title="Copy message"
                className="p-1.5 rounded-lg text-textMuted hover:text-textMain hover:bg-muted transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {!isUser && onRegenerate && !isStreaming && (
                <button
                  onClick={onRegenerate}
                  title="Regenerate response"
                  className="p-1.5 rounded-lg text-textMuted hover:text-textMain hover:bg-muted transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  title="Delete message"
                  className="p-1.5 rounded-lg text-textMuted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Formatted Markdown Content */}
          <div
            className={`text-sm text-textMain leading-relaxed whitespace-pre-wrap break-words ${
              isStreaming ? 'streaming-cursor' : ''
            }`}
          >
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
}
