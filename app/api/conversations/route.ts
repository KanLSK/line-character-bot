import { NextRequest, NextResponse } from 'next/server';
import Conversation from '@/models/Conversation';
import { findAll, createOne } from '@/lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter: Record<string, string> = {};
    const lineUserId = searchParams.get('lineUserId');
    const characterId = searchParams.get('characterId');
    const sessionId = searchParams.get('sessionId');
    if (lineUserId) filter.lineUserId = lineUserId;
    if (characterId) filter.characterId = characterId;
    if (sessionId) filter.sessionId = sessionId;
    const conversations = await findAll(Conversation, filter, { timestamp: -1 }, 100);
    return NextResponse.json(conversations);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const conversation = await createOne(Conversation, { ...body, timestamp: new Date() });
    return NextResponse.json(conversation, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
} 
