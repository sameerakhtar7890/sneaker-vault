import { Router } from 'express';
import {
  calculateRate,
  listShippingZones,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone
} from '../controllers/shippingZoneController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const r = Router();

r.post('/calculate', calculateRate);

r.get('/', protect, admin, listShippingZones);
r.post('/', protect, admin, createShippingZone);
r.put('/:id', protect, admin, updateShippingZone);
r.delete('/:id', protect, admin, deleteShippingZone);

export default r;
