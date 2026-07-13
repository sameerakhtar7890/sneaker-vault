import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please enter your email address'],
    lowercase: true,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Please select or enter a subject'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Please enter your message'],
    trim: true
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied'],
    default: 'unread'
  }
}, { timestamps: true });

export default mongoose.model('ContactMessage', contactMessageSchema);
