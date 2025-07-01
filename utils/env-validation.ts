/**
 * Utility to validate required environment variables for Line Bot integration.
 * Throws an error if any required variable is missing.
 */
const REQUIRED_ENV_VARS = [
  'LINE_CHANNEL_ACCESS_TOKEN',
  'LINE_CHANNEL_SECRET',
];

/**
 * Checks for missing required environment variables and throws an error if any are missing.
 */
export function validateLineEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for Line Bot: ${missing.join(', ')}`
    );
  }
} 