import { NextRequest, NextResponse } from 'next/server';
import { MessageEvent, TextMessage, FollowEvent, UnfollowEvent } from '@line/bot-sdk';
import lineClient from '../../../../lib/line-client';
import { verifySignature } from '../../../../utils/verify-signature';
import { validateLineEnv } from '../../../../utils/env-validation';
import { logger } from '../../../../utils/logger';
import { LineWebhookEvent } from '../../../../types/line';
import { createErrorResponse } from '../../../../utils/error-handler';
import { preprocessUserMessage, sanitizeUserInput } from '../../../../utils/message-preprocessing';
import { generateCharacterResponse } from '../../../../services/response-generator';
import { handleGeminiError } from '../../../../lib/gemini-client';
import { resetContext } from '../../../../utils/conversation-context';
import { connectToDatabase } from '../../../../lib/db-utils';
import Character from '../../../../models/Character';
import { ContextManager } from '../../../../utils/context-manager';

import { generateMedicalInfoResponse } from '../../../../services/medical-info-service';
import { requestHumanAdmin, endHumanAdminSession } from '../../../../services/human-admin-service';

// Validate environment variables at the start
validateLineEnv();

// In-memory user state
const userCharacterMap: Map<string, string> = new Map(); // userId -> characterId

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
    let json;
    try {
      json = JSON.parse(body);
    } catch {
      const errorRes = createErrorResponse('Malformed JSON body', 400, { body });
      return NextResponse.json(errorRes, { status: 400 });
    }
    const events: LineWebhookEvent[] = json.events || [];

    await Promise.all(
      events.map(async (event) => {
        try {
          await handleEvent(event);
        } catch (error: unknown) {
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
      await handleFollow(event as FollowEvent);
      break;
    case 'unfollow':
      await handleUnfollow(event as UnfollowEvent);
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
  // Default character for new users
  if (!userCharacterMap.has(userId)) {
    try {
      await connectToDatabase();
      const defaultCharacter = await Character.findOne({ name: 'Velorien', isActive: true });
      if (defaultCharacter) {
        userCharacterMap.set(userId, (defaultCharacter as any)._id.toString());
      } else {
        logger.error('Default character Velorien not found');
        userCharacterMap.set(userId, '689b995432dc108a22343309'); // Fallback ObjectId
      }
    } catch (error) {
      logger.error('Error setting default character', { error });
      userCharacterMap.set(userId, '689b995432dc108a22343309'); // Fallback ObjectId
    }
  }
  const { isCommand, command, args, text } = preprocessUserMessage(textMessage.text);
  if (isCommand && command === 'character') {
    const charName = args && args[0] ? args[0].toLowerCase() : '';
    
    try {
      await connectToDatabase();
      const character = await Character.findOne({ name: { $regex: new RegExp(charName, 'i') }, isActive: true }) as any;
      
      if (character) {
        const characterId = character._id.toString();
        userCharacterMap.set(userId, characterId);
        
        // Clear all context for this user
        resetContext(userId);
        
        // Clear context manager data for this user-character combination
        ContextManager.clearUserContext(userId, characterId);
        
        // Generate a natural character introduction
        const introPrompt = `You are ${character.name}. A user has just switched to chat with you. Give them a brief, natural greeting that shows your personality. Keep it under 200 characters and make it feel like a real person greeting someone they just met.`;
        
        try {
          const introResult = await generateCharacterResponse({ 
            characterId, 
            userId, 
            userMessage: introPrompt 
          });
          
          if (introResult.success && introResult.response) {
            await lineClient.replyMessage(event.replyToken, { type: 'text', text: introResult.response });
          } else {
            // Fallback introduction
            const fallbackIntro = `สวัสดีครับ! ผมคือ ${character.name} 😊\n\n${character.description.substring(0, 150)}...`;
            await lineClient.replyMessage(event.replyToken, { type: 'text', text: fallbackIntro });
          }
        } catch (introError) {
          logger.error('Error generating character intro', { error: introError, characterName: character.name });
          const fallbackIntro = `สวัสดีครับ! ผมคือ ${character.name} 😊\n\n${character.description.substring(0, 150)}...`;
          await lineClient.replyMessage(event.replyToken, { type: 'text', text: fallbackIntro });
        }
      } else {
        // Get list of available characters
        const availableCharacters = await Character.find({ isActive: true }).select('name');
        const available = availableCharacters.map(c => c.name).join(', ');
        await lineClient.replyMessage(event.replyToken, { type: 'text', text: `Invalid character. Available: ${available}` });
      }
    } catch (error) {
      logger.error('Error switching character', { error, characterName: charName });
      await lineClient.replyMessage(event.replyToken, { type: 'text', text: 'Sorry, I had trouble switching characters. Please try again.' });
    }
    return;
  }
  
  // Handle help command
  if (isCommand && command === 'help') {
    const helpMessage = `🏥 **Siriraj Medical Camp 2025 Chatbot**

**Commands:**
/character [name] - Switch to a different character
/help - Show this help message
/admin - Talk to human admin
/medical - Get medical camp information
/back - Return to character mode

**Available Characters:**
- Velorien (default) - Gentle and empathetic friend
- Sherlock - Brilliant detective
- Hermione - Intelligent witch
- Yoda - Wise Jedi Master
- Luna - Dreamy and mystical

**Modes:**
🎭 **Character Mode** - Chat with AI characters
👨‍⚕️ **Human Admin Mode** - Talk to real human admin
🏥 **Medical Info Mode** - Get professional medical camp information

**Features:**
- Natural conversations with AI characters
- Human admin support
- Medical camp information
- Multi-language support (Thai/English)

Just start chatting naturally! 😊`;
    
    await lineClient.replyMessage(event.replyToken, { type: 'text', text: helpMessage });
    return;
  }

  // Handle admin command
  if (isCommand && command === 'admin') {
    const adminRequest = await requestHumanAdmin(userId, text);
    await lineClient.replyMessage(event.replyToken, { type: 'text', text: adminRequest.message });
    return;
  }

  // Handle medical command
  if (isCommand && command === 'medical') {
    const medicalResponse = await generateMedicalInfoResponse(text, userId);
    await lineClient.replyMessage(event.replyToken, { type: 'text', text: medicalResponse.response });
    return;
  }

  // Handle back command
  if (isCommand && command === 'back') {
    const backResponse = await endHumanAdminSession(userId);
    await lineClient.replyMessage(event.replyToken, { type: 'text', text: backResponse.message });
    return;
  }
  
  // Regular message: sanitize and generate response
  const sanitized = sanitizeUserInput(text);
  const characterId = userCharacterMap.get(userId) || '689b995432dc108a22343309'; // Velorien's ObjectId
  
  try {
    const result = await generateCharacterResponse({ characterId, userId, userMessage: sanitized });
    if (result.success) {
      const response = result.response || '...';
      
      // Add quick reply buttons for better interaction
      const quickReplyItems = [
        {
          type: 'action' as const,
          action: {
            type: 'message' as const,
            label: '😊 How are you?',
            text: 'คุณเป็นยังไงบ้างครับ?'
          }
        },
        {
          type: 'action' as const,
          action: {
            type: 'message' as const,
            label: '🎭 Switch Character',
            text: '/character'
          }
        },
        {
          type: 'action' as const,
          action: {
            type: 'message' as const,
            label: '👨‍⚕️ Talk to Admin',
            text: '/admin'
          }
        },
        {
          type: 'action' as const,
          action: {
            type: 'message' as const,
            label: '🏥 Medical Info',
            text: '/medical'
          }
        },
        {
          type: 'action' as const,
          action: {
            type: 'message' as const,
            label: '❓ Help',
            text: '/help'
          }
        }
      ];
      
      await lineClient.replyMessage(event.replyToken, {
        type: 'text',
        text: response,
        quickReply: {
          items: quickReplyItems
        }
      });
    } else {
      await lineClient.replyMessage(event.replyToken, { type: 'text', text: result.error || 'Sorry, something went wrong.' });
    }
  } catch (error: unknown) {
    const friendly = handleGeminiError(error);
    await lineClient.replyMessage(event.replyToken, { type: 'text', text: friendly });
  }
}

/**
 * Handles a Line follow event (sends welcome message)
 */
async function handleFollow(event: FollowEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;
  
  // Set default character for new user
  userCharacterMap.set(userId, '689b995432dc108a22343309'); // Velorien's ObjectId
  resetContext(userId);
  
  // Get available characters for the welcome message
  let availableCharacters = 'Velorien, Sherlock, Hermione, Yoda, Luna';
  try {
    await connectToDatabase();
    const characters = await Character.find({ isActive: true }).select('name');
    availableCharacters = characters.map(c => c.name).join(', ');
  } catch {
    logger.error('Error fetching characters for welcome message');
  }
  
  const welcomeMessage = {
    type: 'text' as const,
    text: `สวัสดีครับ! ยินดีต้อนรับสู่ Siriraj Medical Camp 2025! 🎭

ผมคือ Velorien ตัวละครที่พร้อมจะคุยกับคุณ 😊

คุณสามารถคุยกับตัวละครอื่นๆ ได้โดยพิมพ์:
/character [ชื่อตัวละคร]

ตัวละครที่มี: ${availableCharacters}

ลองพิมพ์อะไรก็ได้เพื่อเริ่มคุยกันเลยครับ! 💙`,
    quickReply: {
      items: [
        {
          type: 'action' as const,
          action: {
            type: 'message' as const,
            label: '😊 สวัสดีครับ!',
            text: 'สวัสดีครับ! ยินดีที่ได้รู้จักครับ'
          }
        },
        {
          type: 'action' as const,
          action: {
            type: 'message' as const,
            label: '🎭 ดูตัวละครอื่น',
            text: '/character'
          }
        },
        {
          type: 'action' as const,
          action: {
            type: 'message' as const,
            label: '❓ วิธีใช้งาน',
            text: '/help'
          }
        }
      ]
    }
  };
  
  try {
    logger.info('Attempting to send welcome message', { 
      userId, 
      replyToken: event.replyToken,
      messageLength: welcomeMessage.text.length 
    });
    
    await lineClient.replyMessage(event.replyToken, welcomeMessage);
    logger.info('Sent welcome message to new follower', { userId });
  } catch (error) { 
    logger.error('Error sending welcome message', { 
      error, 
      userId, 
      replyToken: event.replyToken,
      messageLength: welcomeMessage.text.length 
    });
    
    // Try with a simpler message as fallback
    try {
      const fallbackMessage = {
        type: 'text' as const,
        text: 'สวัสดีครับ! ยินดีต้อนรับสู่ Siriraj Medical Camp 2025! 😊'
      };
      await lineClient.replyMessage(event.replyToken, fallbackMessage);
      logger.info('Sent fallback welcome message', { userId });
    } catch (fallbackError) {
      logger.error('Failed to send fallback welcome message', { fallbackError, userId });
      
      // Try with English as last resort
      try {
        const englishMessage = {
          type: 'text' as const,
          text: 'Hello! Welcome to Siriraj Medical Camp 2025! 😊'
        };
        await lineClient.replyMessage(event.replyToken, englishMessage);
        logger.info('Sent English welcome message', { userId });
      } catch (englishError) {
        logger.error('Failed to send English welcome message', { englishError, userId });
      }
    }
  }
}

/**
 * Handles a Line unfollow event
 */
async function handleUnfollow(event: UnfollowEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;
  
  // Clean up user data
  userCharacterMap.delete(userId);
  resetContext(userId);
  
  logger.info('User unfollowed', { userId });
} 