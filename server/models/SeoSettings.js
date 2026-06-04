import mongoose from 'mongoose';

const pageSeoSchema = new mongoose.Schema({
  path: { type: String, required: true, trim: true },
  title: { type: String, trim: true },
  description: { type: String, trim: true, maxlength: 320 },
  ogImage: { type: String, trim: true },
  noIndex: { type: Boolean, default: false }
}, { _id: false });

const seoSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  siteName: { type: String, default: 'Sneaker Vault' },
  titleSuffix: { type: String, default: 'Sneaker Vault' },
  defaultDescription: {
    type: String,
    default: 'Discover luxury sneakers, exclusive drops, and curated grails at Sneaker Vault.'
  },
  defaultOgImage: { type: String, default: '/pwa-512.png' },
  siteUrl: { type: String, default: '' },
  twitterCard: { type: String, default: 'summary_large_image' },
  pages: [pageSeoSchema]
}, { timestamps: true });

export default mongoose.model('SeoSettings', seoSettingsSchema);
