import { NextRequest, NextResponse } from 'next/server';
import { endHumanAdminSession } from '../../../../services/human-admin-service';
import { logger } from '../../../../utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    const result = await endHumanAdminSession(userId);
    
    return NextResponse.json(result);

  } catch (error) {
    logger.error('Error in admin end session endpoint', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
