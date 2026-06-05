import { Router } from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  listEmailTemplates,
  getEmailTemplate,
  updateEmailTemplate,
  resetEmailTemplate,
  sendTestEmail
} from '../controllers/emailTemplateController.js';

const r = Router();

r.get('/', protect, admin, listEmailTemplates);
r.get('/:key', protect, admin, getEmailTemplate);
r.put('/:key', protect, admin, updateEmailTemplate);
r.post('/:key/reset', protect, admin, resetEmailTemplate);
r.post('/:key/send-test', protect, admin, sendTestEmail);

export default r;
