import Stripe from 'stripe';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import { applyCoupon, calcSubtotal } from '../utils/couponUtils.js';
import {
  buildCartItemsFromClient,
  fulfillOrder,
  sendConfirmationForOrder,
  normalizeEmail
} from '../services/orderFulfillment.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const isDemoStripe = () =>
  !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

async function resolveCheckoutTotals(items, couponCode) {
  const subtotal = calcSubtotal(items);
  if (!subtotal) throw new Error('Invalid cart total');

  if (!couponCode?.trim()) {
    return { subtotal, discountAmount: 0, total: subtotal, couponCode: null };
  }

  const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
  if (!coupon) throw new Error('Invalid promo code');

  return applyCoupon(coupon, subtotal);
}

function paymentOwnerId(req) {
  return req.user ? req.user._id.toString() : 'guest';
}

/**
 * POST /api/checkout/create-payment-intent
 */
export const createPaymentIntent = asyncHandler(async (req, res) => {
  if (isDemoStripe()) {
    res.status(400);
    throw new Error('Stripe is not configured — use demo checkout');
  }

  const { items = [], currency = 'usd', metadata = {}, couponCode, confirmation_email } = req.body;

  let totals;
  try {
    totals = await resolveCheckoutTotals(items, couponCode);
  } catch (err) {
    res.status(400);
    throw err;
  }

  const amount = Math.round(totals.total * 100);
  if (!amount || amount < 50) { res.status(400); throw new Error('Invalid cart total'); }

  const intent = await stripe.paymentIntents.create({
    amount, currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      ...metadata,
      userId: paymentOwnerId(req),
      confirmationEmail: normalizeEmail(confirmation_email) || '',
      subtotal: totals.subtotal.toFixed(2),
      discountAmount: totals.discountAmount.toFixed(2),
      couponCode: totals.couponCode || ''
    }
  });

  res.json({
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amount,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    total: totals.total,
    couponCode: totals.couponCode
  });
});

async function incrementCouponUsage(couponCode) {
  if (!couponCode) return;
  await Coupon.findOneAndUpdate(
    { code: couponCode.toUpperCase() },
    { $inc: { usedCount: 1 } }
  );
}

function assertPaymentOwnership(intent, req) {
  const metaUserId = intent.metadata?.userId;
  const ownerId = paymentOwnerId(req);
  if (metaUserId !== ownerId) {
    res.status(403);
    throw new Error('Payment does not belong to this checkout session');
  }
}

/**
 * POST /api/checkout/complete-order
 */
export const completeOrder = asyncHandler(async (req, res) => {
  const {
    paymentIntentId, cart_items, shipping_address, confirmation_email,
    subtotal, discount_amount, coupon_code, total_price
  } = req.body;

  if (!paymentIntentId) { res.status(400); throw new Error('paymentIntentId is required'); }
  if (!confirmation_email) { res.status(400); throw new Error('Confirmation email is required'); }
  if (!shipping_address?.fullName || !shipping_address?.address) {
    res.status(400); throw new Error('Shipping address is required');
  }

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== 'succeeded') {
    res.status(400); throw new Error('Payment has not been completed');
  }

  assertPaymentOwnership(intent, req);

  const expectedAmount = Math.round(Number(total_price) * 100);
  if (intent.amount !== expectedAmount) {
    res.status(400); throw new Error('Payment amount does not match order total');
  }

  const items = buildCartItemsFromClient(cart_items);
  const result = await fulfillOrder({
    userId: req.user?._id || null,
    confirmation_email,
    cart_items: items,
    shipping_address,
    payment_intent_id: paymentIntentId,
    subtotal,
    discount_amount,
    coupon_code,
    total_price
  });

  await incrementCouponUsage(coupon_code || intent.metadata?.couponCode);

  res.status(201).json({
    order: result.order,
    emailSent: result.email.sent,
    emailSkipped: result.email.skipped || false,
    confirmationEmail: result.email.email
  });
});

/**
 * POST /api/checkout/demo-order
 */
export const completeDemoOrder = asyncHandler(async (req, res) => {
  if (!isDemoStripe() && process.env.ALLOW_DEMO_ORDERS !== 'true') {
    res.status(403); throw new Error('Demo checkout is not enabled');
  }

  const {
    cart_items, shipping_address, confirmation_email,
    subtotal, discount_amount, coupon_code, total_price
  } = req.body;

  if (!confirmation_email) { res.status(400); throw new Error('Confirmation email is required'); }
  if (!shipping_address?.fullName || !shipping_address?.address) {
    res.status(400); throw new Error('Shipping address is required');
  }

  const items = buildCartItemsFromClient(cart_items);
  const guestSuffix = req.user ? req.user._id : `guest_${Date.now()}`;

  const result = await fulfillOrder({
    userId: req.user?._id || null,
    confirmation_email,
    cart_items: items,
    shipping_address,
    payment_intent_id: `demo_${guestSuffix}`,
    subtotal,
    discount_amount,
    coupon_code,
    total_price
  });

  res.status(201).json({
    order: result.order,
    emailSent: result.email.sent,
    emailSkipped: result.email.skipped || false,
    confirmationEmail: result.email.email
  });
});

async function handlePaidOrder(paymentIntentId, couponCode) {
  const order = await Order.findOne({ payment_intent_id: paymentIntentId });
  if (!order) return;

  if (order.payment_status !== 'paid') {
    order.payment_status = 'paid';
    order.status = 'processing';
    await order.save();
  }

  const user = order.user_id ? await User.findById(order.user_id) : null;
  await sendConfirmationForOrder(order, { user });
  await incrementCouponUsage(couponCode);
}

/**
 * POST /api/checkout/webhook  (raw body)
 */
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handlePaidOrder(session.payment_intent, session.metadata?.couponCode);
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        await handlePaidOrder(pi.id, pi.metadata?.couponCode);
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        await Order.findOneAndUpdate({ payment_intent_id: pi.id }, { payment_status: 'failed' });
        break;
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).send('Internal webhook error');
  }
};
