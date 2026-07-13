import asyncHandler from 'express-async-handler';
import SizeGuide from '../models/SizeGuide.js';

function validateRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('At least one size row is required');
  }
  for (const row of rows) {
    if (!row.us?.trim()) throw new Error('Each row must have a US size');
  }
}

/**
 * GET /api/size-guides/for-brand/:brand
 * Returns brand-specific guide, falling back to default.
 */
export const getGuideForBrand = asyncHandler(async (req, res) => {
  const brand = decodeURIComponent(req.params.brand || '').trim();
  let guide = null;

  if (brand) {
    guide = await SizeGuide.findOne({
      brand: { $regex: new RegExp(`^${brand}$`, 'i') },
      isActive: true
    });
  }

  if (!guide) {
    guide = await SizeGuide.findOne({ isDefault: true, isActive: true });
  }

  if (!guide) {
    guide = await SizeGuide.findOne({ isActive: true }).sort('-createdAt');
  }

  if (!guide) { res.status(404); throw new Error('Size guide not found'); }
  res.json(guide);
});

/* ADMIN */
export const listSizeGuides = asyncHandler(async (_req, res) => {
  res.json(await SizeGuide.find({}).sort('-isDefault -createdAt'));
});

export const createSizeGuide = asyncHandler(async (req, res) => {
  const { name, brand, gender, rows, fitTips, isDefault, isActive } = req.body;
  if (!name?.trim()) { res.status(400); throw new Error('Name is required'); }

  validateRows(rows);

  if (isDefault) {
    await SizeGuide.updateMany({ isDefault: true }, { isDefault: false });
  }

  const guide = await SizeGuide.create({
    name: name.trim(),
    brand: brand?.trim() || null,
    gender: gender || 'unisex',
    rows: rows.map(r => ({
      us: String(r.us).trim(),
      uk: String(r.uk || '').trim(),
      eu: String(r.eu || '').trim(),
      cm: String(r.cm || '').trim()
    })),
    fitTips: fitTips || '',
    isDefault: Boolean(isDefault),
    isActive: isActive !== false
  });

  res.status(201).json(guide);
});

export const updateSizeGuide = asyncHandler(async (req, res) => {
  const guide = await SizeGuide.findById(req.params.id);
  if (!guide) { res.status(404); throw new Error('Size guide not found'); }

  const { name, brand, gender, rows, fitTips, isDefault, isActive } = req.body;

  if (name != null) guide.name = name.trim();
  if (brand !== undefined) guide.brand = brand?.trim() || null;
  if (gender != null) guide.gender = gender;
  if (rows != null) {
    validateRows(rows);
    guide.rows = rows.map(r => ({
      us: String(r.us).trim(),
      uk: String(r.uk || '').trim(),
      eu: String(r.eu || '').trim(),
      cm: String(r.cm || '').trim()
    }));
  }
  if (fitTips != null) guide.fitTips = fitTips;
  if (isActive != null) guide.isActive = Boolean(isActive);
  if (isDefault != null) {
    if (isDefault) {
      await SizeGuide.updateMany({ _id: { $ne: guide._id }, isDefault: true }, { isDefault: false });
    }
    guide.isDefault = Boolean(isDefault);
  }

  const updated = await guide.save();
  res.json(updated);
});

export const deleteSizeGuide = asyncHandler(async (req, res) => {
  const guide = await SizeGuide.findById(req.params.id);
  if (!guide) { res.status(404); throw new Error('Size guide not found'); }
  if (guide.isDefault) {
    res.status(400);
    throw new Error('Cannot delete the default size guide. Set another guide as default first.');
  }
  await guide.deleteOne();
  res.json({ message: 'Size guide deleted' });
});
