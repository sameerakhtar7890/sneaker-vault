import mongoose from 'mongoose';
import crypto from 'crypto';

const newsletterSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active',
    index: true
  },
  source: { type: String, default: 'footer', trim: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  unsubscribeToken: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(24).toString('hex')
  },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
