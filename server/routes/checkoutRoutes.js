import { Router } from 'express';
import {
  createPaymentIntent,
  completeOrder,
  completeDemoOrder
} from '../controllers/paymentController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const r = Router();

r.post('/create-payment-intent', optionalAuth, createPaymentIntent);
r.post('/complete-order', optionalAuth, completeOrder);
r.post('/demo-order', optionalAuth, completeDemoOrder);

export default r;
