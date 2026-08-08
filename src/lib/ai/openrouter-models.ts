import { AIModel } from './types';
import { modelCache } from './cache';

export const SYSTEM_FREE_MODEL: AIModel = {
  id: 'openrouter-free',
  name: 'Free AI',
  provider: 'openrouter',
  modelId: 'openrouter/free',
  description: 'Automatically selects an available free AI model.',
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

interface OpenRouterRawModel {
  id: string;
  name?: string;
  description?: string;
  context_length?: number;
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
    image?: string | number;
    request?: string | number;
  };
  top_provider?: {
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
}

export async function getOpenRouterModels(): Promise<AIModel[]> {
  const CACHE_KEY = 'openrouter_models_list';
  const cached = modelCache.get<AIModel[]>(CACHE_KEY);
  if (cached) {
    return cached;
  }

  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const apiKey = process.env.OPENROUTER_API_KEY;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const res = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers,
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API models returned status ${res.status}`);
    }

    const json = await res.json();
    const rawModels: OpenRouterRawModel[] = json.data || [];

    const parsedModels: AIModel[] = rawModels.map((m) => {
      const promptPricingStr = String(m.pricing?.prompt ?? '0');
      const compPricingStr = String(m.pricing?.completion ?? '0');

      const isFree =
        m.id.endsWith(':free') ||
        m.id === 'openrouter/free' ||
        (promptPricingStr === '0' && compPricingStr === '0');

      // Convert cost per single token to cost per 1M tokens
      const inputPrice = parseFloat(promptPricingStr) * 1_000_000;
      const outputPrice = parseFloat(compPricingStr) * 1_000_000;

      let category: AIModel['category'] = 'All';
      const lowerId = m.id.toLowerCase();
      const lowerName = (m.name || '').toLowerCase();

      if (isFree) {
        category = 'Free';
      } else if (
        lowerId.includes('reason') ||
        lowerId.includes('r1') ||
        lowerId.includes('o1') ||
        lowerId.includes('o3') ||
        lowerId.includes('qwq') ||
        lowerName.includes('reasoning')
      ) {
        category = 'Reasoning';
      } else if (
        lowerId.includes('flash') ||
        lowerId.includes('haiku') ||
        lowerId.includes('mini') ||
        lowerId.includes('8b') ||
        lowerId.includes('turbo')
      ) {
        category = 'Fast AI';
      } else if ((m.context_length || 0) >= 100000) {
        category = 'Long Context';
      }

      // Determine provider name from model ID prefix
      let providerName = 'openrouter';
      if (lowerId.startsWith('openai/')) providerName = 'openai';
      else if (lowerId.startsWith('anthropic/')) providerName = 'anthropic';
      else if (lowerId.startsWith('google/')) providerName = 'google';
      else if (lowerId.startsWith('x-ai/')) providerName = 'xai';
      else if (lowerId.startsWith('deepseek/')) providerName = 'deepseek';
      else if (lowerId.startsWith('moonshotai/') || lowerId.startsWith('kimi/')) providerName = 'kimi';
      else if (lowerId.startsWith('meta-llama/')) providerName = 'meta';

      return {
        id: m.id.replace('/', '-'),
        name: m.name || m.id,
        provider: providerName,
        modelId: m.id,
        description: m.description || `OpenRouter AI model ${m.name || m.id}`,
        category,
        enabled: true,
        isFree,
        supportsStreaming: true,
        supportsVision: m.architecture?.modality?.includes('image') || false,
        supportsFiles: false,
        supportsTools: false,
        contextLength: m.context_length || 4096,
        inputPrice,
        outputPrice,
      };
    });

    // Combine system free model with API models
    const allModels = [SYSTEM_FREE_MODEL, ...parsedModels];
    modelCache.set(CACHE_KEY, allModels, 10 * 60 * 1000);
    return allModels;
  } catch (error) {
    console.error('Failed to fetch models from OpenRouter API:', error);

    // Fallback to expired cache if available
    const staleCache = modelCache.getExpiredFallback<AIModel[]>(CACHE_KEY);
    if (staleCache && staleCache.length > 0) {
      return staleCache;
    }

    // Return system fallback models if API is unreachable
    return [SYSTEM_FREE_MODEL];
  }
}
