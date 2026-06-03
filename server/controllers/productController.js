import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

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
  Object.assign(product, req.body);
  const updated = await product.save();
  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
});

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
    comment
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ message: 'Review added' });
});
