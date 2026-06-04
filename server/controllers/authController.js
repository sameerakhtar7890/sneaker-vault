import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) { res.status(400); throw new Error('Email already in use'); }
  const user = await User.create({ name, email, password });
  res.status(201).json({
    _id: user._id, name: user.name, email: user.email,
    isAdmin: user.isAdmin, wishlist: user.wishlist,
    emailNotifications: user.emailNotifications,
    addresses: user.addresses || [],
    token: sign(user._id)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401); throw new Error('Invalid credentials');
  }
  res.json({
    _id: user._id, name: user.name, email: user.email,
    isAdmin: user.isAdmin, wishlist: user.wishlist,
    emailNotifications: user.emailNotifications,
    addresses: user.addresses || [],
    token: sign(user._id)
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    isAdmin: req.user.isAdmin,
    wishlist: req.user.wishlist,
    emailNotifications: req.user.emailNotifications,
    addresses: req.user.addresses || []
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  user.name = req.body.name || user.name;
  if (req.body.password) {
    user.password = req.body.password;
  }
  if (req.body.emailNotifications != null) {
    user.emailNotifications = Boolean(req.body.emailNotifications);
  }
  
  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    wishlist: updatedUser.wishlist,
    emailNotifications: updatedUser.emailNotifications,
    addresses: updatedUser.addresses || [],
    token: sign(updatedUser._id)
  });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  
  if (!user) { res.status(404); throw new Error('User not found'); }
  
  const index = user.wishlist.indexOf(productId);
  if (index !== -1) {
    user.wishlist.splice(index, 1);
  } else {
    user.wishlist.push(productId);
  }
  
  await user.save();
  res.json(user.wishlist);
});

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json(user.wishlist);
});
