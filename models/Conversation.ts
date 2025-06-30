import mongoose, { Schema, Document, Model } from 'mongoose';
import { Conversation } from '../types/conversation';

type ConversationProps = Omit<Conversation, '_id'>;
export interface ConversationDocument extends ConversationProps, Document {}

const ConversationSchema = new Schema<ConversationDocument>({
  lineUserId: { type: String, required: true },
  characterId: { type: String, required: true },
  userMessage: { type: String, required: true },
  botResponse: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  sessionId: { type: String, required: true },
}, { timestamps: true });

const ConversationModel: Model<ConversationDocument> = mongoose.models.Conversation || mongoose.model<ConversationDocument>('Conversation', ConversationSchema);
export default ConversationModel;
