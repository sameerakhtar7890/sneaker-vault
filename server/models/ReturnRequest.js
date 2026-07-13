import mongoose from 'mongoose';

const RETURN_REASONS = ['wrong_size', 'defective', 'not_as_described', 'changed_mind', 'other'];
const RETURN_STATUSES = ['pending', 'approved', 'rejected', 'refunded'];

const returnRequestSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reason: {
    type: String,
    enum: RETURN_REASONS,
    required: true
  },
  description: { type: String, default: '', maxlength: 500 },
  status: {
    type: String,
    enum: RETURN_STATUSES,
    default: 'pending',
    index: true
  },
  admin_note: { type: String, default: '' },
  refund_amount: { type: Number, min: 0, default: null }
}, { timestamps: true });

export { RETURN_REASONS, RETURN_STATUSES };
export default mongoose.model('ReturnRequest', returnRequestSchema);
