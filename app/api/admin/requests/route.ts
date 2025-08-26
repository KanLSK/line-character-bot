import { NextResponse } from 'next/server';
import { getPendingAdminRequests } from '../../../../services/human-admin-service';
import { logger } from '../../../../utils/logger';

export async function GET() {
  try {
    const requests = await getPendingAdminRequests();
    
    return NextResponse.json({
      success: true,
      requests,
      count: requests.length
    });

  } catch (error) {
    logger.error('Error getting pending admin requests', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
