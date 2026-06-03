import Stripe from 'stripe';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * POST /api/checkout/create-payment-intent
 * body: { items: [{ price, qty }], currency?: 'usd' }
 * Server recomputes total — never trust the client total.
 */
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { items = [], currency = 'usd', metadata = {} } = req.body;
  const amount = items.reduce((sum, i) => sum + Math.round(Number(i.price) * 100) * Number(i.qty || 1), 0);
  if (!amount || amount < 50) { res.status(400); throw new Error('Invalid cart total'); }

  const intent = await stripe.paymentIntents.create({
    amount, currency,
    automatic_payment_methods: { enabled: true },
    metadata: { ...metadata, userId: req.user?._id?.toString() || 'guest' }
  });

  res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id, amount });
});

/**
 * POST /api/checkout/webhook  (raw body)
 * Listens for checkout.session.completed and payment_intent.succeeded.
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
        await Order.findOneAndUpdate(
          { payment_intent_id: session.payment_intent },
          { payment_status: 'paid', status: 'processing' }
        );
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        await Order.findOneAndUpdate(
          { payment_intent_id: pi.id },
          { payment_status: 'paid', status: 'processing' }
        );
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
