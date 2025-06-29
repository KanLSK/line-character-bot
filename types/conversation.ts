export interface Conversation {
    _id?: string;
    lineUserId: string;
    characterId: string;
    userMessage: string;
    botResponse: string;
    timestamp: Date;
    sessionId: string;
    messageType: 'text' | 'image' | 'sticker';
    responseTime?: number;
  }
  
export interface ConversationSession {
    sessionId: string;
    lineUserId: string;
    characterId: string;
    startTime: Date;
    lastActivity: Date;
    messageCount: number;
  }