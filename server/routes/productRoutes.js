import { Router } from 'express';
import {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview,
  getPendingReviews, approveReview, deleteReview
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const r = Router();
r.get('/', listProducts);
r.get('/reviews/pending', protect, admin, getPendingReviews);
r.get('/:slug', getProduct);
r.post('/:id/reviews', protect, addReview);
r.put('/:productId/reviews/:reviewId/approve', protect, admin, approveReview);
r.delete('/:productId/reviews/:reviewId', protect, admin, deleteReview);
r.post('/', protect, admin, createProduct);
r.put('/:id', protect, admin, updateProduct);
r.delete('/:id', protect, admin, deleteProduct);
export default r;
