import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) { res.status(400); throw new Error('Email already in use'); }
  const user = await User.create({ name, email, password });
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: sign(user._id) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401); throw new Error('Invalid credentials');
  }
  res.json({ _id: user._id, name: user.name, email: user.email, token: sign(user._id) });
});

export const me = asyncHandler(async (req, res) => res.json(req.user));
