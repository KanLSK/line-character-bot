export interface MessageContext {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const userContexts: Map<string, MessageContext[]> = new Map();
const MAX_CONTEXT = 6;

/**
 * Get the last N messages for a user.
 */
export function getContext(userId: string): MessageContext[] {
  return userContexts.get(userId) || [];
}

/**
 * Add a message to the user's context and trim to last 6.
 */
export function updateContext(userId: string, message: MessageContext): void {
  const context = userContexts.get(userId) || [];
  context.push(message);
  if (context.length > MAX_CONTEXT) {
    context.splice(0, context.length - MAX_CONTEXT);
  }
  userContexts.set(userId, context);
}

/**
 * Reset the user's context.
 */
export function resetContext(userId: string): void {
  userContexts.set(userId, []);
} 