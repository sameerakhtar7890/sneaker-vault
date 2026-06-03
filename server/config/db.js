import mongoose from 'mongoose';
export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) return console.warn('⚠️  MONGO_URI not set — skipping DB connection');
    await mongoose.connect(uri);
    console.log('🟢 MongoDB connected');
  } catch (err) {
    console.error('Mongo error:', err.message);
    process.exit(1);
  }
};
