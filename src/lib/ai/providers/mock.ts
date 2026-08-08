import { AIProvider, AIModel, SendMessageOptions, AIResponse, AIStreamChunk } from '../types';
import { SYSTEM_FREE_MODEL } from '../openrouter-models';

export class MockProvider implements AIProvider {
  id = 'mock';
  name = 'Mock Provider';

  async getModels(): Promise<AIModel[]> {
    return [
      SYSTEM_FREE_MODEL,
      {
        id: 'llama-3.2-3b',
        name: 'Llama 3.2 3B (Workers AI)',
        provider: 'cloudflare',
        modelId: '@cf/meta/llama-3.2-3b-instruct',
        description: 'Ultra-fast lightweight LLM powered by Cloudflare Workers AI.',
        category: 'Fast AI',
        enabled: true,
        isFree: true,
        supportsStreaming: true,
        supportsVision: false,
        supportsFiles: false,
        supportsTools: false,
        contextLength: 128000,
        inputPrice: 0,
        outputPrice: 0,
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        modelId: 'openai/gpt-4o',
        description: 'High-intelligence flagship model for complex multi-modal tasks.',
        category: 'Recommended',
        enabled: true,
        isFree: false,
        supportsStreaming: true,
        supportsVision: true,
        supportsFiles: true,
        supportsTools: true,
        contextLength: 128000,
        inputPrice: 2.5,
        outputPrice: 10.0,
      },
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        modelId: 'anthropic/claude-3.5-sonnet',
        description: 'Leading model for code generation, complex reasoning and fluid writing.',
        category: 'Recommended',
        enabled: true,
        isFree: false,
        supportsStreaming: true,
        supportsVision: true,
        supportsFiles: true,
        supportsTools: true,
        contextLength: 200000,
        inputPrice: 3.0,
        outputPrice: 15.0,
      },
      {
        id: 'gemini-1-5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google',
        modelId: 'google/gemini-1.5-pro',
        description: 'State-of-the-art multi-modal model with immense 2M token context window.',
        category: 'Long Context',
        enabled: true,
        isFree: false,
        supportsStreaming: true,
        supportsVision: true,
        supportsFiles: true,
        supportsTools: true,
        contextLength: 2000000,
        inputPrice: 1.25,
        outputPrice: 5.0,
      },
      {
        id: 'grok-2',
        name: 'Grok 2',
        provider: 'xai',
        modelId: 'x-ai/grok-2',
        description: 'Real-time knowledge and fast reasoning powered by xAI.',
        category: 'Fast AI',
        enabled: true,
        isFree: false,
        supportsStreaming: true,
        supportsVision: false,
        supportsFiles: false,
        supportsTools: false,
        contextLength: 128000,
        inputPrice: 2.0,
        outputPrice: 10.0,
      },
      {
        id: 'deepseek-r1',
        name: 'DeepSeek R1',
        provider: 'deepseek',
        modelId: 'deepseek/deepseek-r1',
        description: 'First-class open-weights reasoning model with chain-of-thought analysis.',
        category: 'Reasoning',
        enabled: true,
        isFree: true,
        supportsStreaming: true,
        supportsVision: false,
        supportsFiles: false,
        supportsTools: false,
        contextLength: 64000,
        inputPrice: 0,
        outputPrice: 0,
      },
      {
        id: 'kimi-moonshot-v1',
        name: 'Kimi Moonshot',
        provider: 'kimi',
        modelId: 'moonshotai/moonshot-v1-8k',
        description: 'Long-text context AI specialist for in-depth analysis.',
        category: 'Long Context',
        enabled: true,
        isFree: true,
        supportsStreaming: true,
        supportsVision: false,
        supportsFiles: true,
        supportsTools: false,
        contextLength: 128000,
        inputPrice: 0,
        outputPrice: 0,
      },
    ];
  }

  async sendMessage(options: SendMessageOptions): Promise<AIResponse> {
    const lastUserMsg = options.messages.filter((m) => m.role === 'user').pop();
    const prompt = lastUserMsg ? lastUserMsg.content : 'Hello';
    
    const responseText = this.generateMockResponse(prompt, options.modelId);
    return {
      content: responseText,
      usage: {
        promptTokens: Math.ceil(prompt.length / 4),
        completionTokens: Math.ceil(responseText.length / 4),
        totalTokens: Math.ceil((prompt.length + responseText.length) / 4),
        estimatedCost: 0,
      },
    };
  }

  async *streamMessage(options: SendMessageOptions): AsyncGenerator<AIStreamChunk, void, unknown> {
    const lastUserMsg = options.messages.filter((m) => m.role === 'user').pop();
    const prompt = lastUserMsg ? lastUserMsg.content : 'Hello';
    const fullText = this.generateMockResponse(prompt, options.modelId);

    const words = fullText.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      if (options.signal?.aborted) {
        yield { content: '', done: true, error: 'Generation stopped by user.' };
        return;
      }

      const chunk = (i === 0 ? '' : ' ') + words[i];
      currentText += chunk;

      // Small delay between tokens to simulate realistic streaming
      await new Promise((resolve) => setTimeout(resolve, 35));

      yield {
        content: chunk,
        done: false,
      };
    }

    yield {
      content: '',
      done: true,
      usage: {
        promptTokens: Math.ceil(prompt.length / 4),
        completionTokens: Math.ceil(fullText.length / 4),
        totalTokens: Math.ceil((prompt.length + fullText.length) / 4),
        estimatedCost: 0,
      },
    };
  }

  private generateMockResponse(prompt: string, modelId: string): string {
    const p = prompt.toLowerCase();
    
    if (p.includes('привет') || p.includes('hello') || p.includes('расскажи')) {
      return `Привет! Я **AI HUB Assistant** (режим MOCK). 

Вы подключены к единой платформе мультимодельного ИИ. В реальном режиме я обращаюсь к OpenRouter API и вашим AI-провайдерам.

Вот что я могу вам предложить:
1. **Поддержка множества моделей**: GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, DeepSeek R1, Grok 2, Kimi.
2. **Стриминг ответов в реальном времени**: текст появляется плавно.
3. **Бесплатный режим Free AI**: использование \`openrouter/free\` без отдельной оплаты.
4. **Управление историями чатов**: создание, переименование, удаление и очистка.

Чем я могу помочь вам прямо сейчас?`;
    }

    if (p.includes('код') || p.includes('code') || p.includes('python') || p.includes('javascript')) {
      return `Конечно! Вот пример реализации универсальной функции на TypeScript:

\`\`\`typescript
export async function streamAIChat(modelId: string, prompt: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelId, messages: [{ role: 'user', content: prompt }] })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { value, done } = await reader.read();
    if (done) break;
    console.log(decoder.decode(value));
  }
}
\`\`\`

Этот код использует веб-стримы Fetch API для мгновенного отображения символов.`;
    }

    return `Спасибо за ваш запрос! 

*(Запрос обработан в демонстрационном MOCK режиме для модели: **${modelId}**)*

Ваше сообщение: "${prompt}"

Платформа **AI HUB** настроена и готова к работе. Чтобы подключить реальные модели AI, задайте \`OPENROUTER_API_KEY\` в вашем файле \`.env\` и установите \`MOCK_MODE=false\`.`;
  }
}
