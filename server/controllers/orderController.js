import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import { normalizeEmail } from '../services/orderFulfillment.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const isDemoStripe = () => !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

export const createOrder = asyncHandler(async (req, res) => {
  const {
    cart_items, shipping_address, total_price, payment_intent_id,
    subtotal, discount_amount, coupon_code, confirmation_email
  } = req.body;
  if (!cart_items?.length) { res.status(400); throw new Error('Cart is empty'); }

  const email = normalizeEmail(confirmation_email || req.user.email);
  if (!email) { res.status(400); throw new Error('Confirmation email is required'); }

  const order = await Order.create({
    user_id: req.user._id,
    is_guest: false,
    confirmation_email: email,
    cart_items,
    shipping_address,
    subtotal,
    discount_amount: discount_amount || 0,
    coupon_code: coupon_code || null,
    total_price,
    payment_intent_id
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
  const order = await Order.findById(req.params.id).populate('user_id', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  const emailQuery = normalizeEmail(req.query.email);

  if (req.user?.isAdmin) {
    return res.json(order);
  }

  if (order.is_guest || !order.user_id) {
    if (!emailQuery || emailQuery !== order.confirmation_email) {
      res.status(403);
      throw new Error('Enter the email used at checkout to view this order');
    }
    return res.json(order);
  }

  if (!req.user) {
    res.status(401);
    throw new Error('Login required, or open the tracking link from your confirmation email');
  }

  if (order.user_id._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this order');
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

// @desc    Cancel an order (only if status is 'created')
// @route   POST /api/orders/:id/cancel
// @access  Private (owner) or Guest (with matching email)
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  // ── Authorization ────────────────────────────────────────────────────────
  const emailQuery = normalizeEmail(req.query.email || req.body.email);

  if (req.user?.isAdmin) {
    // Admin can always cancel
  } else if (order.is_guest || !order.user_id) {
    // Guest order — verify by email
    if (!emailQuery || emailQuery !== order.confirmation_email) {
      res.status(403); throw new Error('Provide the email used at checkout to cancel this order');
    }
  } else {
    // Registered user — must be the order owner
    if (!req.user) { res.status(401); throw new Error('Login required to cancel this order'); }
    if (order.user_id.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized to cancel this order');
    }
  }

  // ── Status Gate ──────────────────────────────────────────────────────────
  if (order.status !== 'created') {
    res.status(400);
    throw new Error(
      order.status === 'cancelled'
        ? 'This order has already been cancelled'
        : `Order cannot be cancelled once it has moved to '${order.status}'`
    );
  }

  // ── Cancel ───────────────────────────────────────────────────────────────
  order.status = 'cancelled';

  // ── Stripe Refund (if paid and real Stripe key is configured) ────────────
  let refundResult = null;
  if (order.payment_status === 'paid' && order.payment_intent_id && !isDemoStripe()) {
    try {
      refundResult = await stripe.refunds.create({
        payment_intent: order.payment_intent_id,
        reason: 'requested_by_customer'
      });
      order.payment_status = 'refunded';
    } catch (stripeErr) {
      console.error('Stripe refund failed:', stripeErr.message);
      // Still cancel but note refund failed — support can handle manually
    }
  } else if (order.payment_status === 'paid' && isDemoStripe()) {
    // Demo mode: mark refunded without hitting Stripe
    order.payment_status = 'refunded';
  }

  const updated = await order.save();
  res.json({
    order: updated,
    refundIssued: updated.payment_status === 'refunded',
    refundId: refundResult?.id || null
  });
});

// CSV helper: wrap a cell value to handle commas, quotes, newlines
const csvCell = (val) => {
  const str = val == null ? '' : String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const exportOrdersCSV = asyncHandler(async (req, res) => {
  const { status, payment_status, from, to } = req.query;
  const filter = {};
  if (status)         filter.status         = status;
  if (payment_status) filter.payment_status = payment_status;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to)   filter.createdAt.$lte = new Date(new Date(to).setHours(23,59,59,999));
  }

  const orders = await Order.find(filter)
    .populate('user_id', 'name email')
    .sort('-createdAt')
    .lean();

  const headers = [
    'Order ID', 'Date', 'Email', 'Customer Name', 'Type',
    'Shipping Name', 'Shipping Address', 'Shipping City', 'Shipping Postal', 'Shipping Country',
    'Subtotal', 'Discount', 'Coupon Code', 'Shipping Cost', 'Total',
    'Payment Status', 'Order Status',
    'Items (Name x Qty x Size @ Price)'
  ];

  const rows = orders.map(o => {
    const customerName = o.user_id?.name || (o.is_guest ? 'Guest' : '—');
    const email = o.confirmation_email || o.user_id?.email || '';
    const type = o.is_guest ? 'Guest' : 'Registered';
    const addr = o.shipping_address || {};
    const items = (o.cart_items || [])
      .map(i => `${i.name} x${i.qty} (Size ${i.size}) @ $${i.price.toFixed(2)}`)
      .join(' | ');

    return [
      o._id.toString(),
      new Date(o.createdAt).toISOString().slice(0, 10),
      email,
      customerName,
      type,
      addr.fullName || '',
      addr.address  || '',
      addr.city     || '',
      addr.postalCode || '',
      addr.country  || '',
      (o.subtotal        || 0).toFixed(2),
      (o.discount_amount || 0).toFixed(2),
      o.coupon_code || '',
      (o.shipping_cost   || 0).toFixed(2),
      (o.total_price     || 0).toFixed(2),
      o.payment_status,
      o.status,
      items
    ].map(csvCell).join(',');
  });

  const csv = [headers.map(csvCell).join(','), ...rows].join('\r\n');
  const filename = `sneaker-vault-orders-${new Date().toISOString().slice(0,10)}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send('\uFEFF' + csv); // BOM for Excel UTF-8 compatibility
});

