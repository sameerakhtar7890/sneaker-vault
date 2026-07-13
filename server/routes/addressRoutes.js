import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/addressController.js';

const r = Router();
r.use(protect);

r.get('/', listAddresses);
r.post('/', createAddress);
r.put('/:id', updateAddress);
r.delete('/:id', deleteAddress);
r.patch('/:id/default', setDefaultAddress);

export default r;
