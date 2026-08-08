'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DBChat, DBMessage } from '@/lib/db';
import { AIModel } from '@/lib/ai/types';
import { Sidebar } from '@/components/chat/sidebar';
import { ChatView } from '@/components/chat/chat-view';

export default function ChatPage() {
  const [chats, setChats] = useState<DBChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('openrouter-free');

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch initial chat list
  useEffect(() => {
    async function loadChats() {
      try {
        const res = await fetch('/api/chats');
        const data = await res.json();
        if (data.chats && Array.isArray(data.chats)) {
          setChats(data.chats);
          if (data.chats.length > 0) {
            setActiveChatId(data.chats[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load chats:', err);
      }
    }
    loadChats();
  }, []);

  // Load active chat messages
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      try {
        const res = await fetch(`/api/chats/${activeChatId}`);
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
        if (data.chat && data.chat.model) {
          setSelectedModelId(data.chat.model);
        }
      } catch (err) {
        console.error('Failed to load chat details:', err);
      }
    }
    loadMessages();
  }, [activeChatId]);

  const handleNewChat = () => {
    setActiveChatId(undefined);
    setMessages([]);
    setErrorMessage(null);
    setStreamingContent('');
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setErrorMessage(null);
    setStreamingContent('');
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      const data = await res.json();
      if (data.chat) {
        setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)));
      }
    } catch (err) {
      console.error('Failed to rename chat:', err);
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await fetch(`/api/chats/${id}`, { method: 'DELETE' });
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleClearChat = async () => {
    if (activeChatId) {
      await handleDeleteChat(activeChatId);
    } else {
      setMessages([]);
    }
  };

  const handleSendMessage = async (promptContent: string, modelId: string) => {
    setErrorMessage(null);
    setIsGenerating(true);
    setStreamingContent('');

    // Local optimistic message add
    const tempUserMsg: DBMessage = {
      id: 'temp-' + Date.now(),
      chatId: activeChatId || 'temp',
      role: 'user',
      content: promptContent,
      model: modelId,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Create AbortController for cancellation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: activeChatId,
          modelId,
          messages: [...messages, tempUserMsg].map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Readable stream not supported.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let currentAccumulated = '';
      let serverChatId = activeChatId;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });
        const lines = textChunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === 'init' && data.chatId) {
                serverChatId = data.chatId;
                if (!activeChatId) {
                  setActiveChatId(data.chatId);
                }
              } else if (data.type === 'delta' && data.content) {
                currentAccumulated += data.content;
                setStreamingContent(currentAccumulated);
              } else if (data.type === 'error') {
                setErrorMessage(data.error || 'An error occurred during response generation.');
              }
            } catch {
              // Ignore non-JSON lines
            }
          }
        }
      }

      // Re-fetch chat messages and update sidebar history list
      if (serverChatId) {
        const resDetail = await fetch(`/api/chats/${serverChatId}`);
        const dataDetail = await resDetail.json();
        if (dataDetail.messages) {
          setMessages(dataDetail.messages);
        }

        const resChats = await fetch('/api/chats');
        const dataChats = await resChats.json();
        if (dataChats.chats) {
          setChats(dataChats.chats);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setErrorMessage('Generation stopped by user.');
      } else {
        const msg = err instanceof Error ? err.message : 'AI temporarily unavailable. Please try again.';
        setErrorMessage(msg);
      }
    } finally {
      setIsGenerating(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      <ChatView
        chat={chats.find((c) => c.id === activeChatId) || null}
        messages={messages}
        selectedModelId={selectedModelId}
        onSelectModel={(model) => setSelectedModelId(model.id)}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
        onToggleSidebarMobile={() => setIsOpenMobile(true)}
        isGenerating={isGenerating}
        onStopGeneration={handleStopGeneration}
        streamingContent={streamingContent}
        errorMessage={errorMessage}
      />
    </div>
  );
}
