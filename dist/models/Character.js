import mongoose, { Schema } from 'mongoose';
const CharacterSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    personality: { type: String, required: true },
    background: { type: String, required: true },
    prompt: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    imageUrl: { type: String },
}, { timestamps: true });
const CharacterModel = mongoose.models.Character || mongoose.model('Character', CharacterSchema);
export default CharacterModel;
