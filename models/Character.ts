import mongoose, { Schema, Document, Model } from 'mongoose';
import { Character } from '../types/character';

type CharacterProps = Omit<Character, '_id' | 'id'>;
export interface CharacterDocument extends CharacterProps, Document {}

const CharacterSchema = new Schema<CharacterDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  personality: { type: String, required: true },
  background: { type: String, required: true },
  prompt: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  imageUrl: { type: String },
}, { timestamps: true });

const CharacterModel: Model<CharacterDocument> = mongoose.models.Character || mongoose.model<CharacterDocument>('Character', CharacterSchema);
export default CharacterModel;
