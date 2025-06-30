import { NextRequest, NextResponse } from 'next/server';
import Character from '@/models/Character';
import { findAll, createOne, updateOne, deleteOne } from '@/lib/db-utils';
import { CreateCharacterRequest } from '@/types/character';

function isAdmin(request: NextRequest) {
  const auth = request.headers.get('authorization');
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!auth || !adminUser || !adminPass) return false;
  const [type, credentials] = auth.split(' ');
  if (type !== 'Basic') return false;
  const [user, pass] = Buffer.from(credentials, 'base64').toString().split(':');
  return user === adminUser && pass === adminPass;
}

export async function GET() {
  try {
    const characters = await findAll(Character, { isActive: true }, { createdAt: -1 });
    return NextResponse.json(characters);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body: CreateCharacterRequest = await request.json();
    const character = await createOne(Character, { ...body, isActive: true });
    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { _id, ...update } = await request.json();
    const updated = await updateOne(Character, { _id }, update);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { _id } = await request.json();
    const deleted = await updateOne(Character, { _id }, { isActive: false });
    return NextResponse.json(deleted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}
