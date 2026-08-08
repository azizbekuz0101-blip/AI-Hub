import { AIProvider, AIModel, SendMessageOptions, AIResponse, AIStreamChunk } from '../types';
import { OpenRouterProvider } from './openrouter';
import { MockProvider } from './mock';

export class XAIProvider implements AIProvider {
  id = 'xai';
  name = 'xAI Provider';

  private fallbackProvider: AIProvider;

  constructor() {
    if (process.env.OPENROUTER_API_KEY && process.env.MOCK_MODE !== 'true') {
      this.fallbackProvider = new OpenRouterProvider();
    } else {
      this.fallbackProvider = new MockProvider();
    }
  }

  async getModels(): Promise<AIModel[]> {
    return this.fallbackProvider.getModels();
  }

  async sendMessage(options: SendMessageOptions): Promise<AIResponse> {
    return this.fallbackProvider.sendMessage(options);
  }

  async *streamMessage(options: SendMessageOptions): AsyncGenerator<AIStreamChunk, void, unknown> {
    yield* this.fallbackProvider.streamMessage(options);
  }
}
