'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { DBChat } from '@/lib/db';
import { useTranslation } from '@/i18n/context';
import { LanguageSelector } from '@/components/ui/language-selector';
import {
  Plus,
  MessageSquare,
  Search,
  Settings,
  Shield,
  LogOut,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  chats: DBChat[];
  activeChatId?: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onDeleteChat: (id: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const now = new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayMs = todayMs - 86400000;

  const todayChats: DBChat[] = [];
  const yesterdayChats: DBChat[] = [];
  const olderChats: DBChat[] = [];

  filteredChats.forEach((chat) => {
    const chatTime = new Date(chat.updatedAt).getTime();
    if (chatTime >= todayMs) {
      todayChats.push(chat);
    } else if (chatTime >= yesterdayMs) {
      yesterdayChats.push(chat);
    } else {
      olderChats.push(chat);
    }
  });

  const handleStartRename = (e: React.MouseEvent, chat: DBChat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(t('delete') + '?')) {
      onDeleteChat(id);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0E0E0E] border-r border-border text-textMain w-64 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent to-accent-purple flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-wide text-white">{t('brand')}</span>
            <span className="text-[10px] text-accent block font-mono font-medium -mt-1">{t('aiName')}</span>
          </div>
        </Link>

        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-textMuted hover:text-textMain hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="w-full py-2.5 px-3.5 rounded-xl bg-card hover:bg-muted border border-border hover:border-borderHover transition-all flex items-center justify-center gap-2 font-semibold text-xs text-textMain shadow-sm group"
        >
          <Plus className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
          <span>{t('newChat')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-textDark" />
          <input
            type="text"
            placeholder={t('searchChats')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-card/60 border border-border rounded-lg text-xs text-textMain placeholder:text-textDark focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 custom-scrollbar text-xs">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-textDark text-[11px]">No chat history yet.</div>
        ) : (
          <>
            {todayChats.length > 0 && (
              <ChatGroup
                title={t('today')}
                chats={todayChats}
                activeChatId={activeChatId}
                editingChatId={editingChatId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                onSelectChat={(id) => {
                  onSelectChat(id);
                  onCloseMobile();
                }}
                onStartRename={handleStartRename}
                onSaveRename={handleSaveRename}
                onCancelRename={handleCancelRename}
                onDelete={handleDelete}
              />
            )}

            {yesterdayChats.length > 0 && (
              <ChatGroup
                title={t('yesterday')}
                chats={yesterdayChats}
                activeChatId={activeChatId}
                editingChatId={editingChatId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                onSelectChat={(id) => {
                  onSelectChat(id);
                  onCloseMobile();
                }}
                onStartRename={handleStartRename}
                onSaveRename={handleSaveRename}
                onCancelRename={handleCancelRename}
                onDelete={handleDelete}
              />
            )}

            {olderChats.length > 0 && (
              <ChatGroup
                title={t('previous7days')}
                chats={olderChats}
                activeChatId={activeChatId}
                editingChatId={editingChatId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                onSelectChat={(id) => {
                  onSelectChat(id);
                  onCloseMobile();
                }}
                onStartRename={handleStartRename}
                onSaveRename={handleSaveRename}
                onCancelRename={handleCancelRename}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-border space-y-1.5">
        <div className="px-1 pb-1">
          <LanguageSelector className="w-full" />
        </div>

        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            pathname === '/settings' ? 'bg-muted text-white' : 'text-textMuted hover:text-textMain hover:bg-card'
          }`}
        >
          <Settings className="w-4 h-4 text-textMuted" />
          <span>{t('settings')}</span>
        </Link>

        <Link
          href="/admin"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            pathname === '/admin' ? 'bg-muted text-white' : 'text-textMuted hover:text-textMain hover:bg-card'
          }`}
        >
          <Shield className="w-4 h-4 text-accent-purple" />
          <span>{t('adminPanel')}</span>
        </Link>

        <div className="pt-2 border-t border-border/50 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 text-accent font-semibold text-xs flex items-center justify-center">
              U
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-medium text-textMain truncate">Demo User</span>
              <span className="block text-[10px] text-textDark truncate">user@aihub.app</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/login')}
            title={t('logout')}
            className="p-1.5 rounded-lg text-textDark hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block h-screen sticky top-0 z-30">{sidebarContent}</aside>
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}

function ChatGroup({
  title,
  chats,
  activeChatId,
  editingChatId,
  editTitle,
  setEditTitle,
  onSelectChat,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onDelete,
}: {
  title: string;
  chats: DBChat[];
  activeChatId?: string;
  editingChatId: string | null;
  editTitle: string;
  setEditTitle: (val: string) => void;
  onSelectChat: (id: string) => void;
  onStartRename: (e: React.MouseEvent, chat: DBChat) => void;
  onSaveRename: (e: React.MouseEvent, id: string) => void;
  onCancelRename: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="px-3 text-[10px] font-semibold text-textDark uppercase tracking-wider">{title}</div>
      {chats.map((chat) => {
        const isActive = chat.id === activeChatId;
        const isEditing = editingChatId === chat.id;

        return (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`group relative flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all ${
              isActive
                ? 'bg-card border border-border text-white shadow-sm font-semibold'
                : 'text-textMuted hover:text-textMain hover:bg-card/50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-accent' : 'text-textDark'}`} />
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-muted px-1.5 py-0.5 rounded text-xs text-white focus:outline-none border border-accent"
                  autoFocus
                />
              ) : (
                <span className="truncate text-xs">{chat.title}</span>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isEditing ? (
                <>
                  <button onClick={(e) => onSaveRename(e, chat.id)} className="p-1 hover:text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={onCancelRename} className="p-1 hover:text-textDark">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={(e) => onStartRename(e, chat)} className="p-1 hover:text-textMain">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => onDelete(e, chat.id)} className="p-1 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
