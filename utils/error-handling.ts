/**
 * Converts OpenAI errors to user-friendly messages.
 */
export function handleOpenAIError(error: unknown): string {
  if (!error) return 'Oops! Something went wrong. Mind trying that again? 🔧';
  const err = error as { code?: string; message?: string };
  if (err.code === 'rate_limit_exceeded') {
    return 'I need a moment to think. Try again in a few seconds! 🤔';
  }
  if (err.code === 'insufficient_quota') {
    return "I'm temporarily unavailable. Please try again later! 😅";
  }
  if (err.message && err.message.includes('quota')) {
    return "I'm temporarily unavailable. Please try again later! 😅";
  }
  if (err.message && err.message.includes('network')) {
    return 'Oops! Something went wrong. Mind trying that again? 🔧';
  }
  return err.message || 'Oops! Something went wrong. Mind trying that again? 🔧';
}

/**
 * Exponential backoff retry for async functions.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
    }
  }
  throw lastError;
} 