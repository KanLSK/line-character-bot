import { generateCharacterResponse as generateGeminiResponse } from '../lib/gemini-client';
import { connectToDatabase } from '../lib/db-utils';
import Character from '../models/Character';
import { getContext, updateContext } from '../utils/conversation-context';
import { logger } from '../utils/logger';
import type { Character as CharacterType } from '../types/character';

interface GenerateResponseResult {
  success: boolean;
  response?: string;
  error?: string;
}

/**
 * Gets a character by ID from the database
 */
export async function getCharacterById(id: string): Promise<CharacterType | null> {
  try {
    await connectToDatabase();
    return await Character.findOne({ _id: id, isActive: true });
  } catch (error) {
    logger.error('Error getting character by ID', { error, characterId: id });
    return null;
  }
}

/**
 * Generates a character response using Google Gemini AI
 */
export async function generateCharacterResponse({
  characterId,
  userId,
  userMessage,
}: {
  characterId: string;
  userId: string;
  userMessage: string;
}): Promise<GenerateResponseResult> {
  try {
    // Get character from database
    const character = await getCharacterById(characterId);
    if (!character) {
      return {
        success: false,
        error: `Character not found: ${characterId}`,
      };
    }

    // Get conversation context
    const context = getContext(userId);
    const conversationHistory = context.map((m) => `${m.role}: ${m.content}`);

    // Generate response using Gemini with advanced features
    const aiResponse = await generateGeminiResponse(character, userMessage, conversationHistory, userId);

    // Update conversation context
    updateContext(userId, { role: 'user', content: userMessage, timestamp: new Date() });
    updateContext(userId, { role: 'assistant', content: aiResponse, timestamp: new Date() });

    logger.info('Character response generated successfully', {
      characterId,
      characterName: character.name,
      userId,
      responseLength: aiResponse.length
    });

    return { success: true, response: aiResponse };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error generating character response', { error, characterId, userId });
    return { success: false, error: errorMessage };
  }
} 