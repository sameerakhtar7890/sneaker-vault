import { Router } from 'express';
import {
  createReturnRequest,
  myReturnRequests,
  getReturnByOrder,
  getReturnRequest,
  allReturnRequests,
  updateReturnStatus
} from '../controllers/returnController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const r = Router();

r.post('/', protect, createReturnRequest);
r.get('/mine', protect, myReturnRequests);
r.get('/admin/all', protect, admin, allReturnRequests);
r.get('/order/:orderId', protect, getReturnByOrder);
r.get('/:id', protect, getReturnRequest);
r.patch('/:id', protect, admin, updateReturnStatus);

export default r;
