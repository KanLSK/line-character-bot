/**
 * Detects if the message is a command (starts with /) and extracts command and args.
 */
export function preprocessUserMessage(message: string): { isCommand: boolean; command?: string; args?: string[]; text: string } {
  const trimmed = message.trim();
  if (trimmed.startsWith('/')) {
    const [cmd, ...args] = trimmed.slice(1).split(' ');
    return { isCommand: true, command: cmd, args, text: trimmed };
  }
  return { isCommand: false, text: trimmed };
}

/**
 * Sanitizes user input: removes harmful content and limits length to 500 chars.
 */
export function sanitizeUserInput(input: string): string {
  let sanitized = input.replace(/[<>]/g, ''); // rudimentary XSS filter
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  if (sanitized.length > 500) {
    sanitized = sanitized.slice(0, 500);
  }
  return sanitized;
} 