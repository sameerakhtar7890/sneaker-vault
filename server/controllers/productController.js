import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import StockAlert from '../models/StockAlert.js';
import { sendBackInStockEmail } from '../utils/email.js';

const SORT_MAP = {
  newest:     { createdAt: -1 },
  oldest:     { createdAt:  1 },
  price_asc:  { price:  1 },
  price_desc: { price: -1 },
  popular:    { rating: -1, numReviews: -1 },
};

export const listProducts = asyncHandler(async (req, res) => {
  const { brand, minPrice, maxPrice, size, q, featured, sort = 'newest', page = 1, limit = 12 } = req.query;
  const filter = {};
  if (brand)    filter.brand = brand;
  if (size)     filter.sizes = Number(size);
  if (featured) filter.featured = featured === 'true';
  if (minPrice || maxPrice) filter.price = {
    ...(minPrice && { $gte: Number(minPrice) }),
    ...(maxPrice && { $lte: Number(maxPrice) })
  };
  if (q) filter.$text = { $search: q };
  
  const pg  = Number(page);
  const lmt = Number(limit);
  const sortObj = SORT_MAP[sort] || SORT_MAP.newest;
  
  const count    = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortObj)
    .skip((pg - 1) * lmt)
    .limit(lmt);
    
  res.json({ products, page: pg, pages: Math.ceil(count / lmt), total: count });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const wasOutOfStock = product.stock === 0;
  const isRestocked = wasOutOfStock && req.body.stock !== undefined && Number(req.body.stock) > 0;

  Object.assign(product, req.body);
  const updated = await product.save();

  if (isRestocked) {
    // Find pending alerts and send restock emails
    const alerts = await StockAlert.find({ product: product._id, status: 'pending' });
    if (alerts.length > 0) {
      Promise.all(alerts.map(async (alert) => {
        try {
          await sendBackInStockEmail(alert.email, updated);
          alert.status = 'notified';
          await alert.save();
        } catch (err) {
          console.error(`Failed to send back-in-stock email to ${alert.email}:`, err.message);
        }
      })).catch(console.error);
    }
  }

  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
});

const updateProductRating = (product) => {
  const approvedReviews = product.reviews.filter(r => r.approved);
  product.numReviews = approvedReviews.length;
  if (approvedReviews.length === 0) {
    product.rating = 0;
  } else {
    product.rating = approvedReviews.reduce((acc, item) => item.rating + acc, 0) / approvedReviews.length;
  }
};

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) { res.status(404); throw new Error('Product not found'); }

  const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    res.status(400); throw new Error('Product already reviewed');
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
    approved: false
  };

  product.reviews.push(review);
  updateProductRating(product);

  await product.save();
  res.status(201).json({ message: 'Review added. Waiting for admin approval.' });
});

// Admin Review Moderation Controllers
export const getPendingReviews = asyncHandler(async (req, res) => {
  const products = await Product.find({ 'reviews.approved': false });
  let pending = [];
  products.forEach(p => {
    p.reviews.forEach(r => {
      if (!r.approved) {
        pending.push({
          _id: r._id,
          productId: p._id,
          productName: p.name,
          productSlug: p.slug,
          user: r.user,
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt
        });
      }
    });
  });
  res.json(pending);
});

export const approveReview = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;
  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const review = product.reviews.id(reviewId);
  if (!review) { res.status(404); throw new Error('Review not found'); }

  review.approved = true;
  updateProductRating(product);
  await product.save();

  res.json({ message: 'Review approved' });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;
  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const review = product.reviews.id(reviewId);
  if (!review) { res.status(404); throw new Error('Review not found'); }

  product.reviews.pull(reviewId);
  updateProductRating(product);
  await product.save();

  res.json({ message: 'Review deleted' });
});

function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i+1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }
  return lines;
}

export const importBulkCSV = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a CSV file');
  }

  const csvContent = req.file.buffer.toString('utf8');
  const rows = parseCSV(csvContent).map(r => r.map(cell => cell.trim()));

  if (rows.length < 2) {
    res.status(400);
    throw new Error('CSV file is empty or only contains header');
  }

  const headers = rows[0].map(h => h.toLowerCase());
  const productRows = rows.slice(1);

  const productsToInsert = [];
  const errors = [];

  for (let i = 0; i < productRows.length; i++) {
    const row = productRows[i];
    if (row.length === 0 || (row.length === 1 && row[0] === '')) {
      continue;
    }

    const rowNum = i + 2;
    const item = {};

    headers.forEach((header, colIndex) => {
      const val = row[colIndex];
      if (val !== undefined) {
        item[header] = val;
      }
    });

    if (!item.name) {
      errors.push(`Row ${rowNum}: Name is required`);
      continue;
    }
    if (!item.brand) {
      errors.push(`Row ${rowNum}: Brand is required`);
      continue;
    }
    if (!item.price || isNaN(Number(item.price))) {
      errors.push(`Row ${rowNum}: Valid price is required`);
      continue;
    }

    const price = Number(item.price);
    const stock = item.stock ? Number(item.stock) : 0;
    const featured = item.featured === 'true' || item.featured === '1' || item.featured === 'yes';

    let sizes = [];
    if (item.sizes) {
      sizes = item.sizes.split(',').map(s => Number(s.trim())).filter(s => !isNaN(s));
    }

    let images = [];
    if (item.images) {
      images = item.images.split(',').map(img => img.trim()).filter(Boolean);
    } else {
      images = ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'];
    }

    productsToInsert.push({
      name: item.name,
      brand: item.brand,
      price,
      description: item.description || '',
      images,
      sizes,
      stock,
      category: item.category || 'sneakers',
      featured,
      seoTitle: item.seotitle || undefined,
      seoDescription: item.seodescription || undefined,
      ogImage: item.ogimage || undefined
    });
  }

  if (errors.length > 0) {
    res.status(400).json({
      message: 'Validation failed for some rows',
      errors
    });
    return;
  }

  if (productsToInsert.length === 0) {
    res.status(400);
    throw new Error('No valid products found to import');
  }

  const inserted = await Product.insertMany(productsToInsert);

  res.status(201).json({
    message: `Successfully imported ${inserted.length} products`,
    count: inserted.length
  });
});
