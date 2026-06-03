import { Router } from 'express';
import { listProducts, getProduct, createProduct } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const r = Router();
r.get('/', listProducts);
r.get('/:slug', getProduct);
r.post('/', protect, admin, createProduct);
export default r;
