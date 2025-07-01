import crypto from 'crypto';

/**
 * Securely verifies the Line webhook signature using timing-safe comparison.
 * @param body - The raw request body as a string
 * @param signature - The signature from the 'x-line-signature' header
 * @returns true if the signature is valid, false otherwise
 */
export function verifySignature(body: string, signature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
  if (!channelSecret) {
    console.error('LINE_CHANNEL_SECRET is missing in environment variables.');
    return false;
  }
  if (!body || !signature) {
    console.error('Missing body or signature for verification.');
    return false;
  }
  try {
    const hash = crypto
      .createHmac('SHA256', channelSecret)
      .update(body, 'utf8')
      .digest('base64');
    const hashBuffer = Buffer.from(hash);
    const sigBuffer = Buffer.from(signature);
    const isValid =
      hashBuffer.length === sigBuffer.length &&
      crypto.timingSafeEqual(hashBuffer, sigBuffer);
    if (!isValid) {
      console.warn('Line signature verification failed.');
    }
    return isValid;
  } catch (error) {
    console.error('Error during signature verification:', error);
    return false;
  }
}
