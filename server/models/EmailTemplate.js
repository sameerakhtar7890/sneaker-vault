import mongoose from 'mongoose';

/**
 * Stores admin-customizable overrides for each email template.
 * Fields that are left blank/null will fall back to the hardcoded defaults in email.js.
 *
 * Templates: order_confirmation | newsletter_welcome | password_reset | back_in_stock
 */
const emailTemplateSchema = new mongoose.Schema({
  templateKey: {
    type: String,
    required: true,
    unique: true,
    enum: ['order_confirmation', 'newsletter_welcome', 'password_reset', 'back_in_stock'],
    index: true
  },
  label: { type: String }, // human-readable label for admin UI

  // Editable fields
  subject:      { type: String, trim: true, default: '' },
  headerTitle:  { type: String, trim: true, default: '' },
  bodyText:     { type: String, trim: true, default: '' },   // intro paragraph
  ctaText:      { type: String, trim: true, default: '' },   // call-to-action button label
  footerText:   { type: String, trim: true, default: '' },

  // Visual overrides
  accentColor:  { type: String, trim: true, default: '' },   // hex e.g. "#d4af37"
  logoText:     { type: String, trim: true, default: '' },   // brand wordmark in header

  isActive:     { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('EmailTemplate', emailTemplateSchema);
