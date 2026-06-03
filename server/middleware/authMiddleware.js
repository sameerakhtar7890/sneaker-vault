import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) { res.status(401); throw new Error('Not authorized'); }
  try {
    const { id } = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-password');
    if (!req.user) { res.status(401); throw new Error('User not found'); }
    next();
  } catch {
    res.status(401); throw new Error('Token invalid or expired');
  }
});

export const admin = (req, _res, next) => {
  if (req.user?.isAdmin) return next();
  const e = new Error('Admin only'); e.statusCode = 403; throw e;
};
