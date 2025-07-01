import { WebhookEvent, MessageEvent, TextMessage, FollowEvent, UnfollowEvent, User } from '@line/bot-sdk';

/**
 * All supported Line webhook event types
 */
export type LineWebhookEvent = WebhookEvent | MessageEvent | FollowEvent | UnfollowEvent;

/**
 * Supported message types for the bot
 */
export type LineMessageType = 'text' | 'image' | 'sticker';

/**
 * User profile data from Line
 */
export interface LineUserProfile extends User {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  language?: string;
}

/**
 * Bot response format for sending messages
 */
export interface LineBotResponse {
  type: LineMessageType;
  text?: string;
  altText?: string;
  [key: string]: any;
}

/**
 * Webhook request/response types
 */
export interface LineWebhookRequest {
  events: LineWebhookEvent[];
}

export interface LineWebhookResponse {
  message: string;
  [key: string]: any;
}

/**
 * Error response type for webhook/API
 */
export interface LineErrorResponse {
  error: string;
  details?: string;
}