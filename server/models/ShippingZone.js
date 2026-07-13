import mongoose from 'mongoose';

const shippingZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  countries: [{
    type: String,
    trim: true
  }],
  rateType: {
    type: String,
    enum: ['fixed', 'free', 'conditional_free'],
    required: true
  },
  baseCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  freeShippingThreshold: {
    type: Number,
    min: 0,
    default: 0
  },
  isDefault: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { timestamps: true });

export default mongoose.model('ShippingZone', shippingZoneSchema);
