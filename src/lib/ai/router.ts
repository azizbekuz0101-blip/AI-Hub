import { AIProvider } from './types';
import { MockProvider } from './providers/mock';
import { OpenRouterProvider } from './providers/openrouter';
import { CloudflareProvider } from './providers/cloudflare';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleProvider } from './providers/google';
import { XAIProvider } from './providers/xai';
import { DeepSeekProvider } from './providers/deepseek';
import { KimiProvider } from './providers/kimi';

export interface RouteResult {
  provider: AIProvider;
  targetModelId: string;
}

export function routeModel(modelId: string): RouteResult {
  const isMockMode = process.env.MOCK_MODE === 'true';
  const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== '');
  const hasCloudflareKey = Boolean(
    (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN) || process.env.CLOUDFLARE_WORKER_URL
  );

  // Route to Cloudflare Workers AI if model matches Llama 3.2 3B and Cloudflare credentials exist
  if (
    (modelId === 'llama-3.2-3b' || modelId === '@cf/meta/llama-3.2-3b-instruct') &&
    hasCloudflareKey &&
    !isMockMode
  ) {
    return {
      provider: new CloudflareProvider(),
      targetModelId: '@cf/meta/llama-3.2-3b-instruct',
    };
  }

  // If MOCK_MODE is enabled or OpenRouter API key is missing, return MockProvider safely
  if (isMockMode || !hasOpenRouterKey) {
    return {
      provider: new MockProvider(),
      targetModelId: modelId === 'openrouter-free' ? 'openrouter/free' : modelId,
    };
  }

  // System free model router
  if (modelId === 'openrouter-free' || modelId === 'openrouter/free') {
    return {
      provider: new OpenRouterProvider(),
      targetModelId: 'openrouter/free',
    };
  }

  // Un-normalize hyphenated modelId back to slash format if necessary (e.g. openai-gpt-4o -> openai/gpt-4o)
  let rawModelId = modelId;
  if (!rawModelId.includes('/') && rawModelId.includes('-')) {
    const parts = rawModelId.split('-');
    const knownPrefixes = ['openai', 'anthropic', 'google', 'x-ai', 'deepseek', 'moonshotai', 'meta-llama', 'mistralai', 'qwen', 'cohere'];
    for (const prefix of knownPrefixes) {
      if (rawModelId.startsWith(prefix + '-')) {
        rawModelId = prefix + '/' + rawModelId.slice(prefix.length + 1);
        break;
      }
    }
  }

  const lowerModel = rawModelId.toLowerCase();

  // Route by specific provider prefix if configured with direct API keys
  if (lowerModel.startsWith('openai/') && process.env.OPENAI_API_KEY) {
    return { provider: new OpenAIProvider(), targetModelId: rawModelId };
  } else if (lowerModel.startsWith('anthropic/') && process.env.ANTHROPIC_API_KEY) {
    return { provider: new AnthropicProvider(), targetModelId: rawModelId };
  } else if (lowerModel.startsWith('google/') && process.env.GOOGLE_API_KEY) {
    return { provider: new GoogleProvider(), targetModelId: rawModelId };
  } else if (lowerModel.startsWith('x-ai/') && process.env.XAI_API_KEY) {
    return { provider: new XAIProvider(), targetModelId: rawModelId };
  } else if (lowerModel.startsWith('deepseek/') && process.env.DEEPSEEK_API_KEY) {
    return { provider: new DeepSeekProvider(), targetModelId: rawModelId };
  } else if ((lowerModel.startsWith('moonshotai/') || lowerModel.startsWith('kimi/')) && process.env.KIMI_API_KEY) {
    return { provider: new KimiProvider(), targetModelId: rawModelId };
  }

  // Default universal routing through OpenRouter
  return {
    provider: new OpenRouterProvider(),
    targetModelId: rawModelId,
  };
}
