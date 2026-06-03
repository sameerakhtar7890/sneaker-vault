import mongoose from 'mongoose';

const sizeGuideRowSchema = new mongoose.Schema({
  us: { type: String, required: true },
  uk: { type: String, default: '' },
  eu: { type: String, default: '' },
  cm: { type: String, default: '' }
}, { _id: false });

const sizeGuideSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, default: null, index: true },
  gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'unisex' },
  rows: { type: [sizeGuideRowSchema], default: [] },
  fitTips: { type: String, default: '' },
  isDefault: { type: Boolean, default: false, index: true },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

export default mongoose.model('SizeGuide', sizeGuideSchema);
