import asyncHandler from 'express-async-handler';
import EmailLog from '../models/EmailLog.js';

/**
 * GET /api/notifications/mine
 */
export const myNotifications = asyncHandler(async (req, res) => {
  const logs = await EmailLog.find({ user: req.user._id })
    .populate('order', '_id total_price status')
    .sort('-createdAt')
    .limit(20);
  res.json(logs);
});
