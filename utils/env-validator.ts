/**
 * Checks for the presence of required environment variables at startup.
 * Throws an error if any are missing.
 */
export function validateEnv(requiredVars: string[]) {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
} 