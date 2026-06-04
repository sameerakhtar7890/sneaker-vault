import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

const APP_VERSION = process.env.PWA_VERSION || '1.0.0';

export const getPwaInfo = asyncHandler(async (_req, res) => {
  const productCount = await Product.countDocuments();
  res.json({
    name: 'Sneaker Vault',
    shortName: 'Vault',
    version: APP_VERSION,
    productCount,
    offlineFeatures: [
      'browse_cached_catalog',
      'view_cart',
      'wishlist_compare_local',
      'saved_addresses_local'
    ],
    onlineOnlyFeatures: [
      'checkout',
      'login_register',
      'place_order',
      'reviews',
      'admin'
    ],
    catalogEndpoint: '/api/pwa/catalog',
    updatedAt: new Date().toISOString()
  });
});

export const getOfflineCatalog = asyncHandler(async (_req, res) => {
  const products = await Product.find({})
    .select('name slug brand price description images sizes stock category featured rating numReviews createdAt')
    .sort({ featured: -1, createdAt: -1 })
    .lean();

  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    version: APP_VERSION,
    updatedAt: new Date().toISOString(),
    count: products.length,
    products
  });
});
