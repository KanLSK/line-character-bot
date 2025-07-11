import { NextResponse } from 'next/server';

export function successResponse(data: any, message = 'Success') {
  return NextResponse.json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(message: string, status = 500, details?: any) {
  return NextResponse.json(
    {
      success: false,
      message,
      details,
    },
    { status }
  );
}

export function validationErrorResponse(errors: string[]) {
  return NextResponse.json(
    {
      success: false,
      message: 'Validation failed',
      errors,
    },
    { status: 400 }
  );
}