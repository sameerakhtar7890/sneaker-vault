import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:    String,
  image:   String,
  size:    Number,
  qty:     { type: Number, default: 1, min: 1 },
  price:   { type: Number, required: true, min: 0 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user_id:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cart_items:        [orderItemSchema],
  shipping_address: {
    fullName: String, address: String, city: String,
    postalCode: String, country: String
  },
  total_price:       { type: Number, required: true, min: 0 },
  payment_status:    { type: String, enum: ['pending','paid','failed'], default: 'pending', index: true },
  payment_intent_id: { type: String, index: true },
  status:            { type: String, enum: ['created','processing','shipped','delivered','cancelled'], default: 'created', index: true }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
