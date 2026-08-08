import { AIProvider, AIModel, SendMessageOptions, AIResponse, AIStreamChunk } from '../types';
import { getOpenRouterModels } from '../openrouter-models';

export class OpenRouterProvider implements AIProvider {
  id = 'openrouter';
  name = 'OpenRouter Provider';

  private get baseUrl(): string {
    return process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  }

  private get apiKey(): string | undefined {
    return process.env.OPENROUTER_API_KEY;
  }

  async getModels(): Promise<AIModel[]> {
    return await getOpenRouterModels();
  }

  async sendMessage(options: SendMessageOptions): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured in server environment variables.');
    }

    const payloadModel = options.modelId === 'openrouter-free' ? 'openrouter/free' : options.modelId;

    const payload = {
      model: payloadModel,
      messages: options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
    };

    let attempt = 0;
    const maxRetries = payloadModel === 'openrouter/free' ? 2 : 1;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://aihub.app',
            'X-Title': 'AI HUB',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: options.signal,
        });

        if (!response.ok) {
          const errText = await response.text();
          if (response.status === 401) {
            throw new Error('Invalid OpenRouter API Key. Please verify OPENROUTER_API_KEY in server configuration.');
          } else if (response.status === 429) {
            throw new Error('OpenRouter API rate limit reached. Please try again in a few moments.');
          } else {
            throw new Error(`OpenRouter API error (${response.status}): ${errText || 'Provider service error'}`);
          }
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        return {
          content,
          usage: data.usage
            ? {
                promptTokens: data.usage.prompt_tokens || 0,
                completionTokens: data.usage.completion_tokens || 0,
                totalTokens: data.usage.total_tokens || 0,
              }
            : undefined,
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        attempt++;
        if (attempt <= maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
        }
      }
    }

    throw lastError || new Error('Failed to communicate with OpenRouter API.');
  }

  async *streamMessage(options: SendMessageOptions): AsyncGenerator<AIStreamChunk, void, unknown> {
    if (!this.apiKey) {
      yield {
        content: '',
        done: true,
        error: 'OPENROUTER_API_KEY is not configured in server environment variables.',
      };
      return;
    }

    const payloadModel = options.modelId === 'openrouter-free' ? 'openrouter/free' : options.modelId;

    const payload = {
      model: payloadModel,
      messages: options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
    };

    let attempt = 0;
    const maxRetries = payloadModel === 'openrouter/free' ? 2 : 0;

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://aihub.app',
            'X-Title': 'AI HUB',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: options.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            yield { content: '', done: true, error: 'Invalid OpenRouter API Key. Check server .env settings.' };
            return;
          } else if (response.status === 429) {
            yield { content: '', done: true, error: 'Rate limit exceeded. Please wait a moment before trying again.' };
            return;
          } else if (attempt < maxRetries) {
            attempt++;
            await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
            continue;
          } else {
            yield { content: '', done: true, error: 'AI service temporarily unavailable. Please try again.' };
            return;
          }
        }

        if (!response.body) {
          yield { content: '', done: true, error: 'Empty stream response received from AI provider.' };
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
                const deltaContent = parsed.choices?.[0]?.delta?.content || '';
                const finishReason = parsed.choices?.[0]?.finish_reason;

                if (deltaContent) {
                  yield { content: deltaContent, done: false };
                }

                if (parsed.usage) {
                  yield {
                    content: '',
                    done: false,
                    usage: {
                      promptTokens: parsed.usage.prompt_tokens || 0,
                      completionTokens: parsed.usage.completion_tokens || 0,
                      totalTokens: parsed.usage.total_tokens || 0,
                    },
                  };
                }

                if (finishReason && finishReason === 'stop') {
                  // Finalizing stream chunk
                }
              } catch {
                // Ignore partial chunk JSON parse errors
              }
            }
          }
        }

        yield { content: '', done: true };
        return;
      } catch (err: unknown) {
        if (options.signal?.aborted) {
          yield { content: '', done: true, error: 'Generation stopped by user.' };
          return;
        }

        if (attempt < maxRetries) {
          attempt++;
          await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        } else {
          console.error('OpenRouter streaming exception:', err);
          yield { content: '', done: true, error: 'Connection error while communicating with AI model.' };
          return;
        }
      }
    }
  }
}
