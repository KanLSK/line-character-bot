export interface User {
    _id?: string;
    lineUserId: string;
    displayName: string;
    pictureUrl?: string;
    createdAt: Date;
    lastActiveAt: Date;
    currentCharacterId?: string;
    conversationCount: number;
  }
  
export interface CreateUserRequest {
    lineUserId: string;
    displayName: string;
    pictureUrl?: string;
  }