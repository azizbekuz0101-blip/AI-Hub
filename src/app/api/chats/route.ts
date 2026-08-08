import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserServer } from '@/lib/auth/auth';
import { getChats, createChat } from '@/lib/db';

export async function GET() {
  try {
    const user = getCurrentUserServer();
    const chats = getChats(user.id);
    return NextResponse.json({ success: true, chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUserServer();
    const body = await req.json();
    const { title, model } = body as { title?: string; model?: string };

    const chat = createChat(user.id, title || 'New Chat', model || 'openrouter-free');
    return NextResponse.json({ success: true, chat }, { status: 201 });
  } catch (error) {
    console.error('Error creating new chat:', error);
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}
