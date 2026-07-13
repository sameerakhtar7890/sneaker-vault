import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  order:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null, index: true },
  type:    { type: String, enum: ['order_confirmation', 'order_shipped', 'return_update'], required: true, index: true },
  to:      { type: String, required: true },
  subject: { type: String, required: true },
  status:  { type: String, enum: ['sent', 'failed', 'skipped'], default: 'sent', index: true },
  error:   { type: String, default: null }
}, { timestamps: true });

emailLogSchema.index({ order: 1, type: 1 }, { unique: true, sparse: true });

export default mongoose.model('EmailLog', emailLogSchema);
