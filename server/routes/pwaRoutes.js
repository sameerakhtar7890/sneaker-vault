import { Router } from 'express';
import { getPwaInfo, getOfflineCatalog } from '../controllers/pwaController.js';

const r = Router();
r.get('/info', getPwaInfo);
r.get('/catalog', getOfflineCatalog);
export default r;
