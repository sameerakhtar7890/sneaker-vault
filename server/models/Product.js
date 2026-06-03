import mongoose from 'mongoose';
import slugify from 'slugify';

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, index: true },
  slug:        { type: String, unique: true, index: true },
  brand:       { type: String, required: true, index: true },
  price:       { type: Number, required: true, min: 0, index: true },
  description: { type: String, default: '' },
  images:      [{ type: String }],
  sizes:       [{ type: Number }],
  stock:       { type: Number, default: 0, min: 0 },
  category:    { type: String, default: 'sneakers', index: true },
  featured:    { type: Boolean, default: false, index: true },
  reviews:     [reviewSchema],
  rating:      { type: Number, default: 0 },
  numReviews:  { type: Number, default: 0 }
}, { timestamps: true });

productSchema.pre('validate', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', brand: 'text' });

export default mongoose.model('Product', productSchema);
