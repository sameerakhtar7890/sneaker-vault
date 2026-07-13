import { Router } from 'express';
import { submitContactMessage } from '../controllers/contactController.js';

const r = Router();

r.post('/', submitContactMessage);

export default r;
