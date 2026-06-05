import { Router } from 'express';
import { createOrder, myOrders, allOrders, updateOrderStatus, getOrderById, cancelOrder, exportOrdersCSV } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const r = Router();
r.post('/', protect, createOrder);
r.get('/mine', protect, myOrders);
r.get('/admin/all', protect, admin, allOrders);
r.get('/admin/export', protect, admin, exportOrdersCSV);
r.get('/:id', optionalAuth, getOrderById);
r.patch('/:id/status', protect, admin, updateOrderStatus);
r.post('/:id/cancel', optionalAuth, cancelOrder);
export default r;
