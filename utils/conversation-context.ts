import { logger } from './logger';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
  context?: string;
}

export interface UserContext {
  userId: string;
  messages: ConversationMessage[];
  preferences: {
    language: 'thai' | 'english' | 'mixed';
    responseLength: 'short' | 'medium' | 'long';
    topics: string[];
    avoidTopics: string[];
  };
  relationshipLevel: 'new' | 'familiar' | 'close';
  lastInteraction: Date;
  interactionCount: number;
}

// In-memory storage for conversation contexts
const conversationContexts = new Map<string, UserContext>();

export function getContext(userId: string): ConversationMessage[] {
  const context = conversationContexts.get(userId);
  return context?.messages || [];
}

export function updateContext(userId: string, message: ConversationMessage): void {
  let context = conversationContexts.get(userId);
  
  if (!context) {
    context = {
      userId,
      messages: [],
      preferences: {
        language: 'thai',
        responseLength: 'medium',
        topics: [],
        avoidTopics: []
      },
      relationshipLevel: 'new',
      lastInteraction: new Date(),
      interactionCount: 0
    };
    conversationContexts.set(userId, context);
  }
  
  // Add message to context
  context.messages.push(message);
  context.lastInteraction = new Date();
  context.interactionCount++;
  
  // Update relationship level based on interaction count
  if (context.interactionCount >= 50) {
    context.relationshipLevel = 'close';
  } else if (context.interactionCount >= 20) {
    context.relationshipLevel = 'familiar';
  }
  
  // Keep only last 20 messages to prevent context from getting too large
  if (context.messages.length > 20) {
    context.messages = context.messages.slice(-20);
  }
  
  // Extract user preferences from messages
  updateUserPreferences(context);
  
  logger.info('Context updated', { 
    userId, 
    messageCount: context.messages.length,
    relationshipLevel: context.relationshipLevel 
  });
}

function updateUserPreferences(context: UserContext): void {
  const recentMessages = context.messages.slice(-10);
  
  // Detect language preference
  const thaiCount = recentMessages.filter(m => 
    m.role === 'user' && /[\u0E00-\u0E7F]/.test(m.content)
  ).length;
  const englishCount = recentMessages.filter(m => 
    m.role === 'user' && /[a-zA-Z]/.test(m.content) && !/[\u0E00-\u0E7F]/.test(m.content)
  ).length;
  
  if (thaiCount > englishCount) {
    context.preferences.language = 'thai';
  } else if (englishCount > thaiCount) {
    context.preferences.language = 'english';
  } else {
    context.preferences.language = 'mixed';
  }
  
  // Detect response length preference
  const userMessages = recentMessages.filter(m => m.role === 'user');
  const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
  
  if (avgLength < 20) {
    context.preferences.responseLength = 'short';
  } else if (avgLength > 100) {
    context.preferences.responseLength = 'long';
  } else {
    context.preferences.responseLength = 'medium';
  }
  
  // Extract topics from user messages
  const topics = new Set<string>();
  userMessages.forEach(message => {
    const content = message.content.toLowerCase();
    if (content.includes('งาน') || content.includes('work')) topics.add('work');
    if (content.includes('เรียน') || content.includes('study')) topics.add('study');
    if (content.includes('ครอบครัว') || content.includes('family')) topics.add('family');
    if (content.includes('เพื่อน') || content.includes('friend')) topics.add('friends');
    if (content.includes('สุขภาพ') || content.includes('health')) topics.add('health');
    if (content.includes('ความรัก') || content.includes('love')) topics.add('love');
    if (content.includes('เงิน') || content.includes('money')) topics.add('money');
    if (content.includes('อนาคต') || content.includes('future')) topics.add('future');
  });
  
  context.preferences.topics = Array.from(topics);
}

export function resetContext(userId: string): void {
  conversationContexts.delete(userId);
  logger.info('Context reset', { userId });
}

export function getUserContext(userId: string): UserContext | undefined {
  return conversationContexts.get(userId);
}

export function getAllContexts(): Map<string, UserContext> {
  return conversationContexts;
} 