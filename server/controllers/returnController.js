import asyncHandler from 'express-async-handler';
import ReturnRequest from '../models/ReturnRequest.js';
import Order from '../models/Order.js';

const RETURN_WINDOW_DAYS = 30;

function isWithinReturnWindow(order) {
  const base = new Date(order.updatedAt || order.createdAt);
  const deadline = new Date(base);
  deadline.setDate(deadline.getDate() + RETURN_WINDOW_DAYS);
  return new Date() <= deadline;
}

/**
 * POST /api/returns
 * body: { orderId, reason, description? }
 */
export const createReturnRequest = asyncHandler(async (req, res) => {
  const { orderId, reason, description = '' } = req.body;
  if (!orderId) { res.status(400); throw new Error('orderId is required'); }
  if (!reason) { res.status(400); throw new Error('Return reason is required'); }

  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (!order.user_id || order.user_id.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized to return this order');
  }
  if (order.status !== 'delivered') {
    res.status(400); throw new Error('Returns are only available for delivered orders');
  }
  if (order.payment_status !== 'paid') {
    res.status(400); throw new Error('Only paid orders are eligible for returns');
  }
  if (!isWithinReturnWindow(order)) {
    res.status(400); throw new Error(`Return window expired (${RETURN_WINDOW_DAYS} days after delivery)`);
  }

  const existing = await ReturnRequest.findOne({ order: orderId });
  if (existing) { res.status(400); throw new Error('A return request already exists for this order'); }

  const returnReq = await ReturnRequest.create({
    order: orderId,
    user: req.user._id,
    reason,
    description: description.trim()
  });

  const populated = await ReturnRequest.findById(returnReq._id)
    .populate('order')
    .populate('user', 'name email');

  res.status(201).json(populated);
});

/**
 * GET /api/returns/mine
 */
export const myReturnRequests = asyncHandler(async (req, res) => {
  const returns = await ReturnRequest.find({ user: req.user._id })
    .populate('order')
    .sort('-createdAt');
  res.json(returns);
});

/**
 * GET /api/returns/order/:orderId
 */
export const getReturnByOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (!order.user_id || (order.user_id.toString() !== req.user._id.toString() && !req.user.isAdmin)) {
    res.status(403); throw new Error('Not authorized');
  }

  const returnReq = await ReturnRequest.findOne({ order: req.params.orderId })
    .populate('order')
    .populate('user', 'name email');

  res.json(returnReq || null);
});

/**
 * GET /api/returns/:id
 */
export const getReturnRequest = asyncHandler(async (req, res) => {
  const returnReq = await ReturnRequest.findById(req.params.id)
    .populate('order')
    .populate('user', 'name email');
  if (!returnReq) { res.status(404); throw new Error('Return request not found'); }
  if (returnReq.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403); throw new Error('Not authorized');
  }
  res.json(returnReq);
});

/* ADMIN */
export const allReturnRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const returns = await ReturnRequest.find(filter)
    .populate({ path: 'order', populate: { path: 'user_id', select: 'name email' } })
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(500);
  res.json(returns);
});

/**
 * PATCH /api/returns/:id
 * body: { status, admin_note?, refund_amount? }
 */
export const updateReturnStatus = asyncHandler(async (req, res) => {
  const returnReq = await ReturnRequest.findById(req.params.id).populate('order');
  if (!returnReq) { res.status(404); throw new Error('Return request not found'); }

  const { status, admin_note, refund_amount } = req.body;
  const validStatuses = ['pending', 'approved', 'rejected', 'refunded'];

  if (status != null) {
    if (!validStatuses.includes(status)) {
      res.status(400); throw new Error('Invalid return status');
    }
    returnReq.status = status;
  }
  if (admin_note != null) returnReq.admin_note = admin_note;
  if (refund_amount != null) returnReq.refund_amount = Number(refund_amount);

  if (status === 'refunded' && returnReq.refund_amount == null) {
    returnReq.refund_amount = returnReq.order?.total_price || 0;
  }

  const updated = await returnReq.save();
  const populated = await ReturnRequest.findById(updated._id)
    .populate('order')
    .populate('user', 'name email');

  res.json(populated);
});
