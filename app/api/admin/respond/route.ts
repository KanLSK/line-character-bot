import { NextRequest, NextResponse } from 'next/server';
import { adminRespondToUser } from '../../../../services/human-admin-service';
import { logger } from '../../../../utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, adminId, message } = body;

    if (!userId || !adminId || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, adminId, message' },
        { status: 400 }
      );
    }

    const result = await adminRespondToUser(userId, adminId, message);
    
    return NextResponse.json(result);

  } catch (error) {
    logger.error('Error in admin respond endpoint', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
