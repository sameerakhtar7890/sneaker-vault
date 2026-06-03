import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import { stripeWebhook } from './controllers/paymentController.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();

// Stripe webhook needs raw body — mount BEFORE express.json()
app.post('/api/checkout/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'Sneaker Vault API' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', checkoutRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🟢 Sneaker Vault API running on :${PORT}`));
