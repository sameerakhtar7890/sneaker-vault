import { Router } from 'express';
import { createStockAlert } from '../controllers/stockAlertController.js';

const r = Router();
r.post('/', createStockAlert);

export default r;
