import { logger } from './logger';

export interface ConversationContext {
  userId: string;
  characterId: string;
  sessionId: string;
  messages: ConversationMessage[];
  userPreferences: UserPreferences;
  relationshipLevel: 'new' | 'familiar' | 'close';
  conversationMood: 'neutral' | 'positive' | 'negative' | 'mixed';
  topics: string[];
  lastInteraction: Date;
  interactionCount: number;
}

export interface ConversationMessage {
  id: string;
  timestamp: Date;
  sender: 'user' | 'character';
  content: string;
  emotion?: string;
  context?: string;
}

export interface UserPreferences {
  language: 'thai' | 'english' | 'mixed';
  responseLength: 'short' | 'medium' | 'long';
  formality: 'casual' | 'polite' | 'formal';
  topics: string[];
  avoidTopics: string[];
}

export class ContextManager {
  private static contexts = new Map<string, ConversationContext>();

  static getContext(userId: string, characterId: string): ConversationContext {
    const key = `${userId}_${characterId}`;
    
    if (!this.contexts.has(key)) {
      this.contexts.set(key, this.createNewContext(userId, characterId));
    }
    
    return this.contexts.get(key)!;
  }

  static addMessage(
    userId: string, 
    characterId: string, 
    sender: 'user' | 'character', 
    content: string,
    emotion?: string,
    contextParam?: string
  ): void {
    const contextKey = `${userId}_${characterId}`;
    const conversationContext = this.getContext(userId, characterId);
    
    const message: ConversationMessage = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      sender,
      content,
      emotion,
      context: contextParam
    };
    
    conversationContext.messages.push(message);
    conversationContext.lastInteraction = new Date();
    conversationContext.interactionCount++;
    
    // Update relationship level based on interaction count
    if (conversationContext.interactionCount >= 50) {
      conversationContext.relationshipLevel = 'close';
    } else if (conversationContext.interactionCount >= 20) {
      conversationContext.relationshipLevel = 'familiar';
    }
    
    // Update conversation mood
    conversationContext.conversationMood = this.analyzeConversationMood(conversationContext.messages);
    
    // Extract topics from recent messages
    conversationContext.topics = this.extractTopics(conversationContext.messages.slice(-10));
    
    logger.info('Context updated', { 
      userId, 
      characterId, 
      messageCount: conversationContext.messages.length,
      relationshipLevel: conversationContext.relationshipLevel 
    });
  }

  static getRelevantHistory(
    userId: string, 
    characterId: string, 
    currentMessage: string,
    maxMessages: number = 5
  ): ConversationMessage[] {
    const context = this.getContext(userId, characterId);
    const messages = context.messages.slice(-maxMessages * 2); // Get more messages for analysis
    
    // Filter messages based on relevance to current message
    const relevantMessages = messages.filter(message => {
      if (message.sender === 'user') {
        return this.calculateRelevance(message.content, currentMessage) > 0.3;
      }
      return true; // Include all character responses for context
    });
    
    return relevantMessages.slice(-maxMessages);
  }

  static getConversationSummary(userId: string, characterId: string): string {
    const context = this.getContext(userId, characterId);
    const recentMessages = context.messages.slice(-10);
    
    const userMessages = recentMessages.filter(m => m.sender === 'user');
    const characterMessages = recentMessages.filter(m => m.sender === 'character');
    
    const summary = {
      totalMessages: context.messages.length,
      recentUserMessages: userMessages.length,
      recentCharacterMessages: characterMessages.length,
      relationshipLevel: context.relationshipLevel,
      conversationMood: context.conversationMood,
      commonTopics: this.getCommonTopics(context.topics),
      userPreferences: context.userPreferences
    };
    
    return JSON.stringify(summary);
  }

  static updateUserPreferences(
    userId: string, 
    characterId: string, 
    preferences: Partial<UserPreferences>
  ): void {
    const context = this.getContext(userId, characterId);
    context.userPreferences = { ...context.userPreferences, ...preferences };
    
    logger.info('User preferences updated', { userId, characterId, preferences });
  }

  static getContextualConditions(
    userId: string, 
    characterId: string, 
    currentMessage: string
  ): any {
    const context = this.getContext(userId, characterId);
    const timeOfDay = this.getTimeOfDay();
    const userMood = this.detectUserMood(currentMessage);
    
    return {
      timeOfDay,
      userMood: [userMood],
      conversationLength: this.getConversationLength(context.messages),
      relationshipLevel: context.relationshipLevel,
      conversationMood: context.conversationMood,
      recentTopics: context.topics.slice(-3)
    };
  }

  static shouldUseTemplate(
    userId: string, 
    characterId: string, 
    emotion: string, 
    context: string
  ): boolean {
    const conversationContext = this.getContext(userId, characterId);
    
    // Use templates more for new users
    if (conversationContext.relationshipLevel === 'new') {
      return true;
    }
    
    // Use templates less for familiar users, but still occasionally
    if (conversationContext.relationshipLevel === 'familiar') {
      return Math.random() > 0.3; // 70% chance to use template
    }
    
    // Use templates sparingly for close users
    if (conversationContext.relationshipLevel === 'close') {
      return Math.random() > 0.7; // 30% chance to use template
    }
    
    return true;
  }

  static getPersonalizedPrompt(
    userId: string, 
    characterId: string, 
    basePrompt: string
  ): string {
    const context = this.getContext(userId, characterId);
    
    let personalizedPrompt = basePrompt;
    
    // Add relationship context
    if (context.relationshipLevel === 'close') {
      personalizedPrompt += `\n\nNote: You have a close relationship with this user. You can be more personal and reference past conversations.`;
    } else if (context.relationshipLevel === 'familiar') {
      personalizedPrompt += `\n\nNote: You are familiar with this user. You can be friendly and slightly more personal.`;
    } else {
      personalizedPrompt += `\n\nNote: This is a new user. Be welcoming and establish rapport.`;
    }
    
    // Add conversation mood context
    if (context.conversationMood === 'negative') {
      personalizedPrompt += `\n\nThe user seems to be having a difficult time. Be extra supportive and understanding.`;
    } else if (context.conversationMood === 'positive') {
      personalizedPrompt += `\n\nThe conversation has been positive. Maintain this energy and be encouraging.`;
    }
    
    // Add topic context
    if (context.topics.length > 0) {
      const recentTopics = context.topics.slice(-3).join(', ');
      personalizedPrompt += `\n\nRecent conversation topics: ${recentTopics}`;
    }
    
    // Add user preferences
    personalizedPrompt += `\n\nUser preferences: ${context.userPreferences.language} language, ${context.userPreferences.responseLength} responses, ${context.userPreferences.formality} tone`;
    
    return personalizedPrompt;
  }

  private static createNewContext(userId: string, characterId: string): ConversationContext {
    return {
      userId,
      characterId,
      sessionId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      messages: [],
      userPreferences: {
        language: 'thai',
        responseLength: 'medium',
        formality: 'polite',
        topics: [],
        avoidTopics: []
      },
      relationshipLevel: 'new',
      conversationMood: 'neutral',
      topics: [],
      lastInteraction: new Date(),
      interactionCount: 0
    };
  }

  private static analyzeConversationMood(messages: ConversationMessage[]): 'neutral' | 'positive' | 'negative' | 'mixed' {
    if (messages.length === 0) return 'neutral';
    
    const recentMessages = messages.slice(-5);
    let positiveCount = 0;
    let negativeCount = 0;
    
    recentMessages.forEach(message => {
      if (message.emotion) {
        if (['happy', 'excited', 'grateful'].includes(message.emotion)) {
          positiveCount++;
        } else if (['sad', 'angry', 'stressed', 'lonely'].includes(message.emotion)) {
          negativeCount++;
        }
      }
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > 0 && negativeCount > 0) return 'mixed';
    return 'neutral';
  }

  private static extractTopics(messages: ConversationMessage[]): string[] {
    const topics: string[] = [];
    
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      
      // Extract topics based on keywords
      if (content.includes('งาน') || content.includes('work')) topics.push('work');
      if (content.includes('เรียน') || content.includes('study')) topics.push('study');
      if (content.includes('ครอบครัว') || content.includes('family')) topics.push('family');
      if (content.includes('เพื่อน') || content.includes('friend')) topics.push('friends');
      if (content.includes('สุขภาพ') || content.includes('health')) topics.push('health');
      if (content.includes('ความรัก') || content.includes('love')) topics.push('love');
      if (content.includes('เงิน') || content.includes('money')) topics.push('money');
      if (content.includes('อนาคต') || content.includes('future')) topics.push('future');
    });
    
    return [...new Set(topics)]; // Remove duplicates
  }

  private static getCommonTopics(topics: string[]): string[] {
    const topicCounts = new Map<string, number>();
    
    topics.forEach(topic => {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });
    
    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);
  }

  private static calculateRelevance(message1: string, message2: string): number {
    const words1 = new Set(message1.toLowerCase().split(/\s+/));
    const words2 = new Set(message2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private static getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private static detectUserMood(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('ดีใจ') || lowerMessage.includes('happy')) return 'happy';
    if (lowerMessage.includes('เศร้า') || lowerMessage.includes('sad')) return 'sad';
    if (lowerMessage.includes('โกรธ') || lowerMessage.includes('angry')) return 'angry';
    if (lowerMessage.includes('เครียด') || lowerMessage.includes('stress')) return 'stressed';
    if (lowerMessage.includes('เหงา') || lowerMessage.includes('lonely')) return 'lonely';
    
    return 'neutral';
  }

  private static getConversationLength(messages: ConversationMessage[]): 'short' | 'medium' | 'long' {
    const count = messages.length;
    if (count < 5) return 'short';
    if (count < 20) return 'medium';
    return 'long';
  }

  static clearContext(userId: string, characterId: string): void {
    const key = `${userId}_${characterId}`;
    this.contexts.delete(key);
    logger.info('Context cleared', { userId, characterId });
  }

  static clearUserContext(userId: string, characterId: string): void {
    const key = `${userId}_${characterId}`;
    this.contexts.delete(key);
    logger.info('User context cleared', { userId, characterId });
  }

  static getAllContexts(): Map<string, ConversationContext> {
    return this.contexts;
  }
} 