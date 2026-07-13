import { Router } from 'express';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const r = Router();
r.get('/', listProducts);
r.get('/:slug', getProduct);
r.post('/:id/reviews', protect, addReview);
r.post('/', protect, admin, createProduct);
r.put('/:id', protect, admin, updateProduct);
r.delete('/:id', protect, admin, deleteProduct);
export default r;
