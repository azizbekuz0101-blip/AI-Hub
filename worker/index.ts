export interface Env {
  AI: {
    run: (model: string, options: Record<string, unknown>) => Promise<unknown>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = (await request.json()) as {
        messages: Array<{ role: string; content: string }>;
        model?: string;
        stream?: boolean;
      };

      const selectedModel = body.model || '@cf/meta/llama-3.1-8b-instruct';

      const aiResponse = await env.AI.run(selectedModel, {
        messages: body.messages,
        stream: body.stream !== false,
      });

      return new Response(aiResponse as ReadableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err: unknown) {
      console.error('Cloudflare Worker AI execution error:', err);
      return new Response(
        JSON.stringify({ error: 'AI HUB AI is temporarily unavailable.' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
