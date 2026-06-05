import Order from '../models/Order.js';
import EmailLog from '../models/EmailLog.js';
import User from '../models/User.js';
import { sendOrderConfirmationEmail, buildOrderConfirmationEmail } from '../utils/email.js';
import { calcSubtotal } from '../utils/couponUtils.js';

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function buildCartItemsFromClient(items) {
  return items.map(item => ({
    product: item._id || item.product,
    name: item.name,
    image: item.images?.[0] || item.image || '',
    size: item.size,
    qty: item.qty || 1,
    price: Number(item.price)
  }));
}

export function validateOrderTotals(cartItems, { subtotal, discount_amount, shipping_cost, total_price }) {
  const computedSubtotal = calcSubtotal(cartItems.map(i => ({ price: i.price, qty: i.qty })));
  const discount = Number(discount_amount) || 0;
  const shipping = Number(shipping_cost) || 0;
  const computedTotal = Math.round((computedSubtotal - discount + shipping) * 100) / 100;

  if (Math.abs(computedSubtotal - Number(subtotal)) > 0.02) {
    throw new Error('Order subtotal mismatch');
  }
  if (Math.abs(computedTotal - Number(total_price)) > 0.02) {
    throw new Error('Order total mismatch');
  }
}

function recipientFromOrder(order) {
  return {
    email: order.confirmation_email,
    name: order.shipping_address?.fullName || 'Customer'
  };
}

export async function sendConfirmationForOrder(order, options = {}) {
  const recipient = recipientFromOrder(order);
  const user = options.user || null;

  const skipForAccountPrefs = user
    && user.emailNotifications === false
    && normalizeEmail(user.email) === normalizeEmail(order.confirmation_email);

  if (skipForAccountPrefs) {
    await EmailLog.findOneAndUpdate(
      { order: order._id, type: 'order_confirmation' },
      {
        user: user?._id || null,
        order: order._id,
        type: 'order_confirmation',
        to: recipient.email,
        subject: 'Skipped',
        status: 'skipped'
      },
      { upsert: true, new: true }
    );
    return { sent: false, skipped: true, email: recipient.email };
  }

  const existing = await EmailLog.findOne({ order: order._id, type: 'order_confirmation', status: 'sent' });
  if (existing) return { sent: true, duplicate: true, email: recipient.email };

  const { subject } = buildOrderConfirmationEmail(recipient, order);
  const result = await sendOrderConfirmationEmail(recipient, order);

  await EmailLog.findOneAndUpdate(
    { order: order._id, type: 'order_confirmation' },
    {
      user: user?._id || null,
      order: order._id,
      type: 'order_confirmation',
      to: recipient.email,
      subject,
      status: result.success ? 'sent' : 'failed',
      error: result.error || null
    },
    { upsert: true, new: true }
  );

  return { sent: result.success, dev: result.dev, email: recipient.email };
}

export async function fulfillOrder({
  userId = null,
  confirmation_email,
  cart_items,
  shipping_address,
  payment_intent_id,
  subtotal,
  discount_amount,
  shipping_cost = 0,
  coupon_code,
  total_price
}) {
  const email = normalizeEmail(confirmation_email);
  if (!email) throw new Error('Confirmation email is required');

  let user = null;
  if (userId) {
    user = await User.findById(userId);
    if (!user) throw new Error('User not found');
  }

  validateOrderTotals(cart_items, { subtotal, discount_amount, shipping_cost, total_price });

  let order = payment_intent_id
    ? await Order.findOne({ payment_intent_id })
    : null;

  if (!order) {
    order = await Order.create({
      user_id: userId || null,
      is_guest: !userId,
      confirmation_email: email,
      cart_items,
      shipping_address,
      subtotal,
      discount_amount: discount_amount || 0,
      shipping_cost: shipping_cost || 0,
      coupon_code: coupon_code || null,
      total_price,
      payment_intent_id: payment_intent_id || undefined,
      payment_status: 'paid',
      status: 'processing'
    });
  } else {
    order.confirmation_email = email;
    order.shipping_cost = shipping_cost || 0;
    if (order.payment_status !== 'paid') {
      order.payment_status = 'paid';
      order.status = 'processing';
    }
    await order.save();
  }

  const emailResult = await sendConfirmationForOrder(order, { user });
  return { order, email: emailResult };
}
