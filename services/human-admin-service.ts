import { connectToDatabase } from '../lib/db-utils';
import UserSession from '../models/UserSession';
import { logger } from '../utils/logger';

export interface HumanAdminRequest {
  userId: string;
  message: string;
  timestamp: Date;
  status: 'waiting' | 'assigned' | 'in_progress' | 'completed';
  adminId?: string;
  adminResponse?: string;
}

export interface AdminNotification {
  userId: string;
  userMessage: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Handles user request to talk to human admin
 */
export async function requestHumanAdmin(
  userId: string,
  userMessage: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    await connectToDatabase();
    
    // Update user session to waiting for human admin
    await UserSession.updateOne(
      { userId },
      {
        currentMode: 'human_admin',
        isWaitingForHuman: true,
        lastActivity: new Date(),
        $push: {
          conversationHistory: {
            timestamp: new Date(),
            sender: 'user',
            message: userMessage,
            mode: 'human_admin'
          }
        }
      }
    );

    // Create admin notification
    const notification: AdminNotification = {
      userId,
      userMessage,
      timestamp: new Date(),
      priority: determinePriority(userMessage)
    };

    // In a real implementation, this would send to admin dashboard
    // For now, we'll log it
    logger.info('Human admin request received', { notification });

    return {
      success: true,
      message: "✅ ขออภัยครับ ระบบได้ส่งคำขอของคุณไปยังผู้ดูแลแล้ว กรุณารอสักครู่ ผู้ดูแลจะติดต่อกลับมาในเร็วๆ นี้ครับ\n\n💬 ข้อความของคุณ: " + userMessage
    };

  } catch (error) {
    logger.error('Error requesting human admin', { error, userId });
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้งครับ',
      error: 'เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้งครับ'
    };
  }
}

/**
 * Handles admin response to user
 */
export async function adminRespondToUser(
  userId: string,
  adminId: string,
  adminMessage: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    await connectToDatabase();
    
    // Update user session with admin response
    await UserSession.updateOne(
      { userId },
      {
        isWaitingForHuman: false,
        humanAdminId: adminId,
        lastActivity: new Date(),
        $push: {
          conversationHistory: {
            timestamp: new Date(),
            sender: 'human_admin',
            message: adminMessage,
            mode: 'human_admin'
          }
        }
      }
    );

    logger.info('Admin response sent to user', { userId, adminId, message: adminMessage });

    return {
      success: true,
      message: "✅ ข้อความจากผู้ดูแลถูกส่งไปยังผู้ใช้แล้ว"
    };

  } catch (error) {
    logger.error('Error sending admin response', { error, userId, adminId });
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง',
      error: 'เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง'
    };
  }
}

/**
 * Gets all pending human admin requests
 */
export async function getPendingAdminRequests(): Promise<AdminNotification[]> {
  try {
    await connectToDatabase();
    
    const waitingSessions = await UserSession.find({
      currentMode: 'human_admin',
      isWaitingForHuman: true
    }).sort({ lastActivity: 1 });

    const notifications: AdminNotification[] = waitingSessions.map(session => {
      const lastUserMessage = session.conversationHistory
        .filter(msg => msg.sender === 'user' && msg.mode === 'human_admin')
        .pop();

      return {
        userId: session.userId,
        userMessage: lastUserMessage?.message || 'No message',
        timestamp: lastUserMessage?.timestamp || session.lastActivity,
        priority: determinePriority(lastUserMessage?.message || '')
      };
    });

    return notifications;

  } catch (error) {
    logger.error('Error getting pending admin requests', { error });
    return [];
  }
}

/**
 * Ends human admin session and returns to character mode
 */
export async function endHumanAdminSession(
  userId: string,
  characterId?: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    await connectToDatabase();
    
    const updateData: any = {
      currentMode: 'character',
      isWaitingForHuman: false,
      humanAdminId: null,
      lastActivity: new Date()
    };

    if (characterId) {
      updateData.currentCharacterId = characterId;
    }

    await UserSession.updateOne({ userId }, updateData);

    logger.info('Human admin session ended', { userId, characterId });

    return {
      success: true,
      message: "✅ ระบบได้กลับไปยังโหมดตัวละครแล้วครับ"
    };

  } catch (error) {
    logger.error('Error ending human admin session', { error, userId });
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนโหมด กรุณาลองใหม่อีกครั้งครับ',
      error: 'เกิดข้อผิดพลาดในการเปลี่ยนโหมด กรุณาลองใหม่อีกครั้งครับ'
    };
  }
}

/**
 * Determines priority level based on message content
 */
function determinePriority(message: string): 'low' | 'medium' | 'high' {
  const urgentKeywords = [
    'ฉุกเฉิน', 'emergency', 'urgent', 'ด่วน', 'critical',
    'ป่วย', 'sick', 'เจ็บ', 'pain', 'เลือด', 'blood',
    'หายใจ', 'breathing', 'หมดสติ', 'unconscious'
  ];

  const mediumKeywords = [
    'ปัญหา', 'problem', 'ไม่เข้าใจ', 'confused',
    'ต้องการความช่วยเหลือ', 'need help', 'ช่วย', 'help'
  ];

  const lowerMessage = message.toLowerCase();
  
  if (urgentKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'high';
  } else if (mediumKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Gets user session information for admin dashboard
 */
export async function getUserSessionInfo(userId: string): Promise<{
  success: boolean;
  session?: any;
  error?: string;
}> {
  try {
    await connectToDatabase();
    
    const session = await UserSession.findOne({ userId });
    
    if (!session) {
      return {
        success: false,
        error: 'ไม่พบข้อมูลเซสชันของผู้ใช้'
      };
    }

    return {
      success: true,
      session: {
        userId: session.userId,
        currentMode: session.currentMode,
        currentCharacterId: session.currentCharacterId,
        isWaitingForHuman: session.isWaitingForHuman,
        humanAdminId: session.humanAdminId,
        lastActivity: session.lastActivity,
        sessionStartTime: session.sessionStartTime,
        preferences: session.preferences,
        recentMessages: session.conversationHistory.slice(-10)
      }
    };

  } catch (error) {
    logger.error('Error getting user session info', { error, userId });
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    };
  }
}

/**
 * Assigns an admin to handle a user request
 */
export async function assignAdminToUser(
  userId: string,
  adminId: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    await connectToDatabase();
    
    await UserSession.updateOne(
      { userId },
      {
        humanAdminId: adminId,
        lastActivity: new Date()
      }
    );

    logger.info('Admin assigned to user', { userId, adminId });

    return {
      success: true,
      message: "✅ ผู้ดูแลถูกมอบหมายให้ดูแลผู้ใช้นี้แล้ว"
    };

  } catch (error) {
    logger.error('Error assigning admin to user', { error, userId, adminId });
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการมอบหมายผู้ดูแล',
      error: 'เกิดข้อผิดพลาดในการมอบหมายผู้ดูแล'
    };
  }
}
