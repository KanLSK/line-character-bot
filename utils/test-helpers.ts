import crypto from 'crypto';
import { LineWebhookEvent, LineMessageEvent } from '../types/line';

/**
 * Generate a mock Line webhook event (text message)
 */
export function mockTextMessageEvent(userId: string, text: string): LineMessageEvent {
  return {
    type: 'message',
    message: {
      id: '1234567890',
      type: 'text',
      text,
    },
    timestamp: Date.now(),
    source: {
      type: 'user',
      userId,
    },
    replyToken: 'dummyReplyToken',
    mode: 'active',
    webhookEventId: 'dummyWebhookEventId',
    deliveryContext: { isRedelivery: false },
  };
}

/**
 * Generate a valid X-Line-Signature header for a given body and secret
 */
export function generateLineSignature(body: string, channelSecret: string): string {
  return crypto
    .createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');
}

/**
 * Generate an invalid X-Line-Signature header (for negative tests)
 */
export function generateInvalidSignature(): string {
  return 'invalidsignature';
}

/**
 * Example usage:
 *
 * import { mockTextMessageEvent, generateLineSignature } from '../utils/test-helpers';
 *
 * const event = mockTextMessageEvent('U1234567890', 'Hello!');
 * const body = JSON.stringify({ events: [event] });
 * const signature = generateLineSignature(body, process.env.LINE_CHANNEL_SECRET!);
 */ 