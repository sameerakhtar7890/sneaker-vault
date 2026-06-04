import { Router } from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getSeoSettings,
  getPageSeo,
  getProductSeo,
  updateSeoSettings
} from '../controllers/seoController.js';

const r = Router();

r.get('/', getSeoSettings);
r.get('/page', getPageSeo);
r.get('/product/:slug', getProductSeo);
r.put('/admin', protect, admin, updateSeoSettings);

export default r;
