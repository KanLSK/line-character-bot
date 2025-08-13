import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { Character } from '../types/character';
import { logger } from '../utils/logger';
import { ResponseTemplateManager } from '../utils/response-templates';
import { ResponseValidator } from '../utils/response-validator';
import { ContextManager } from '../utils/context-manager';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Configuration constants
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-pro';
const MAX_RESPONSE_LENGTH = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Generates a character response using Google Gemini AI
 */
export async function generateCharacterResponse(
  character: Character,
  userMessage: string,
  conversationHistory: string[] = [],
  userId?: string
): Promise<string> {
  logger.info('Generating character response with Gemini', {
    character: character.name,
    userMessage: userMessage.substring(0, 100) + '...',
    historyLength: conversationHistory.length
  });

  // Get character style and context
  const characterStyle = ResponseTemplateManager.getCharacterStyle(character.name.toLowerCase());
  const emotion = ResponseTemplateManager.detectEmotion(userMessage);
  const context = ResponseTemplateManager.detectContext(userMessage, conversationHistory);
  
  // Get contextual conditions
  const conditions = userId ? ContextManager.getContextualConditions(userId, character._id || '', userMessage) : null;
  
  // Reduce template usage to 5% for more natural responses
  const shouldUseTemplate = userId ? 
    (Math.random() < 0.05 && ContextManager.shouldUseTemplate(userId, character._id || '', emotion, context)) : 
    false;
  
  let response: string;
  
  if (shouldUseTemplate && characterStyle) {
    // Try to get template response first
    const templateResponse = ResponseTemplateManager.selectRandomTemplate(
      character.name.toLowerCase(),
      emotion,
      context,
      conditions
    );
    
    if (templateResponse) {
      response = templateResponse;
      logger.info('Using template response', { 
        character: character.name, 
        emotion, 
        context,
        templateUsed: true 
      });
    } else {
      // Fallback to AI generation
      response = await generateAIResponse(character, userMessage, conversationHistory, userId);
    }
  } else {
    // Generate AI response (80% of the time)
    response = await generateAIResponse(character, userMessage, conversationHistory, userId);
  }
  
  // Validate and improve response if needed
  if (characterStyle && userId) {
    const validation = ResponseValidator.validateResponse(
      response, 
      characterStyle, 
      userMessage, 
      conversationHistory
    );
    
    if (!validation.isValid) {
      logger.warn('Response validation failed', { 
        character: character.name, 
        issues: validation.issues,
        score: validation.score 
      });
      
      // Try to improve the response
      response = await improveResponse(character, userMessage, response, validation.suggestions);
    }
    
    // Log quality metrics
    const qualityMetrics = ResponseValidator.getResponseQualityMetrics(response, characterStyle, userMessage);
    logger.info('Response quality metrics', { 
      character: character.name, 
      metrics: qualityMetrics 
    });
  }
  
  // Update context
  if (userId) {
    ContextManager.addMessage(userId, character._id || '', 'user', userMessage, emotion, context);
    ContextManager.addMessage(userId, character._id || '', 'character', response);
  }
  
  logger.info('Character response generated successfully', { 
    character: character.name, 
    responseLength: response.length, 
    originalLength: response.length,
    templateUsed: shouldUseTemplate && !!ResponseTemplateManager.selectRandomTemplate(
      character.name.toLowerCase(),
      emotion,
      context,
      conditions
    )
  });
  
  return response;
}

/**
 * Builds a structured prompt for character response generation
 */
function buildCharacterPrompt(
  character: Character, 
  conversationHistory: string[], 
  userMessage: string
): string {
  const recentHistory = conversationHistory.slice(-6); // Last 6 messages (3 exchanges)
  const historyText = recentHistory.length > 0 
    ? `\n\nRecent conversation:\n${recentHistory.join('\n')}`
    : '';

  return `You are ${character.name}. 

CORE IDENTITY:
${character.description}

PERSONALITY:
${character.personality}

BACKGROUND:
${character.background}

CHARACTER INSTRUCTIONS:
${character.prompt}

IMPORTANT GUIDELINES:
- Respond as ${character.name} naturally, as if you're a real person
- Vary your sentence structure, vocabulary, and response length
- Don't be overly formal or robotic - be conversational
- Show genuine emotions and reactions
- Don't repeat the same phrases or patterns
- Keep responses under ${MAX_RESPONSE_LENGTH} characters
- Be appropriate for high school students (ages 14-18)
- If you don't know something, respond as your character would naturally

${historyText}

User: "${userMessage}"

${character.name}:`;
}

/**
 * Handles different types of Gemini errors and returns appropriate fallback messages
 */
export function handleGeminiError(error: unknown): string {
  console.error('Handling Gemini error:', error);

  const errorMessage = (error as Error)?.message?.toLowerCase() || '';
  const errorCode = (error as { code?: string })?.code || '';

  // Rate limit exceeded
  if (errorMessage.includes('rate limit') || errorMessage.includes('quota') || errorCode === '429') {
    return "I'm a bit busy right now! Please try again in a moment.";
  }

  // Content blocked by safety filters
  if (errorMessage.includes('safety') || errorMessage.includes('blocked') || errorMessage.includes('filter')) {
    return "I'd prefer not to discuss that topic. Let's talk about something else!";
  }

  // Network/API errors
  if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
    return "Sorry, I'm having trouble connecting right now. Please try again!";
  }

  // Invalid API key
  if (errorMessage.includes('api key') || errorMessage.includes('authentication') || errorCode === '401') {
    logger.error('Gemini API key error', { error });
    return "I'm having technical difficulties. Please contact support.";
  }

  // Generic error
  logger.error('Unhandled Gemini error', { error });
  return "Oops! Something went wrong. Let me try to respond differently.";
}

/**
 * Validates if the Gemini response is valid and appropriate
 */
function validateGeminiResponse(response: string): boolean {
  if (!response || response.trim().length === 0) {
    console.warn('Empty response from Gemini');
    return false;
  }

  if (response.length > MAX_RESPONSE_LENGTH * 2) {
    console.warn('Response too long from Gemini', { length: response.length });
    return false;
  }

  // Check for common error patterns
  const errorPatterns = [
    'i cannot',
    'i am not able',
    'i do not have',
    'i cannot provide',
    'i am an ai',
    'i am a language model',
    'i am not a real person'
  ];

  const lowerResponse = response.toLowerCase();
  for (const pattern of errorPatterns) {
    if (lowerResponse.includes(pattern)) {
      console.warn('Response contains error pattern', { pattern });
      return false;
    }
  }

  return true;
}

/**
 * Test function to verify Gemini connection
 */
export async function testGeminiConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent('Hello! Please respond with "Connection successful" if you can read this.');
    const response = await result.response;
    const text = response.text();

    if (text.toLowerCase().includes('connection successful')) {
      return { success: true, message: 'Gemini connection successful' };
    } else {
      return { success: false, message: 'Unexpected response from Gemini' };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Gemini connection failed: ${errorMessage}` };
  }
}

/**
 * Generate AI response using Gemini
 */
async function generateAIResponse(
  character: Character,
  userMessage: string,
  conversationHistory: string[],
  userId?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  // Get personalized prompt
  const basePrompt = buildCharacterPrompt(character, conversationHistory, userMessage);
  const personalizedPrompt = userId ? 
    ContextManager.getPersonalizedPrompt(userId, character._id || '', basePrompt) : 
    basePrompt;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`Gemini API attempt ${attempt}/${MAX_RETRIES}`);
      
      const result = await model.generateContent(personalizedPrompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini');
      }

      const validatedResponse = validateGeminiResponse(text);
      if (!validatedResponse) {
        throw new Error('Response validation failed');
      }

      // Limit response length for Line compatibility
      const truncatedResponse = text.length > MAX_RESPONSE_LENGTH 
        ? text.substring(0, MAX_RESPONSE_LENGTH - 3) + '...'
        : text;

      return truncatedResponse;

    } catch (error: unknown) {
      logger.error(`Gemini API attempt ${attempt} failed:`, error);
      
      if (attempt === MAX_RETRIES) {
        const fallbackMessage = handleGeminiError(error);
        logger.error('All Gemini API attempts failed', { error, character: character.name });
        return fallbackMessage;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }

  return handleGeminiError(new Error('Max retries exceeded'));
}

/**
 * Improve response based on validation suggestions
 */
async function improveResponse(
  character: Character,
  userMessage: string,
  originalResponse: string,
  suggestions: string[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    const improvementPrompt = `
You are ${character.name}. Improve this response based on the following suggestions:

Original response: "${originalResponse}"

Suggestions for improvement:
${suggestions.map(s => `- ${s}`).join('\n')}

User message: "${userMessage}"

Please provide an improved response that addresses these suggestions while maintaining your character's personality and style.
`;

    const result = await model.generateContent(improvementPrompt);
    const response = await result.response;
    const improvedText = response.text();

    if (!improvedText || improvedText.trim().length === 0) {
      return originalResponse; // Fallback to original
    }

    // Limit response length
    const truncatedResponse = improvedText.length > MAX_RESPONSE_LENGTH 
      ? improvedText.substring(0, MAX_RESPONSE_LENGTH - 3) + '...'
      : improvedText;

    logger.info('Response improved successfully', { 
      character: character.name,
      originalLength: originalResponse.length,
      improvedLength: truncatedResponse.length 
    });

    return truncatedResponse;

  } catch (error) {
    logger.error('Failed to improve response', { error, character: character.name });
    return originalResponse; // Fallback to original
  }
} 