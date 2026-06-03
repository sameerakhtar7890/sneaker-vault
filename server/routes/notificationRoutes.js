import { Router } from 'express';
import { myNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const r = Router();
r.get('/mine', protect, myNotifications);
export default r;
