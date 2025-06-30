import { NextRequest, NextResponse } from 'next/server';

// Minimal Line webhook endpoint for testing
export async function POST(request: NextRequest) {
  // You can add your webhook logic here
  return NextResponse.json({ success: true, message: 'Webhook received!' });
} 