import mongoose, { Schema } from 'mongoose';
const ConversationSchema = new Schema({
    lineUserId: { type: String, required: true },
    characterId: { type: String, required: true },
    userMessage: { type: String, required: true },
    botResponse: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    sessionId: { type: String, required: true },
}, { timestamps: true });
const ConversationModel = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
export default ConversationModel;
