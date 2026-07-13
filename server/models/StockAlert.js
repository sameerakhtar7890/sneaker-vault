import mongoose from 'mongoose';

const stockAlertSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'notified'],
    default: 'pending',
    index: true
  }
}, { timestamps: true });

// Avoid duplicate alerts for the same product and email in pending state
stockAlertSchema.index({ email: 1, product: 1, status: 1 }, { unique: true });

export default mongoose.model('StockAlert', stockAlertSchema);
