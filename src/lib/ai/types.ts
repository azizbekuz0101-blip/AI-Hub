export interface AIModel {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  description: string;
  category?: 'Recommended' | 'Free' | 'Reasoning' | 'Fast AI' | 'Long Context' | 'All';
  enabled: boolean;
  isFree: boolean;
  isSystemModel?: boolean;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsFiles: boolean;
  supportsTools: boolean;
  contextLength: number;
  inputPrice: number; // USD per 1M tokens
  outputPrice: number; // USD per 1M tokens
  comingSoon?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
  model?: string;
}

export interface SendMessageOptions {
  modelId: string;
  messages: ChatMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface AIUsageInfo {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost?: number;
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
  error?: string;
  usage?: AIUsageInfo;
}

export interface AIResponse {
  content: string;
  usage?: AIUsageInfo;
}

export interface AIProvider {
  id: string;
  name: string;
  sendMessage(options: SendMessageOptions): Promise<AIResponse>;
  streamMessage(options: SendMessageOptions): AsyncGenerator<AIStreamChunk, void, unknown>;
  getModels(): Promise<AIModel[]>;
}
