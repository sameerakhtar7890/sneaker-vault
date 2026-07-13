import mongoose from 'mongoose';

const heroSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  eyebrow: { type: String, default: 'SS25 · LIMITED RELEASE' },
  title: { type: String, default: 'Step Into \nQuiet Luxury.' },
  description: { type: String, default: "A curated vault of rare, hand-finished sneakers from the world's uncompromising houses." },
  btnText: { type: String, default: 'Explore the Vault' },
  btnLink: { type: String, default: '/shop' },
  secondaryBtnText: { type: String, default: 'Featured' },
  secondaryBtnLink: { type: String, default: '/shop?featured=true' },
  image: { type: String, default: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80' }
}, { timestamps: true });

export default mongoose.model('HeroSettings', heroSettingsSchema);
