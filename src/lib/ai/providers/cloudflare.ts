import { AIProvider, AIModel, SendMessageOptions, AIResponse, AIStreamChunk } from '../types';

export class CloudflareProvider implements AIProvider {
  id = 'cloudflare';
  name = 'Cloudflare Workers AI Provider';

  private get accountId(): string | undefined {
    return process.env.CLOUDFLARE_ACCOUNT_ID;
  }

  private get apiToken(): string | undefined {
    return process.env.CLOUDFLARE_API_TOKEN;
  }

  private get workerUrl(): string | undefined {
    return process.env.CLOUDFLARE_WORKER_URL;
  }

  async getModels(): Promise<AIModel[]> {
    return [
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
    ];
  }

  async sendMessage(options: SendMessageOptions): Promise<AIResponse> {
    const payloadModel = options.modelId || '@cf/meta/llama-3.2-3b-instruct';

    if (this.workerUrl) {
      const res = await fetch(this.workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: payloadModel,
          messages: options.messages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: options.signal,
      });

      if (!res.ok) throw new Error(`Cloudflare Worker error (${res.status})`);
      const data = await res.json();
      return { content: data.response || data.result?.response || '' };
    }

    if (!this.accountId || !this.apiToken) {
      throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN or CLOUDFLARE_WORKER_URL must be configured.');
    }

    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/@cf/meta/llama-3.2-3b-instruct`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: options.messages.map((m) => ({ role: m.role, content: m.content })),
      }),
      signal: options.signal,
    });

    if (!res.ok) throw new Error(`Cloudflare Workers AI API error (${res.status})`);
    const data = await res.json();
    return { content: data.result?.response || '' };
  }

  async *streamMessage(options: SendMessageOptions): AsyncGenerator<AIStreamChunk, void, unknown> {
    const payloadModel = options.modelId || '@cf/meta/llama-3.2-3b-instruct';

    let endpoint = this.workerUrl;
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (!endpoint) {
      if (!this.accountId || !this.apiToken) {
        yield { content: '', done: true, error: 'Cloudflare credentials (ACCOUNT_ID & API_TOKEN) not set.' };
        return;
      }
      endpoint = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/@cf/meta/llama-3.2-3b-instruct`;
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: payloadModel,
          messages: options.messages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
        signal: options.signal,
      });

      if (!response.ok) {
        yield { content: '', done: true, error: `Cloudflare Workers AI returned status ${response.status}` };
        return;
      }

      if (!response.body) {
        yield { content: '', done: true, error: 'No stream body returned from Cloudflare Workers AI.' };
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        if (options.signal?.aborted) {
          reader.cancel();
          yield { content: '', done: true, error: 'Generation stopped by user.' };
          return;
        }

        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          if (trimmed === 'data: [DONE]') {
            yield { content: '', done: true };
            return;
          }

          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(jsonStr);
              const chunkText = parsed.response || parsed.delta || parsed.content || '';
              if (chunkText) {
                yield { content: chunkText, done: false };
              }
            } catch {
              // Non-JSON SSE string chunk
              if (jsonStr) {
                yield { content: jsonStr, done: false };
              }
            }
          }
        }
      }

      yield { content: '', done: true };
    } catch (err: unknown) {
      if (options.signal?.aborted) {
        yield { content: '', done: true, error: 'Generation stopped by user.' };
        return;
      }
      console.error('Cloudflare stream error:', err);
      yield { content: '', done: true, error: 'Connection error while communicating with Cloudflare Workers AI.' };
    }
  }
}
