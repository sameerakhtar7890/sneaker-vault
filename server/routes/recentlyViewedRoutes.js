import { Router } from 'express';
import {
  trackView,
  syncRecentlyViewed,
  getRecentlyViewed,
  getRecentlyViewedByIds
} from '../controllers/recentlyViewedController.js';
import { protect } from '../middleware/authMiddleware.js';

const r = Router();

r.get('/by-ids', getRecentlyViewedByIds);
r.get('/', protect, getRecentlyViewed);
r.post('/sync', protect, syncRecentlyViewed);
r.post('/', protect, trackView);

export default r;
