import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserServer } from '@/lib/auth/auth';
import { getChat, getMessages, updateChat, deleteChat } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUserServer();
    const chat = getChat(params.id);

    if (!chat || chat.userId !== user.id) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const messages = getMessages(params.id);
    return NextResponse.json({ success: true, chat, messages });
  } catch (error) {
    console.error('Error fetching chat details:', error);
    return NextResponse.json({ error: 'Failed to fetch chat details' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUserServer();
    const chat = getChat(params.id);

    if (!chat || chat.userId !== user.id) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const body = await req.json();
    const { title, model } = body as { title?: string; model?: string };

    const updated = updateChat(params.id, { title, model });
    return NextResponse.json({ success: true, chat: updated });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUserServer();
    const chat = getChat(params.id);

    if (!chat || chat.userId !== user.id) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    deleteChat(params.id);
    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
