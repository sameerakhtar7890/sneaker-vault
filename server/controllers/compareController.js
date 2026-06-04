import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';

export const MAX_COMPARE = 3;

export const getCompare = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('compareList');
  const products = (user.compareList || []).filter(p => p && p._id);
  res.json(products);
});

export const addToCompare = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) { res.status(400); throw new Error('productId is required'); }

  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const user = await User.findById(req.user._id);
  const ids = user.compareList.map(id => id.toString());

  if (ids.includes(productId)) {
    res.status(400);
    throw new Error('Product is already in compare list');
  }
  if (user.compareList.length >= MAX_COMPARE) {
    res.status(400);
    throw new Error(`You can compare up to ${MAX_COMPARE} products at a time`);
  }

  user.compareList.push(productId);
  await user.save();

  const populated = await User.findById(req.user._id).populate('compareList');
  res.status(201).json({
    ids: populated.compareList.map(p => p._id),
    products: populated.compareList.filter(p => p && p._id)
  });
});

export const removeFromCompare = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const before = user.compareList.length;
  user.compareList = user.compareList.filter(
    id => id.toString() !== req.params.productId
  );
  if (user.compareList.length === before) {
    res.status(404);
    throw new Error('Product not in compare list');
  }
  await user.save();

  const populated = await User.findById(req.user._id).populate('compareList');
  res.json({
    ids: populated.compareList.map(p => p._id),
    products: populated.compareList.filter(p => p && p._id)
  });
});

export const clearCompare = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.compareList = [];
  await user.save();
  res.json({ ids: [], products: [] });
});

export const syncCompare = asyncHandler(async (req, res) => {
  const { productIds = [] } = req.body;
  const user = await User.findById(req.user._id);

  const merged = [];
  const seen = new Set();

  for (const id of productIds) {
    const str = String(id);
    if (!seen.has(str) && merged.length < MAX_COMPARE) {
      const exists = await Product.findById(id);
      if (exists) {
        seen.add(str);
        merged.push(id);
      }
    }
  }

  for (const id of user.compareList) {
    const str = id.toString();
    if (!seen.has(str) && merged.length < MAX_COMPARE) {
      seen.add(str);
      merged.push(id);
    }
  }

  user.compareList = merged;
  await user.save();

  const populated = await User.findById(req.user._id).populate('compareList');
  res.json({
    ids: populated.compareList.map(p => p._id),
    products: populated.compareList.filter(p => p && p._id)
  });
});

export const getCompareByIds = asyncHandler(async (req, res) => {
  const ids = (req.query.ids || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, MAX_COMPARE);
  if (!ids.length) return res.json([]);

  const products = await Product.find({ _id: { $in: ids } });
  const ordered = ids
    .map(id => products.find(p => p._id.toString() === id))
    .filter(Boolean);

  res.json(ordered);
});
