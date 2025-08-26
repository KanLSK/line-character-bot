import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db-utils';
import Character from '../../../models/Character';
import { ResponseTemplateManager } from '../../../utils/response-templates';
import { ResponseValidator } from '../../../utils/response-validator';
import { ContextManager } from '../../../utils/context-manager';
import { logger } from '../../../utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId') || 'test-user-123';
    const characterName = searchParams.get('character') || 'velorien';
    const message = searchParams.get('message') || 'เหงาจัง';

    await connectToDatabase();

    switch (action) {
      case 'test-templates':
        return await testResponseTemplates(characterName, message);
      
      case 'test-validation':
        return await testResponseValidation(characterName, message);
      
      case 'test-context':
        return await testContextManagement(userId, characterName, message);
      
      case 'test-all':
        return await testAllFeatures(userId, characterName, message);
      
      case 'clear-context':
        return await clearUserContext(userId, characterName);
      
      case 'get-context':
        return await getUserContext(userId, characterName);
      
      default:
        return NextResponse.json({
          success: true,
          message: 'Advanced Features Test Endpoint',
          availableActions: [
            'test-templates',
            'test-validation', 
            'test-context',
            'test-all',
            'clear-context',
            'get-context'
          ],
          usage: 'Add ?action=<action>&userId=<userId>&character=<character>&message=<message>'
        });
    }
  } catch (error) {
    logger.error('Error in advanced test endpoint', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function testResponseTemplates(characterName: string, message: string) {
  const character = await Character.findOne({ name: new RegExp(characterName, 'i'), isActive: true });
  if (!character) {
    return NextResponse.json({ success: false, error: `Character ${characterName} not found` });
  }

  const emotion = ResponseTemplateManager.detectEmotion(message);
  const context = ResponseTemplateManager.detectContext(message, []);
  const conditions = {
    timeOfDay: ResponseTemplateManager.getTimeOfDay(),
    userMood: [emotion]
  };

  const templateResponse = ResponseTemplateManager.selectRandomTemplate(
    character.name.toLowerCase(),
    emotion,
    context,
    conditions
  );

  const characterStyle = ResponseTemplateManager.getCharacterStyle(character.name.toLowerCase());

  return NextResponse.json({
    success: true,
    test: 'Response Templates',
    character: character.name,
    userMessage: message,
    detectedEmotion: emotion,
    detectedContext: context,
    conditions,
    templateResponse,
    characterStyle,
    availableTemplates: ResponseTemplateManager.getTemplatesForCharacter(character.name.toLowerCase()).length
  });
}

async function testResponseValidation(characterName: string, message: string) {
  const character = await Character.findOne({ name: new RegExp(characterName, 'i'), isActive: true });
  if (!character) {
    return NextResponse.json({ success: false, error: `Character ${characterName} not found` });
  }

  const characterStyle = ResponseTemplateManager.getCharacterStyle(character.name.toLowerCase());
  if (!characterStyle) {
    return NextResponse.json({ success: false, error: 'Character style not found' });
  }

  // Test with a sample response
  const sampleResponse = "เหงาเหรอครับ... ผมเข้าใจความรู้สึกนั้นดีเลย บางครั้งการเหงาก็เป็นเรื่องธรรมชาติ ลองหาอะไรทำดูไหมครับ เช่น อ่านหนังสือ หรือฟังเพลง ผมอยู่ตรงนี้เสมอนะครับ 💙";

  const validation = ResponseValidator.validateResponse(
    sampleResponse,
    characterStyle,
    message,
    []
  );

  const qualityMetrics = ResponseValidator.getResponseQualityMetrics(
    sampleResponse,
    characterStyle,
    message
  );

  const suggestions = ResponseValidator.suggestImprovements(sampleResponse, characterStyle);

  return NextResponse.json({
    success: true,
    test: 'Response Validation',
    character: character.name,
    userMessage: message,
    sampleResponse,
    validation,
    qualityMetrics,
    suggestions
  });
}

async function testContextManagement(userId: string, characterName: string, message: string) {
  const character = await Character.findOne({ name: new RegExp(characterName, 'i'), isActive: true });
  if (!character) {
    return NextResponse.json({ success: false, error: `Character ${characterName} not found` });
  }

  // Add some test messages to build context
  ContextManager.addMessage(userId, character._id!.toString(), 'user', 'สวัสดีครับ');
  ContextManager.addMessage(userId, character._id!.toString(), 'character', 'สวัสดีครับ! 😊 ดีใจที่ได้คุยกับคุณ');
  ContextManager.addMessage(userId, character._id!.toString(), 'user', message);

  const context = ContextManager.getContext(userId, character._id!.toString());
  const conditions = ContextManager.getContextualConditions(userId, character._id!.toString(), message);
  const summary = ContextManager.getConversationSummary(userId, character._id!.toString());
  const relevantHistory = ContextManager.getRelevantHistory(userId, character._id!.toString(), message);

  return NextResponse.json({
    success: true,
    test: 'Context Management',
    character: character.name,
    userId,
    context: {
      relationshipLevel: context.relationshipLevel,
      conversationMood: context.conversationMood,
      interactionCount: context.interactionCount,
      topics: context.topics,
      lastInteraction: context.lastInteraction
    },
    conditions,
    conversationSummary: JSON.parse(summary),
    relevantHistory: relevantHistory.map(m => ({
      sender: m.sender,
      content: m.content.substring(0, 50) + '...',
      emotion: m.emotion,
      timestamp: m.timestamp
    }))
  });
}

async function testAllFeatures(userId: string, characterName: string, message: string) {
  const character = await Character.findOne({ name: new RegExp(characterName, 'i'), isActive: true });
  if (!character) {
    return NextResponse.json({ success: false, error: `Character ${characterName} not found` });
  }
  // Test all features together
  const emotion = ResponseTemplateManager.detectEmotion(message);
  const context = ResponseTemplateManager.detectContext(message, []);
  const characterStyle = ResponseTemplateManager.getCharacterStyle(character.name.toLowerCase());
  
  // Get contextual conditions
  const conditions = ContextManager.getContextualConditions(userId, character._id!.toString(), message);
  
  // Check if should use template
  const shouldUseTemplate = ContextManager.shouldUseTemplate(userId, character._id!.toString(), emotion, context);
  
  // Get template response
  const templateResponse = shouldUseTemplate ? 
    ResponseTemplateManager.selectRandomTemplate(
      character.name.toLowerCase(),
      emotion,
      context,
      conditions
    ) : null;

  // Get personalized prompt
  const basePrompt = `You are ${character.name}. ${character.prompt}`;
  const personalizedPrompt = ContextManager.getPersonalizedPrompt(userId, character._id!.toString(), basePrompt);

  return NextResponse.json({
    success: true,
    test: 'All Advanced Features',
    character: character.name,
    userId,
    userMessage: message,
    detectedEmotion: emotion,
    detectedContext: context,
    characterStyle,
    conditions,
    shouldUseTemplate,
    templateResponse,
    personalizedPrompt: personalizedPrompt.substring(0, 200) + '...',
    features: {
      responseTemplates: true,
      responseValidation: true,
      contextManagement: true,
      personalizedPrompts: true,
      emotionDetection: true,
      contextDetection: true
    }
  });
}

async function clearUserContext(userId: string, characterName: string) {
  const character = await Character.findOne({ name: new RegExp(characterName, 'i'), isActive: true });
  if (!character) {
    return NextResponse.json({ success: false, error: `Character ${characterName} not found` });
  }

  ContextManager.clearContext(userId, character._id!.toString());

  return NextResponse.json({
    success: true,
    message: `Context cleared for user ${userId} and character ${character.name}`
  });
}

async function getUserContext(userId: string, characterName: string) {
  const character = await Character.findOne({ name: new RegExp(characterName, 'i'), isActive: true });
  if (!character) {
    return NextResponse.json({ success: false, error: `Character ${characterName} not found` });
  }

  const context = ContextManager.getContext(userId, character._id!.toString());
  const summary = ContextManager.getConversationSummary(userId, character._id!.toString());

  return NextResponse.json({
    success: true,
    character: character.name,
    userId,
    context: {
      relationshipLevel: context.relationshipLevel,
      conversationMood: context.conversationMood,
      interactionCount: context.interactionCount,
      topics: context.topics,
      lastInteraction: context.lastInteraction,
      messageCount: context.messages.length
    },
    conversationSummary: JSON.parse(summary),
    recentMessages: context.messages.slice(-5).map(m => ({
      sender: m.sender,
      content: m.content.substring(0, 100) + (m.content.length > 100 ? '...' : ''),
      emotion: m.emotion,
      timestamp: m.timestamp
    }))
  });
} 