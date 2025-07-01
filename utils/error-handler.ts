import { v4 as uuidv4 } from 'uuid';
import { logError } from './logger';

/**
 * Standard error response format for API/webhook errors
 */
export interface ErrorResponse {
  error: string;
  errorId: string;
  status: number;
  details?: unknown;
}

/**
 * Generates a structured error response and logs the error.
 * @param error - Error object or message
 * @param status - HTTP status code
 * @param details - Additional error details
 * @returns ErrorResponse
 */
export function createErrorResponse(
  error: Error | string,
  status: number = 500,
  details?: unknown
): ErrorResponse {
  const errorId = uuidv4();
  const message = typeof error === 'string' ? error : error.message;
  logError({
    errorId,
    message,
    status,
    details,
    stack: error instanceof Error ? error.stack : undefined,
  });
  return {
    error: message,
    errorId,
    status,
    details,
  };
}

/**
 * Example usage:
 *
 * // In an API route:
 * import { createErrorResponse } from '../utils/error-handler';
 *
 * try {
 *   // ...
 * } catch (err) {
 *   const errorRes = createErrorResponse(err, 500);
 *   return new Response(JSON.stringify(errorRes), { status: 500 });
 * }
 */ 