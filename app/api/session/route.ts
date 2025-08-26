import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db-utils';
import UserSession from '../../../models/UserSession';
import { logger } from '../../../utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    let session = await UserSession.findOne({ userId });
    
    if (!session) {
      // Create new session if doesn't exist
      session = await UserSession.create({
        userId,
        currentMode: 'character',
        sessionStartTime: new Date(),
        lastActivity: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      session: {
        userId: session.userId,
        currentMode: session.currentMode,
        currentCharacterId: session.currentCharacterId,
        isWaitingForHuman: session.isWaitingForHuman,
        lastActivity: session.lastActivity,
        preferences: session.preferences
      }
    });

  } catch (error) {
    logger.error('Error getting user session', { error });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, mode, characterId, action } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    let session = await UserSession.findOne({ userId });
    
    if (!session) {
      session = await UserSession.create({
        userId,
        currentMode: mode || 'character',
        currentCharacterId: characterId,
        sessionStartTime: new Date(),
        lastActivity: new Date()
      });
    } else {
      // Update existing session
      const updateData: {
        lastActivity: Date;
        currentMode?: string;
        isWaitingForHuman?: boolean;
        humanAdminId?: string | null;
        currentCharacterId?: string;
      } = {
        lastActivity: new Date()
      };

      if (mode) {
        updateData.currentMode = mode;
        
        // Handle mode-specific logic
        if (mode === 'human_admin') {
          updateData.isWaitingForHuman = true;
          updateData.humanAdminId = null; // Will be assigned when admin responds
        } else if (mode === 'character') {
          updateData.isWaitingForHuman = false;
          updateData.humanAdminId = null;
        } else if (mode === 'medical_info') {
          updateData.isWaitingForHuman = false;
          updateData.humanAdminId = null;
        }
      }

      if (characterId) {
        updateData.currentCharacterId = characterId;
      }

      if (action === 'add_message') {
        const { message, sender } = body;
        if (message && sender) {
          session.conversationHistory.push({
            timestamp: new Date(),
            sender,
            message,
            mode: session.currentMode
          });
        }
      }

      await UserSession.updateOne({ userId }, updateData);
      session = await UserSession.findOne({ userId });
    }

    return NextResponse.json({
      success: true,
      session: {
        userId: session!.userId,
        currentMode: session!.currentMode,
        currentCharacterId: session!.currentCharacterId,
        isWaitingForHuman: session!.isWaitingForHuman,
        lastActivity: session!.lastActivity
      }
    });

  } catch (error) {
    logger.error('Error updating user session', { error });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
