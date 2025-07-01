import { Client, ClientConfig } from '@line/bot-sdk';

const config: ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

if (!config.channelAccessToken || !config.channelSecret) {
  throw new Error('Line Bot credentials are missing in environment variables.');
}

// Singleton pattern for Line client
let clientInstance: Client | null = null;

export function getLineClient(): Client {
  if (!clientInstance) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[LINE CLIENT] Creating new LINE client instance');
    }
    clientInstance = new Client(config);
  }
  return clientInstance;
}

export default getLineClient();

/**
 * Generalized retry utility for async LINE API calls
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 500): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[LINE CLIENT] Retry ${i + 1} failed:`, err);
      }
      if (i < retries - 1) await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw lastError;
}

/**
 * Example usage:
 *
 * import lineClient, { withRetry } from '../lib/line-client';
 *
 * await withRetry(() => lineClient.replyMessage(token, message));
 */ 