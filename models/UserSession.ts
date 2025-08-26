import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserSession {
  _id?: string;
  userId: string;
  currentMode: 'character' | 'human_admin' | 'medical_info';
  currentCharacterId?: string;
  isWaitingForHuman: boolean;
  humanAdminId?: string;
  lastActivity: Date;
  sessionStartTime: Date;
  conversationHistory: Array<{
    timestamp: Date;
    sender: 'user' | 'bot' | 'human_admin';
    message: string;
    mode: 'character' | 'human_admin' | 'medical_info';
  }>;
  preferences: {
    language: 'thai' | 'english' | 'mixed';
    notificationEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

type UserSessionProps = Omit<UserSession, '_id'>;
export interface UserSessionDocument extends UserSessionProps, Document {}

const UserSessionSchema = new Schema<UserSessionDocument>({
  userId: { type: String, required: true, unique: true },
  currentMode: { 
    type: String, 
    enum: ['character', 'human_admin', 'medical_info'], 
    default: 'character' 
  },
  currentCharacterId: { type: String },
  isWaitingForHuman: { type: Boolean, default: false },
  humanAdminId: { type: String },
  lastActivity: { type: Date, default: Date.now },
  sessionStartTime: { type: Date, default: Date.now },
  conversationHistory: [{
    timestamp: { type: Date, default: Date.now },
    sender: { 
      type: String, 
      enum: ['user', 'bot', 'human_admin'], 
      required: true 
    },
    message: { type: String, required: true },
    mode: { 
      type: String, 
      enum: ['character', 'human_admin', 'medical_info'], 
      required: true 
    }
  }],
  preferences: {
    language: { 
      type: String, 
      enum: ['thai', 'english', 'mixed'], 
      default: 'mixed' 
    },
    notificationEnabled: { type: Boolean, default: true }
  }
}, { timestamps: true });

const UserSessionModel: Model<UserSessionDocument> = mongoose.models.UserSession || mongoose.model<UserSessionDocument>('UserSession', UserSessionSchema);
export default UserSessionModel;
