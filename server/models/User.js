import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label:      { type: String, trim: true, default: 'Home', maxlength: 40 },
  fullName:   { type: String, required: true, trim: true },
  address:    { type: String, required: true, trim: true },
  city:       { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country:    { type: String, default: 'US', trim: true },
  isDefault:  { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true, minlength: 6 },
  isAdmin:  { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  compareList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  recentlyViewed: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    viewedAt: { type: Date, default: Date.now }
  }],
  addresses: [addressSchema],
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

const MAX_ADDRESSES = 10;
userSchema.methods.canAddAddress = function () {
  return (this.addresses?.length || 0) < MAX_ADDRESSES;
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);
