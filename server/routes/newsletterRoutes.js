import { Router } from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import {
  subscribe,
  unsubscribe,
  getSubscribersAdmin,
  deleteSubscriberAdmin
} from '../controllers/newsletterController.js';

const r = Router();

r.post('/subscribe', optionalAuth, subscribe);
r.get('/unsubscribe/:token', unsubscribe);
r.post('/unsubscribe/:token', unsubscribe);

r.get('/admin/subscribers', protect, admin, getSubscribersAdmin);
r.delete('/admin/subscribers/:id', protect, admin, deleteSubscriberAdmin);

export default r;
