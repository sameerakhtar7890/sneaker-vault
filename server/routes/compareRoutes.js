import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCompare,
  addToCompare,
  removeFromCompare,
  clearCompare,
  syncCompare,
  getCompareByIds
} from '../controllers/compareController.js';

const r = Router();

r.get('/by-ids', getCompareByIds);
r.get('/', protect, getCompare);
r.post('/', protect, addToCompare);
r.post('/sync', protect, syncCompare);
r.delete('/', protect, clearCompare);
r.delete('/:productId', protect, removeFromCompare);

export default r;
