import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import sizeGuideRoutes from './routes/sizeGuideRoutes.js';
import recentlyViewedRoutes from './routes/recentlyViewedRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import compareRoutes from './routes/compareRoutes.js';
import pwaRoutes from './routes/pwaRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import shippingZoneRoutes from './routes/shippingZoneRoutes.js';
import stockAlertRoutes from './routes/stockAlertRoutes.js';
import heroRoutes from './routes/heroRoutes.js';
import emailTemplateRoutes from './routes/emailTemplateRoutes.js';
import { stripeWebhook } from './controllers/paymentController.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();
connectRedis();

const app = express();

// Stripe webhook needs raw body — mount BEFORE express.json()
app.post('/api/checkout/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'Sneaker Vault API' }));
app.use('/api/pwa', pwaRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/size-guides', sizeGuideRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/shipping-zones', shippingZoneRoutes);
app.use('/api/stock-alerts', stockAlertRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/email-templates', emailTemplateRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server only in non-serverless (local/traditional) environments
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`🟢 Sneaker Vault API running on :${PORT}`));
}

export default app;
