import asyncHandler from 'express-async-handler';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import { sendNewsletterWelcomeEmail } from '../utils/email.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export const subscribe = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!email || !EMAIL_RE.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }

  let subscriber = await NewsletterSubscriber.findOne({ email });

  if (subscriber?.status === 'active') {
    return res.json({
      message: 'You are already subscribed to our newsletter',
      alreadySubscribed: true,
      email: subscriber.email
    });
  }

  if (subscriber?.status === 'unsubscribed') {
    subscriber.status = 'active';
    subscriber.unsubscribedAt = null;
    subscriber.subscribedAt = new Date();
    subscriber.source = req.body.source || 'footer';
    if (req.user?._id) subscriber.user_id = req.user._id;
    await subscriber.save();
  } else {
    subscriber = await NewsletterSubscriber.create({
      email,
      source: req.body.source || 'footer',
      user_id: req.user?._id || null
    });
  }

  const emailResult = await sendNewsletterWelcomeEmail(
    subscriber.email,
    subscriber.unsubscribeToken
  );

  res.status(201).json({
    message: 'Successfully subscribed! Check your inbox for a welcome email.',
    email: subscriber.email,
    emailSent: emailResult.success,
    emailDevMode: Boolean(emailResult.dev)
  });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const token = req.params.token || req.query.token;
  if (!token) {
    res.status(400);
    throw new Error('Invalid unsubscribe link');
  }

  const subscriber = await NewsletterSubscriber.findOne({ unsubscribeToken: token });
  if (!subscriber) {
    res.status(404);
    throw new Error('Subscription not found or link expired');
  }

  if (subscriber.status === 'unsubscribed') {
    return res.json({
      message: 'You have already unsubscribed',
      email: subscriber.email,
      alreadyUnsubscribed: true
    });
  }

  subscriber.status = 'unsubscribed';
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  res.json({
    message: 'You have been unsubscribed from Sneaker Vault emails',
    email: subscriber.email
  });
});

export const getSubscribersAdmin = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const filter = status && status !== 'all' ? { status } : {};
  const subscribers = await NewsletterSubscriber.find(filter)
    .sort({ createdAt: -1 })
    .select('-unsubscribeToken')
    .lean();

  const stats = await NewsletterSubscriber.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const counts = { active: 0, unsubscribed: 0, total: 0 };
  stats.forEach(s => {
    counts[s._id] = s.count;
    counts.total += s.count;
  });

  res.json({ subscribers, counts });
});

export const deleteSubscriberAdmin = asyncHandler(async (req, res) => {
  const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
  if (!subscriber) {
    res.status(404);
    throw new Error('Subscriber not found');
  }
  res.json({ message: 'Subscriber removed' });
});
