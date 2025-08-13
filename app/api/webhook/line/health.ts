import { NextRequest, NextResponse } from 'next/server';
import { healthCheck } from '../../../../utils/health-check';

export async function GET() {
  const result = await healthCheck();
  const status = result.env && result.database && result.lineApi ? 200 : 503;
  return NextResponse.json(result, { status });
} 