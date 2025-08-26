import mongoose, { Schema, Document, Model } from 'mongoose';

export interface MedicalCampInfo {
  _id?: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  activities: string[];
  requirements: string[];
  registrationInfo: string;
  benefits: string[];
  category: 'general' | 'specialized' | 'workshop' | 'seminar';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type MedicalCampProps = Omit<MedicalCampInfo, '_id'>;
export interface MedicalCampDocument extends MedicalCampProps, Document {}

const MedicalCampSchema = new Schema<MedicalCampDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  organizer: { type: String, required: true },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String }
  },
  activities: [{ type: String }],
  requirements: [{ type: String }],
  registrationInfo: { type: String, required: true },
  benefits: [{ type: String }],
  category: { 
    type: String, 
    enum: ['general', 'specialized', 'workshop', 'seminar'], 
    default: 'general' 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const MedicalCampModel: Model<MedicalCampDocument> = mongoose.models.MedicalCamp || mongoose.model<MedicalCampDocument>('MedicalCamp', MedicalCampSchema);
export default MedicalCampModel;
