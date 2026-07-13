import { Router } from 'express';
import {
  validateCoupon, listCoupons, createCoupon, updateCoupon, deleteCoupon
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const r = Router();

r.post('/validate', validateCoupon);

r.get('/', protect, admin, listCoupons);
r.post('/', protect, admin, createCoupon);
r.put('/:id', protect, admin, updateCoupon);
r.delete('/:id', protect, admin, deleteCoupon);

export default r;
