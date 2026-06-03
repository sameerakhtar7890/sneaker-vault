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
  const order = await Order.findById(req.params.id).populate('user_id', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  res.json(order);
});

/* ADMIN */
export const allOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user_id', 'name email')
    .sort('-createdAt')
    .limit(500);
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401); throw new Error('Not authorized to view this order');
  }
  res.json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  const { status, payment_status } = req.body;
  if (status)         order.status         = status;
  if (payment_status) order.payment_status = payment_status;
  const updated = await order.save();
  res.json(updated);
});
