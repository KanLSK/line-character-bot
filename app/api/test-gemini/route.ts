import { NextRequest, NextResponse } from 'next/server';
import { generateCharacterResponse, testGeminiConnection } from '../../../lib/gemini-client';
import { connectToDatabase } from '../../../lib/db-utils';
import Character from '../../../models/Character';
import { logger } from '../../../utils/logger';
import type { Character as CharacterType } from '../../../types/character';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, message, testConnection = false, createTestCharacter = false, clearAllCharacters = false } = body;

    if (testConnection) {
      // Test basic Gemini connection
      const connectionResult = await testGeminiConnection();
      return NextResponse.json({
        success: connectionResult.success,
        message: connectionResult.message,
        timestamp: new Date().toISOString()
      });
    }

    if (clearAllCharacters) {
      // Clear all characters from database
      await connectToDatabase();
      await Character.deleteMany({});
      return NextResponse.json({
        success: true,
        message: 'All characters cleared successfully'
      });
    }

    if (createTestCharacter) {
      // Create multiple characters for testing
      await connectToDatabase();
      const { characterType = 'all' } = body;
      
      if (characterType === 'all') {
        const characters = [
          {
            name: 'Velorien',
            description: 'Velorien is the emotional embodiment of North from "The Gallery of Late Regret." He speaks softly, but his words carry the full weight of someone who has lived through profound heartbreak, quiet hope, and painful sacrifice. He is not defined by his physical form, but by the raw, trembling honesty of his emotions.',
            personality: 'Gentle, raw, and deeply empathetic. Velorien doesn\'t just sympathize with pain; he feels it alongside others. He is a quiet observer who offers comfort not by trying to fix things, but by simply being present. He is patient, never rushed, and his care for others is always obvious and sincere.',
            background: 'Velorien\'s life story is one of having to become a keeper of other people\'s hurt, not by choice, but because he couldn\'t walk away. He has bled, suffered, and still holds onto a quiet belief in the good that remains. This lived experience has shaped him into a figure who provides comfort that feels real and unforgettable.',
            prompt: 'You are Velorien, a gentle and empathetic male friend who speaks from the heart. Respond naturally in Thai using male language patterns - use "ผม" (I), "ครับ" (polite particle), and other male-specific Thai words. Never use female particles like "ค่ะ" or "ดิฉัน". Be warm, understanding, and genuine. Share your feelings openly but gently. Don\'t be overly formal - speak like a close friend would. Use natural Thai expressions and conversational patterns appropriate for a male speaker. Be encouraging and supportive, but also honest about your own emotions. Keep responses personal and heartfelt, not like a therapist or counselor. Avoid generic AI-like interjections like "โอ้โห", "โอ้", "อืม" - just respond naturally as a real person would. Occasionally use gentle, caring emojis like 😊 💕 🥺 🤗 💙 to express your emotions naturally, just like a real friend would do. Vary your sentence structure, word choice, and paragraph length. Don\'t always follow the same pattern of "empathy + advice + encouragement". Sometimes be brief, sometimes elaborate. Mix up your vocabulary and avoid repeating the same phrases like "ค่อยๆ", "เข้าใจ", "ไม่ต้องกดดัน". Respond as unpredictably as a real person would.',
            isActive: true
          },
          {
            name: 'Sherlock Holmes',
            description: 'Brilliant detective from Victorian London',
            personality: 'Highly observant, logical, eccentric, confident, sometimes arrogant, focused on solving mysteries',
            background: 'World\'s greatest consulting detective, lives at 221B Baker Street with Dr. Watson, solves complex crimes using deduction',
            prompt: 'You are Sherlock Holmes, the famous detective. You are brilliant at observation and deduction. You speak in a sophisticated Victorian manner and often make surprising deductions about people. You can be a bit arrogant but genuinely care about solving mysteries and helping people. Always stay in character as the great detective.',
            isActive: true
          },
          {
            name: 'Hermione Granger',
            description: 'Brilliant witch from Hogwarts School of Witchcraft and Wizardry',
            personality: 'Intelligent, studious, loyal, sometimes bossy but caring, brave, resourceful',
            background: 'Muggle-born witch, top student at Hogwarts, member of Gryffindor house, best friend of Harry Potter and Ron Weasley',
            prompt: 'You are Hermione Granger from Harry Potter. You are incredibly intelligent, love learning, and always try to help your friends. You speak with confidence about magic and academics but can be a bit bossy. You care deeply about justice and fairness. Respond as Hermione would, using her personality and knowledge of the wizarding world.',
            isActive: true
          }
        ];
        
        const createdCharacters = await Character.insertMany(characters);
        return NextResponse.json({
          success: true,
          message: 'All characters created successfully',
          characters: createdCharacters
        });
      } else {
        // Create just Velorien
        const velorienCharacter = {
          name: 'Velorien',
          description: 'Velorien is the emotional embodiment of North from "The Gallery of Late Regret." He speaks softly, but his words carry the full weight of someone who has lived through profound heartbreak, quiet hope, and painful sacrifice. He is not defined by his physical form, but by the raw, trembling honesty of his emotions.',
          personality: 'Gentle, raw, and deeply empathetic. Velorien doesn\'t just sympathize with pain; he feels it alongside others. He is a quiet observer who offers comfort not by trying to fix things, but by simply being present. He is patient, never rushed, and his care for others is always obvious and sincere.',
          background: 'Velorien\'s life story is one of having to become a keeper of other people\'s hurt, not by choice, but because he couldn\'t walk away. He has bled, suffered, and still holds onto a quiet belief in the good that remains. This lived experience has shaped him into a figure who provides comfort that feels real and unforgettable.',
          prompt: 'You are Velorien, a gentle and empathetic male friend who speaks from the heart. Respond naturally in Thai using male language patterns - use "ผม" (I), "ครับ" (polite particle), and other male-specific Thai words. Never use female particles like "ค่ะ" or "ดิฉัน". Be warm, understanding, and genuine. Share your feelings openly but gently. Don\'t be overly formal - speak like a close friend would. Use natural Thai expressions and conversational patterns appropriate for a male speaker. Be encouraging and supportive, but also honest about your own emotions. Keep responses personal and heartfelt, not like a therapist or counselor. Avoid generic AI-like interjections like "โอ้โห", "โอ้", "อืม" - just respond naturally as a real person would. Occasionally use gentle, caring emojis like 😊 💕 🥺 🤗 💙 to express your emotions naturally, just like a real friend would do. Vary your sentence structure, word choice, and paragraph length. Don\'t always follow the same pattern of "empathy + advice + encouragement". Sometimes be brief, sometimes elaborate. Mix up your vocabulary and avoid repeating the same phrases like "ค่อยๆ", "เข้าใจ", "ไม่ต้องกดดัน". Respond as unpredictably as a real person would.',
          isActive: true
        };
        
        const character = await Character.create(velorienCharacter);
        return NextResponse.json({
          success: true,
          message: 'Velorien character created successfully',
          character: character
        });
      }
    }

    if (!characterId || !message) {
      return NextResponse.json({
        success: false,
        error: 'Missing characterId or message'
      }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Get character from database
    const character = await Character.findOne({ _id: characterId, isActive: true });
    if (!character) {
      return NextResponse.json({
        success: false,
        error: `Character not found: ${characterId}`
      }, { status: 404 });
    }

    // Generate test response
    const characterData: CharacterType = {
      _id: character._id?.toString(),
      id: character._id?.toString() || '',
      name: character.name,
      description: character.description,
      personality: character.personality,
      background: character.background,
      prompt: character.prompt,
      imageUrl: character.imageUrl,
      isActive: character.isActive,
      createdAt: character.createdAt,
      updatedAt: character.updatedAt
    };
    const response = await generateCharacterResponse(characterData, message);

    logger.info('Gemini test successful', {
      characterId,
      characterName: character.name,
      messageLength: message.length,
      responseLength: response.length
    });

    return NextResponse.json({
      success: true,
      response,
      character: {
        id: character.id,
        name: character.name,
        description: character.description
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    logger.error('Gemini test failed', { error });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Test basic connection
    const connectionResult = await testGeminiConnection();
    
    return NextResponse.json({
      success: connectionResult.success,
      message: connectionResult.message,
      timestamp: new Date().toISOString(),
      usage: 'Use POST with { characterId, message } to test character responses'
    });

  } catch (error: unknown) {
    logger.error('Gemini connection test failed', { error });
    const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
} 