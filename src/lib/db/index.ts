import fs from 'fs';
import path from 'path';

export interface DBUser {
  id: string;
  email: string;
  credits: number;
  createdAt: string;
}

export interface DBChat {
  id: string;
  userId: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  tokensUsed?: number;
  createdAt: string;
}

export interface DBUsage {
  id: string;
  userId: string;
  chatId?: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  createdAt: string;
}

interface LocalStore {
  users: Record<string, DBUser>;
  chats: Record<string, DBChat>;
  messages: Record<string, DBMessage[]>;
  usage: DBUsage[];
}

const STORE_PATH = path.join(process.cwd(), '.cache', 'db_store.json');

function loadStore(): LocalStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading local db_store.json:', err);
  }
  return {
    users: {},
    chats: {},
    messages: {},
    usage: [],
  };
}

function saveStore(store: LocalStore): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local db_store.json:', err);
  }
}

// Global in-memory instance for server lifecycle
const memoryStore: LocalStore = loadStore();

export function getOrCreateDefaultUser(userId: string = 'demo-user-123', email: string = 'demo@aihub.app'): DBUser {
  if (!memoryStore.users[userId]) {
    const defaultCredits = parseInt(process.env.FREE_USER_CREDITS || '1000', 10);
    memoryStore.users[userId] = {
      id: userId,
      email,
      credits: defaultCredits,
      createdAt: new Date().toISOString(),
    };
    saveStore(memoryStore);
  }
  return memoryStore.users[userId];
}

export function getUserCredits(userId: string): number {
  const user = getOrCreateDefaultUser(userId);
  return user.credits;
}

export function deductUserCredits(userId: string, amount: number): boolean {
  const user = getOrCreateDefaultUser(userId);
  if (user.credits < amount) return false;
  user.credits -= amount;
  saveStore(memoryStore);
  return true;
}

export function getChats(userId: string): DBChat[] {
  return Object.values(memoryStore.chats)
    .filter((c) => c.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getChat(chatId: string): DBChat | null {
  return memoryStore.chats[chatId] || null;
}

export function createChat(userId: string, title: string, model: string = 'openrouter-free'): DBChat {
  getOrCreateDefaultUser(userId);
  const id = 'chat-' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();

  const chat: DBChat = {
    id,
    userId,
    title,
    model,
    createdAt: now,
    updatedAt: now,
  };

  memoryStore.chats[id] = chat;
  memoryStore.messages[id] = [];
  saveStore(memoryStore);
  return chat;
}

export function updateChat(chatId: string, updates: Partial<Pick<DBChat, 'title' | 'model'>>): DBChat | null {
  const chat = memoryStore.chats[chatId];
  if (!chat) return null;

  if (updates.title !== undefined) chat.title = updates.title;
  if (updates.model !== undefined) chat.model = updates.model;
  chat.updatedAt = new Date().toISOString();

  saveStore(memoryStore);
  return chat;
}

export function deleteChat(chatId: string): boolean {
  if (!memoryStore.chats[chatId]) return false;
  delete memoryStore.chats[chatId];
  delete memoryStore.messages[chatId];
  saveStore(memoryStore);
  return true;
}

export function getMessages(chatId: string): DBMessage[] {
  return memoryStore.messages[chatId] || [];
}

export function addMessage(
  chatId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  model?: string,
  tokensUsed: number = 0
): DBMessage {
  if (!memoryStore.messages[chatId]) {
    memoryStore.messages[chatId] = [];
  }

  const msg: DBMessage = {
    id: 'msg-' + Math.random().toString(36).substring(2, 11),
    chatId,
    role,
    content,
    model,
    tokensUsed,
    createdAt: new Date().toISOString(),
  };

  memoryStore.messages[chatId].push(msg);

  // Update chat timestamp & auto-generate title if this is 1st user message
  const chat = memoryStore.chats[chatId];
  if (chat) {
    chat.updatedAt = new Date().toISOString();

    const userMsgs = memoryStore.messages[chatId].filter((m) => m.role === 'user');
    if (userMsgs.length === 1 && (chat.title === 'New Chat' || chat.title.startsWith('Chat '))) {
      const firstLine = content.split('\n')[0].trim();
      const autoTitle = firstLine.length > 45 ? firstLine.substring(0, 45) + '...' : firstLine;
      chat.title = autoTitle || 'New Chat';
    }
  }

  saveStore(memoryStore);
  return msg;
}

export function recordUsageLog(
  userId: string,
  chatId: string | undefined,
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  estimatedCost: number = 0
): DBUsage {
  const usage: DBUsage = {
    id: 'use-' + Math.random().toString(36).substring(2, 11),
    userId,
    chatId,
    modelId,
    inputTokens,
    outputTokens,
    estimatedCost,
    createdAt: new Date().toISOString(),
  };

  memoryStore.usage.push(usage);
  saveStore(memoryStore);
  return usage;
}

export function getUserUsageStats(userId: string): {
  totalMessages: number;
  totalTokens: number;
  totalEstimatedCost: number;
  creditsRemaining: number;
} {
  const user = getOrCreateDefaultUser(userId);
  const userChats = getChats(userId);

  let totalMessages = 0;
  for (const chat of userChats) {
    totalMessages += (memoryStore.messages[chat.id] || []).length;
  }

  const userUsage = memoryStore.usage.filter((u) => u.userId === userId);
  let totalTokens = 0;
  let totalEstimatedCost = 0;

  for (const u of userUsage) {
    totalTokens += (u.inputTokens || 0) + (u.outputTokens || 0);
    totalEstimatedCost += u.estimatedCost || 0;
  }

  return {
    totalMessages,
    totalTokens,
    totalEstimatedCost,
    creditsRemaining: user.credits,
  };
}
