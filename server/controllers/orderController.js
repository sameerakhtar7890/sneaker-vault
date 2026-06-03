import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { cart_items, shipping_address, total_price, payment_intent_id } = req.body;
  if (!cart_items?.length) { res.status(400); throw new Error('Cart is empty'); }
  const order = await Order.create({
    user_id: req.user._id, cart_items, shipping_address, total_price, payment_intent_id
  });
  res.status(201).json(order);
});

export const myOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ user_id: req.user._id }).sort('-createdAt'));
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  res.json(order);
});
