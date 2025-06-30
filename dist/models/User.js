import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    lineUserId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    displayName: {
        type: String,
        required: true
    },
    pictureUrl: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    }
});
// Update lastActiveAt on every save
UserSchema.pre('save', function (next) {
    this.lastActiveAt = new Date();
    next();
});
export default mongoose.models.User || mongoose.model('User', UserSchema);
