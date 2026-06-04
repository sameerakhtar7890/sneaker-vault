import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import SeoSettings from '../models/SeoSettings.js';
import {
  buildPageMeta,
  buildProductMeta,
  resolveSiteUrl,
  toAbsoluteUrl
} from '../utils/seoUtils.js';

const DEFAULT_PAGES = [
  { path: '/', title: 'Luxury Sneakers & Exclusive Drops', description: 'Shop curated premium sneakers, limited releases, and vault-exclusive pairs.' },
  { path: '/shop', title: 'Shop All Sneakers', description: 'Browse Nike, Adidas, Jordan and more. Filter by brand, size, and price.' },
  { path: '/about', title: 'About Sneaker Vault', description: 'Our story, mission, and commitment to authentic luxury footwear.' },
  { path: '/contact', title: 'Contact Us', description: 'Get in touch with the Sneaker Vault team for orders, sizing, and support.' },
  { path: '/faq', title: 'FAQ', description: 'Answers about orders, shipping, returns, sizing, and your Sneaker Vault account.' },
  { path: '/shipping', title: 'Shipping & Returns', description: 'Delivery times, tracking, 30-day returns, and refund policy.' },
  { path: '/privacy', title: 'Privacy Policy', description: 'How Sneaker Vault collects, uses, and protects your personal information.' },
  { path: '/terms', title: 'Terms of Service', description: 'Terms and conditions for using Sneaker Vault and placing orders.' },
  { path: '/login', title: 'Sign In', description: 'Access your Sneaker Vault account, orders, and wishlist.', noIndex: true },
  { path: '/register', title: 'Create Account', description: 'Join Sneaker Vault for faster checkout and order tracking.', noIndex: true },
  { path: '/wishlist', title: 'Your Wishlist', description: 'Saved sneakers you love.', noIndex: true },
  { path: '/compare', title: 'Compare Sneakers', description: 'Compare up to 3 products side by side.' },
  { path: '/checkout', title: 'Checkout', description: 'Secure checkout for your Sneaker Vault order.', noIndex: true },
  { path: '/profile', title: 'My Account', description: 'Manage your profile, orders, and addresses.', noIndex: true },
  { path: '/success', title: 'Order Confirmed', description: 'Thank you for your purchase.', noIndex: true },
  { path: '/newsletter/unsubscribe', title: 'Newsletter Preferences', description: 'Manage your email subscription.', noIndex: true }
];

async function getOrCreateSettings() {
  let settings = await SeoSettings.findOne({ key: 'global' });
  if (!settings) {
    settings = await SeoSettings.create({
      key: 'global',
      siteUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      pages: DEFAULT_PAGES
    });
    return settings;
  }

  const existing = new Set(settings.pages.map(p => p.path));
  let changed = false;
  for (const page of DEFAULT_PAGES) {
    if (!existing.has(page.path)) {
      settings.pages.push(page);
      changed = true;
    }
  }
  if (changed) await settings.save();
  return settings;
}

export const getSeoSettings = asyncHandler(async (_req, res) => {
  const settings = await getOrCreateSettings();
  const siteUrl = resolveSiteUrl(settings);

  res.json({
    siteName: settings.siteName,
    titleSuffix: settings.titleSuffix,
    defaultDescription: settings.defaultDescription,
    defaultOgImage: toAbsoluteUrl(settings.defaultOgImage, siteUrl),
    siteUrl,
    twitterCard: settings.twitterCard,
    pages: settings.pages
  });
});

export const getPageSeo = asyncHandler(async (req, res) => {
  const path = req.query.path || '/';
  const settings = await getOrCreateSettings();
  res.json(buildPageMeta(path, settings));
});

export const getProductSeo = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const settings = await getOrCreateSettings();
  res.json(buildProductMeta(product, settings));
});

export const updateSeoSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();

  if (req.body.siteName != null) settings.siteName = req.body.siteName;
  if (req.body.titleSuffix != null) settings.titleSuffix = req.body.titleSuffix;
  if (req.body.defaultDescription != null) settings.defaultDescription = req.body.defaultDescription;
  if (req.body.defaultOgImage != null) settings.defaultOgImage = req.body.defaultOgImage;
  if (req.body.siteUrl != null) settings.siteUrl = req.body.siteUrl;
  if (req.body.twitterCard != null) settings.twitterCard = req.body.twitterCard;
  if (Array.isArray(req.body.pages)) settings.pages = req.body.pages;

  await settings.save();
  const siteUrl = resolveSiteUrl(settings);

  res.json({
    siteName: settings.siteName,
    titleSuffix: settings.titleSuffix,
    defaultDescription: settings.defaultDescription,
    defaultOgImage: toAbsoluteUrl(settings.defaultOgImage, siteUrl),
    siteUrl,
    twitterCard: settings.twitterCard,
    pages: settings.pages
  });
});
