import { NextRequest, NextResponse } from 'next/server';
import Conversation from '@/models/Conversation';
import { findAll, createOne } from '@/lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter: any = {};
    if (searchParams.get('lineUserId')) filter.lineUserId = searchParams.get('lineUserId');
    if (searchParams.get('characterId')) filter.characterId = searchParams.get('characterId');
    if (searchParams.get('sessionId')) filter.sessionId = searchParams.get('sessionId');
    const conversations = await findAll(Conversation, filter, { timestamp: -1 }, 100);
    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const conversation = await createOne(Conversation, { ...body, timestamp: new Date() });
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
} 
