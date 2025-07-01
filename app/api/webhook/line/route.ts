import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent, MessageEvent, TextMessage } from '@line/bot-sdk';
import lineClient from '../../../../lib/line-client';
import { verifySignature } from '../../../../utils/verify-signature';
import { validateLineEnv } from '../../../../utils/env-validation';
import { logger } from '../../../../utils/logger';
import { LineWebhookEvent } from '../../../../types/line';
import { createErrorResponse } from '../../../../utils/error-handler';

// Validate environment variables at the start
validateLineEnv();

/**
 * Main Line webhook handler for POST requests
 * Now includes debug info in the response for easier inspection.
 */
export async function POST(request: NextRequest) {
  logger.info('Webhook received', { method: request.method });

  try {
    // Get signature from headers
    const signature = request.headers.get('x-line-signature') || '';
    if (!signature) {
      logger.warn('No signature provided', { headers: request.headers });
      const errorRes = createErrorResponse('No signature provided', 400, { headers: Object.fromEntries(request.headers.entries()) });
      return NextResponse.json(errorRes, { status: 400 });
    }

    // Get raw body for signature verification
    const body = await request.text();
    if (!verifySignature(body, signature)) {
      logger.warn('Invalid signature', { signature });
      const errorRes = createErrorResponse('Invalid signature', 400, { signature, body });
      return NextResponse.json(errorRes, { status: 400 });
    }

    // Parse JSON body for event processing
    const json = JSON.parse(body);
    const events: LineWebhookEvent[] = json.events || [];

    await Promise.all(
      events.map(async (event) => {
        try {
          await handleEvent(event);
        } catch (error) {
          logger.error('Error handling event', { error });
        }
      })
    );

    // Return debug info in the response
    return NextResponse.json({
      message: 'OK',
      debug: {
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        eventCount: events.length,
        events,
      }
    });
  } catch (error) {
    logger.error('Webhook error', { error });
    const errorRes = createErrorResponse(error instanceof Error ? error : String(error), 500);
    return NextResponse.json(errorRes, { status: 500 });
  }
}

/**
 * Handles a single webhook event (message, follow, unfollow)
 */
async function handleEvent(event: LineWebhookEvent): Promise<void> {
  switch (event.type) {
    case 'message':
      await handleMessage(event as MessageEvent);
      break;
    case 'follow':
      await handleFollow(event);
      break;
    case 'unfollow':
      await handleUnfollow(event);
      break;
    default:
      logger.info('Unhandled event type', { type: event.type });
  }
}

/**
 * Handles a Line message event (echoes text messages)
 */
async function handleMessage(event: MessageEvent): Promise<void> {
  const { message, source } = event;
  if (message.type !== 'text') return;
  const textMessage = message as TextMessage;
  const userId = source.userId;
  if (!userId) {
    logger.error('No user ID in message event');
    return;
  }
  // Echo the message back (basic functionality)
  const replyMessage = {
    type: 'text' as const,
    text: `You said: ${textMessage.text}`,
  };
  try {
    await lineClient.replyMessage(event.replyToken, replyMessage);
    logger.info('Echoed message to user', { userId, text: textMessage.text });
  } catch (error) {
    logger.error('Error sending reply', { error });
  }
}

/**
 * Handles a Line follow event (sends welcome message)
 */
async function handleFollow(event: WebhookEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;
  const welcomeMessage = {
    type: 'text' as const,
    text: 'Welcome to Character Chat Bot! 🎭\n\nI\'m here to help you chat with amazing story characters. Type anything to get started!',
  };
  try {
    await lineClient.pushMessage(userId, welcomeMessage);
    logger.info('Sent welcome message to new follower', { userId });
  } catch (error) { 
    logger.error('Error sending welcome message', { error });
  }
}

/**
 * Handles a Line unfollow event (logs the event)
 */
async function handleUnfollow(event: WebhookEvent): Promise<void> {
  const userId = event.source.userId;
  logger.info(`User ${userId} unfollowed the bot`);
  // Add any cleanup logic here if needed
} 