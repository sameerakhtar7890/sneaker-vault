import { Router } from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getHeroSettings, updateHeroSettings } from '../controllers/heroController.js';

const r = Router();

r.get('/', getHeroSettings);
r.put('/', protect, admin, updateHeroSettings);

export default r;
