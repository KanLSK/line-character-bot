import { NextResponse } from 'next/server';
export function successResponse(data, message = 'Success') {
    return NextResponse.json({
        success: true,
        message,
        data,
    });
}
export function errorResponse(message, status = 500, details) {
    return NextResponse.json({
        success: false,
        message,
        details,
    }, { status });
}
export function validationErrorResponse(errors) {
    return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors,
    }, { status: 400 });
}
