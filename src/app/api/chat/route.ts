import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserServer } from '@/lib/auth/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { checkCredits, recordUsage } from '@/lib/credits';
import { routeModel } from '@/lib/ai/router';
import { addMessage, createChat, getChat } from '@/lib/db';
import { ChatMessage } from '@/lib/ai/types';
import { AI_HUB_SYSTEM_PROMPT } from '@/lib/ai/prompts/ai-hub-system';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUserServer();

    // 1. Rate Limit check (IP & User)
    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(`${user.id}-${clientIp}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Daily limit reached or request rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // 2. Guest / Free User Daily Quota Check
    const guestLimit = parseInt(process.env.GUEST_DAILY_MESSAGES || '3', 10);
    const freeDailyLimit = parseInt(process.env.FREE_DAILY_MESSAGES || '20', 10);

    const credits = checkCredits(user.id);
    if (!credits.hasCredits) {
      return NextResponse.json(
        { error: 'Daily limit reached. Create a free account or wait until tomorrow to continue.' },
        { status: 402 }
      );
    }

    const body = await req.json();
    let { chatId, modelId, messages } = body as {
      chatId?: string;
      modelId: string;
      messages: ChatMessage[];
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
    }

    if (!modelId || modelId === 'ai-hub-ai') {
      modelId = 'openrouter-free';
    }

    // 3. IDOR Security Verification: Ensure user owns target chat
    if (chatId) {
      const existingChat = getChat(chatId);
      if (existingChat && existingChat.userId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized access to chat session.' }, { status: 403 });
      }
    } else {
      const firstUserMsg = messages.filter((m) => m.role === 'user').pop();
      const promptText = firstUserMsg ? firstUserMsg.content : 'New Chat';
      const newChat = createChat(user.id, promptText, modelId);
      chatId = newChat.id;
    }

    // Save latest user message to DB
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'user') {
      addMessage(chatId, 'user', lastMsg.content, modelId);
    }

    // Inject AI HUB AI System Prompt
    const prependedMessages: ChatMessage[] = [
      { id: 'system-ai-hub', role: 'system', content: AI_HUB_SYSTEM_PROMPT },
      ...messages,
    ];

    // Resolve provider adapter via Router
    const { provider, targetModelId } = routeModel(modelId);

    let fullAssistantResponse = '';
    let promptTokens = 0;
    let completionTokens = 0;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const sendChunk = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        sendChunk({ type: 'init', chatId });

        try {
          const generator = provider.streamMessage({
            modelId: targetModelId,
            messages: prependedMessages,
          });

          for await (const chunk of generator) {
            if (chunk.error) {
              sendChunk({ type: 'error', error: chunk.error });
              break;
            }

            if (chunk.content) {
              fullAssistantResponse += chunk.content;
              sendChunk({ type: 'delta', content: chunk.content });
            }

            if (chunk.usage) {
              promptTokens = chunk.usage.promptTokens || promptTokens;
              completionTokens = chunk.usage.completionTokens || completionTokens;
            }

            if (chunk.done) {
              break;
            }
          }

          if (promptTokens === 0) {
            const promptChars = messages.reduce((acc, m) => acc + (m.content || '').length, 0);
            promptTokens = Math.ceil(promptChars / 4);
          }
          if (completionTokens === 0) {
            completionTokens = Math.ceil(fullAssistantResponse.length / 4);
          }

          if (fullAssistantResponse && chatId) {
            addMessage(chatId, 'assistant', fullAssistantResponse, modelId, promptTokens + completionTokens);
            recordUsage(user.id, chatId, modelId, promptTokens, completionTokens);
          }

          sendChunk({ type: 'done', chatId });
        } catch (streamErr: unknown) {
          console.error('Error during AI chat stream generation:', streamErr);
          sendChunk({
            type: 'error',
            error: 'AI HUB AI is temporarily unavailable. Please try again.',
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: unknown) {
    console.error('Unhandled Server Error in POST /api/chat:', error);
    return NextResponse.json(
      { error: 'Something went wrong on the server. Please try again.' },
      { status: 500 }
    );
  }
}
