import asyncHandler from 'express-async-handler';
import StockAlert from '../models/StockAlert.js';
import Product from '../models/Product.js';

export const createStockAlert = asyncHandler(async (req, res) => {
  const { email, productId } = req.body;

  if (!email || !productId) {
    res.status(400);
    throw new Error('Please provide email and productId');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if product is already in stock. If so, no need to alert.
  if (product.stock > 0) {
    res.status(400);
    throw new Error('Product is already in stock!');
  }

  // Check for existing pending alert
  const existingAlert = await StockAlert.findOne({
    email: email.toLowerCase(),
    product: productId,
    status: 'pending'
  });

  if (existingAlert) {
    return res.status(200).json({ message: 'You have already subscribed to this product alert.' });
  }

  const alert = await StockAlert.create({
    email: email.toLowerCase(),
    product: productId,
    status: 'pending'
  });

  res.status(201).json({
    message: 'Stock alert created successfully.',
    alert
  });
});
