import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

export const listProducts = asyncHandler(async (req, res) => {
  const { brand, minPrice, maxPrice, size, q, featured } = req.query;
  const filter = {};
  if (brand)    filter.brand = brand;
  if (size)     filter.sizes = Number(size);
  if (featured) filter.featured = featured === 'true';
  if (minPrice || maxPrice) filter.price = {
    ...(minPrice && { $gte: Number(minPrice) }),
    ...(maxPrice && { $lte: Number(maxPrice) })
  };
  if (q) filter.$text = { $search: q };
  const products = await Product.find(filter).sort('-createdAt').limit(200);
  res.json(products);
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
