import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';

const MAX_ITEMS = 12;

/**
 * POST /api/recently-viewed
 * body: { productId }
 */
export const trackView = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) { res.status(400); throw new Error('productId is required'); }

  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const user = await User.findById(req.user._id);
  user.recentlyViewed = user.recentlyViewed.filter(
    item => item.product.toString() !== productId
  );
  user.recentlyViewed.unshift({ product: productId, viewedAt: new Date() });
  if (user.recentlyViewed.length > MAX_ITEMS) {
    user.recentlyViewed = user.recentlyViewed.slice(0, MAX_ITEMS);
  }
  await user.save();

  res.json({ ids: user.recentlyViewed.map(item => item.product) });
});

/**
 * POST /api/recently-viewed/sync
 * body: { productIds: string[] } — merge guest localStorage history on login
 */
export const syncRecentlyViewed = asyncHandler(async (req, res) => {
  const { productIds = [] } = req.body;
  const user = await User.findById(req.user._id);

  const merged = [];
  const seen = new Set();

  for (const id of productIds) {
    const str = String(id);
    if (!seen.has(str) && merged.length < MAX_ITEMS) {
      seen.add(str);
      merged.push({ product: id, viewedAt: new Date() });
    }
  }

  for (const item of user.recentlyViewed) {
    const str = item.product.toString();
    if (!seen.has(str) && merged.length < MAX_ITEMS) {
      seen.add(str);
      merged.push(item);
    }
  }

  user.recentlyViewed = merged;
  await user.save();

  res.json({ ids: merged.map(item => item.product) });
});

/**
 * GET /api/recently-viewed
 */
export const getRecentlyViewed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('recentlyViewed.product');
  const products = user.recentlyViewed
    .map(item => item.product)
    .filter(p => p && p._id);
  res.json(products);
});

/**
 * GET /api/recently-viewed/by-ids?ids=id1,id2
 * Public — for guest users reading from localStorage
 */
export const getRecentlyViewedByIds = asyncHandler(async (req, res) => {
  const ids = (req.query.ids || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!ids.length) return res.json([]);

  const products = await Product.find({ _id: { $in: ids } });
  const ordered = ids
    .map(id => products.find(p => p._id.toString() === id))
    .filter(Boolean);

  res.json(ordered);
});
