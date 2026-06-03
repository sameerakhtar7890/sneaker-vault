import { Router } from 'express';
import { createOrder, myOrders, getOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const r = Router();
r.post('/', protect, createOrder);
r.get('/mine', protect, myOrders);
r.get('/:id', protect, getOrder);
export default r;
