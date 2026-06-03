import { Router } from 'express';
import { getOverview, getSalesChart } from '../controllers/analyticsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const r = Router();

r.use(protect, admin);
r.get('/overview', getOverview);
r.get('/sales', getSalesChart);

export default r;
