import { Router } from 'express';
import { register, login, me, updateProfile, toggleWishlist, getWishlist } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const r = Router();
r.post('/register', register);
r.post('/login', login);
r.get('/me', protect, me);
r.put('/profile', protect, updateProfile);
r.get('/wishlist', protect, getWishlist);
r.post('/wishlist', protect, toggleWishlist);
export default r;
