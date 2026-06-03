import { Router } from 'express';
import {
  getGuideForBrand,
  listSizeGuides,
  createSizeGuide,
  updateSizeGuide,
  deleteSizeGuide
} from '../controllers/sizeGuideController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const r = Router();

r.get('/for-brand/:brand', getGuideForBrand);

r.get('/', protect, admin, listSizeGuides);
r.post('/', protect, admin, createSizeGuide);
r.put('/:id', protect, admin, updateSizeGuide);
r.delete('/:id', protect, admin, deleteSizeGuide);

export default r;
