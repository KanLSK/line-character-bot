export interface AdminNotification {
  userId: string;
  userMessage: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface HumanAdminRequest {
  userId: string;
  message: string;
  timestamp: Date;
  status: 'waiting' | 'assigned' | 'in_progress' | 'completed';
  adminId?: string;
  adminResponse?: string;
}

export interface AdminSession {
  userId: string;
  currentMode: 'character' | 'human_admin' | 'medical_info';
  currentCharacterId?: string;
  isWaitingForHuman: boolean;
  humanAdminId?: string;
  lastActivity: Date;
  sessionStartTime: Date;
  preferences: {
    language: 'thai' | 'english' | 'mixed';
    notificationEnabled: boolean;
  };
  recentMessages: Array<{
    timestamp: Date;
    sender: 'user' | 'bot' | 'human_admin';
    message: string;
    mode: 'character' | 'human_admin' | 'medical_info';
  }>;
}
