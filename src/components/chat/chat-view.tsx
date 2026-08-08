'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DBChat, DBMessage } from '@/lib/db';
import { AIModel } from '@/lib/ai/types';
import { useTranslation } from '@/i18n/context';
import { LanguageSelector } from '@/components/ui/language-selector';
import { ModelSelector } from './model-selector';
import { MessageItem } from './message-item';
import { ChatInput } from './chat-input';
import { Menu, Sparkles, AlertCircle, Code, Lightbulb, FileText, Zap } from 'lucide-react';

interface ChatViewProps {
  chat: DBChat | null;
  messages: DBMessage[];
  selectedModelId: string;
  onSelectModel: (model: AIModel) => void;
  onSendMessage: (content: string, modelId: string) => Promise<void>;
  onClearChat: () => void;
  onToggleSidebarMobile: () => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  streamingContent: string;
  errorMessage: string | null;
}

export function ChatView({
  chat,
  messages,
  selectedModelId,
  onSelectModel,
  onSendMessage,
  onClearChat,
  onToggleSidebarMobile,
  isGenerating,
  onStopGeneration,
  streamingContent,
  errorMessage,
}: ChatViewProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    const promptText = input.trim();
    setInput('');
    await onSendMessage(promptText, selectedModelId);
  };

  const handleStarterClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleRegenerate = async () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      await onSendMessage(lastUserMsg.content, selectedModelId);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0A0A0A] overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 border-b border-border bg-[#0A0A0A]/80 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="md:hidden p-2 rounded-xl text-textMuted hover:text-textMain hover:bg-card transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <ModelSelector selectedModelId={selectedModelId} onSelectModel={onSelectModel} />
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          {chat && (
            <span className="hidden sm:inline text-xs text-textDark max-w-[180px] truncate font-medium">
              {chat.title}
            </span>
          )}
        </div>
      </header>

      {/* Main Chat Thread Area */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-6 custom-scrollbar">
        {errorMessage && (
          <div className="max-w-3xl mx-auto mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 shadow-sm animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {messages.length === 0 && !streamingContent ? (
          <div className="max-w-2xl mx-auto my-auto pt-12 pb-6 px-4 text-center space-y-8 animate-in fade-in duration-300">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent to-accent-purple flex items-center justify-center mx-auto shadow-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {t('howCanIHelp')}
              </h1>
              <p className="text-xs sm:text-sm text-textMuted max-w-md mx-auto leading-relaxed">
                {t('aiSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <StarterCard
                icon={<Code className="w-4 h-4 text-accent" />}
                title={t('starterCode')}
                subtitle="TypeScript SSE stream handler"
                onClick={() => handleStarterClick('Write a clean TypeScript example of an SSE stream handler for Next.js App Router.')}
              />
              <StarterCard
                icon={<FileText className="w-4 h-4 text-emerald-400" />}
                title={t('starterWriting')}
                subtitle="Product launch announcement"
                onClick={() => handleStarterClick('Draft a modern, engaging product launch announcement for AI HUB AI.')}
              />
              <StarterCard
                icon={<Lightbulb className="w-4 h-4 text-amber-400" />}
                title={t('starterBrainstorm')}
                subtitle="Architecture ideas for multi-model AI"
                onClick={() => handleStarterClick('Brainstorm 5 innovative architectural features for a multi-model AI platform.')}
              />
              <StarterCard
                icon={<Zap className="w-4 h-4 text-purple-400" />}
                title={t('starterTest')}
                subtitle="Salom! / Привет! / Hello!"
                onClick={() => handleStarterClick('Привет! Salom! Hello! Tell me how AI HUB AI can assist me today.')}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={{
                  id: msg.id,
                  role: msg.role,
                  content: msg.content,
                  model: 'AI HUB AI',
                }}
                onRegenerate={handleRegenerate}
              />
            ))}

            {isGenerating && streamingContent && (
              <MessageItem
                message={{
                  id: 'streaming-temp',
                  role: 'assistant',
                  content: streamingContent,
                  model: 'AI HUB AI',
                }}
                isStreaming={true}
              />
            )}

            {isGenerating && !streamingContent && (
              <div className="py-4 px-6 rounded-2xl bg-card/60 border border-border/60 max-w-4xl mx-auto flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" />
                </div>
                <span className="text-xs text-textMuted animate-pulse font-mono">
                  Thinking with AI HUB AI...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent pt-4">
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onStop={onStopGeneration}
          onClear={onClearChat}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
}

function StarterCard({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="p-3.5 rounded-2xl border border-border bg-card/60 hover:bg-card hover:border-borderHover cursor-pointer transition-all space-y-1.5 shadow-sm group"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-muted group-hover:scale-110 transition-transform">{icon}</div>
        <span className="font-semibold text-xs text-textMain">{title}</span>
      </div>
      <p className="text-[11px] text-textMuted line-clamp-1">{subtitle}</p>
    </div>
  );
}
