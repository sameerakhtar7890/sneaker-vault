import { Router } from 'express';
import { createPaymentIntent } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const r = Router();
// Allows guest checkout — wrap with `protect` to require auth.
r.post('/create-payment-intent', createPaymentIntent);
export default r;
