import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import StockAlert from '../models/StockAlert.js';
import { sendBackInStockEmail } from '../utils/email.js';

const SORT_MAP = {
  newest:     { createdAt: -1 },
  oldest:     { createdAt:  1 },
  price_asc:  { price:  1 },
  price_desc: { price: -1 },
  popular:    { rating: -1, numReviews: -1 },
};

export const listProducts = asyncHandler(async (req, res) => {
  const { brand, minPrice, maxPrice, size, q, featured, sort = 'newest', page = 1, limit = 12 } = req.query;
  const filter = {};
  if (brand)    filter.brand = brand;
  if (size)     filter.sizes = Number(size);
  if (featured) filter.featured = featured === 'true';
  if (minPrice || maxPrice) filter.price = {
    ...(minPrice && { $gte: Number(minPrice) }),
    ...(maxPrice && { $lte: Number(maxPrice) })
  };
  if (q) filter.$text = { $search: q };
  
  const pg  = Number(page);
  const lmt = Number(limit);
  const sortObj = SORT_MAP[sort] || SORT_MAP.newest;
  
  const count    = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortObj)
    .skip((pg - 1) * lmt)
    .limit(lmt);
    
  res.json({ products, page: pg, pages: Math.ceil(count / lmt), total: count });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const wasOutOfStock = product.stock === 0;
  const isRestocked = wasOutOfStock && req.body.stock !== undefined && Number(req.body.stock) > 0;

  Object.assign(product, req.body);
  const updated = await product.save();

  if (isRestocked) {
    // Find pending alerts and send restock emails
    const alerts = await StockAlert.find({ product: product._id, status: 'pending' });
    if (alerts.length > 0) {
      Promise.all(alerts.map(async (alert) => {
        try {
          await sendBackInStockEmail(alert.email, updated);
          alert.status = 'notified';
          await alert.save();
        } catch (err) {
          console.error(`Failed to send back-in-stock email to ${alert.email}:`, err.message);
        }
      })).catch(console.error);
    }
  }

  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
});

const updateProductRating = (product) => {
  const approvedReviews = product.reviews.filter(r => r.approved);
  product.numReviews = approvedReviews.length;
  if (approvedReviews.length === 0) {
    product.rating = 0;
  } else {
    product.rating = approvedReviews.reduce((acc, item) => item.rating + acc, 0) / approvedReviews.length;
  }
};

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) { res.status(404); throw new Error('Product not found'); }

  const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    res.status(400); throw new Error('Product already reviewed');
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
    approved: false
  };

  product.reviews.push(review);
  updateProductRating(product);

  await product.save();
  res.status(201).json({ message: 'Review added. Waiting for admin approval.' });
});

// Admin Review Moderation Controllers
export const getPendingReviews = asyncHandler(async (req, res) => {
  const products = await Product.find({ 'reviews.approved': false });
  let pending = [];
  products.forEach(p => {
    p.reviews.forEach(r => {
      if (!r.approved) {
        pending.push({
          _id: r._id,
          productId: p._id,
          productName: p.name,
          productSlug: p.slug,
          user: r.user,
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt
        });
      }
    });
  });
  res.json(pending);
});

export const approveReview = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;
  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const review = product.reviews.id(reviewId);
  if (!review) { res.status(404); throw new Error('Review not found'); }

  review.approved = true;
  updateProductRating(product);
  await product.save();

  res.json({ message: 'Review approved' });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;
  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const review = product.reviews.id(reviewId);
  if (!review) { res.status(404); throw new Error('Review not found'); }

  product.reviews.pull(reviewId);
  updateProductRating(product);
  await product.save();

  res.json({ message: 'Review deleted' });
});
