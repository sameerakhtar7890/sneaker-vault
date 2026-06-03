import { Router } from 'express';
import { createOrder, myOrders, allOrders, updateOrderStatus, getOrderById } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const r = Router();
r.post('/', protect, createOrder);
r.get('/mine', protect, myOrders);
r.get('/:id', protect, getOrderById);
r.get('/admin/all', protect, admin, allOrders);
r.patch('/:id/status', protect, admin, updateOrderStatus);
export default r;
