import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';
import { applyCoupon, calcSubtotal } from '../utils/couponUtils.js';

/**
 * POST /api/coupons/validate
 * body: { code, items: [{ price, qty }] }
 */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, items = [] } = req.body;
  if (!code?.trim()) { res.status(400); throw new Error('Promo code is required'); }

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) { res.status(404); throw new Error('Invalid promo code'); }

  const subtotal = calcSubtotal(items);
  const result = applyCoupon(coupon, subtotal);

  res.json({
    ...result,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    }
  });
});

/* ADMIN */
export const listCoupons = asyncHandler(async (_req, res) => {
  res.json(await Coupon.find({}).sort('-createdAt'));
});

export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code, description, discountType, discountValue,
    minOrderAmount, maxDiscount, expiresAt, usageLimit, isActive
  } = req.body;

  if (!code?.trim()) { res.status(400); throw new Error('Code is required'); }
  if (!['percent', 'fixed'].includes(discountType)) {
    res.status(400); throw new Error('discountType must be percent or fixed');
  }
  if (discountValue == null || Number(discountValue) <= 0) {
    res.status(400); throw new Error('discountValue must be greater than 0');
  }
  if (discountType === 'percent' && Number(discountValue) > 100) {
    res.status(400); throw new Error('Percent discount cannot exceed 100');
  }

  const exists = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (exists) { res.status(400); throw new Error('A coupon with this code already exists'); }

  const coupon = await Coupon.create({
    code: code.trim().toUpperCase(),
    description: description || '',
    discountType,
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount) || 0,
    maxDiscount: maxDiscount != null && maxDiscount !== '' ? Number(maxDiscount) : null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    usageLimit: usageLimit != null && usageLimit !== '' ? Number(usageLimit) : null,
    isActive: isActive !== false
  });

  res.status(201).json(coupon);
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }

  const {
    code, description, discountType, discountValue,
    minOrderAmount, maxDiscount, expiresAt, usageLimit, isActive
  } = req.body;

  if (code != null) {
    const nextCode = code.trim().toUpperCase();
    const duplicate = await Coupon.findOne({ code: nextCode, _id: { $ne: coupon._id } });
    if (duplicate) { res.status(400); throw new Error('A coupon with this code already exists'); }
    coupon.code = nextCode;
  }
  if (description != null) coupon.description = description;
  if (discountType != null) {
    if (!['percent', 'fixed'].includes(discountType)) {
      res.status(400); throw new Error('discountType must be percent or fixed');
    }
    coupon.discountType = discountType;
  }
  if (discountValue != null) {
    if (Number(discountValue) <= 0) { res.status(400); throw new Error('discountValue must be greater than 0'); }
    if (coupon.discountType === 'percent' && Number(discountValue) > 100) {
      res.status(400); throw new Error('Percent discount cannot exceed 100');
    }
    coupon.discountValue = Number(discountValue);
  }
  if (minOrderAmount != null) coupon.minOrderAmount = Number(minOrderAmount) || 0;
  if (maxDiscount !== undefined) {
    coupon.maxDiscount = maxDiscount != null && maxDiscount !== '' ? Number(maxDiscount) : null;
  }
  if (expiresAt !== undefined) coupon.expiresAt = expiresAt ? new Date(expiresAt) : null;
  if (usageLimit !== undefined) {
    coupon.usageLimit = usageLimit != null && usageLimit !== '' ? Number(usageLimit) : null;
  }
  if (isActive != null) coupon.isActive = Boolean(isActive);

  const updated = await coupon.save();
  res.json(updated);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  await coupon.deleteOne();
  res.json({ message: 'Coupon deleted' });
});
