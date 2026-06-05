import asyncHandler from 'express-async-handler';
import ShippingZone from '../models/ShippingZone.js';

/**
 * Calculates shipping cost for a given country and subtotal
 * @param {string} countryNameOrCode 
 * @param {number} subtotal 
 * @returns {Promise<{ shippingCost: number, zoneName: string }>}
 */
export async function calculateShippingCost(countryNameOrCode, subtotal) {
  const defaultZone = await ShippingZone.findOne({ isDefault: true, isActive: true });

  if (!countryNameOrCode) {
    if (defaultZone) {
      return getZoneCost(defaultZone, subtotal);
    }
    return { shippingCost: 0, zoneName: 'Free Shipping (No Location)' };
  }

  const cleanCountry = countryNameOrCode.trim().toLowerCase();

  // Find all active shipping zones
  const zones = await ShippingZone.find({ isActive: true });

  // Match zone that contains the country (case-insensitive check)
  let matchedZone = zones.find(zone =>
    zone.countries.some(c => c.trim().toLowerCase() === cleanCountry)
  );

  // If no specific match, use default zone
  if (!matchedZone) {
    matchedZone = defaultZone;
  }

  // If still no zone, return free shipping fallback
  if (!matchedZone) {
    return { shippingCost: 0, zoneName: 'Free Shipping' };
  }

  return getZoneCost(matchedZone, subtotal);
}

function getZoneCost(zone, subtotal) {
  if (zone.rateType === 'free') {
    return { shippingCost: 0, zoneName: zone.name };
  }
  if (zone.rateType === 'conditional_free') {
    if (Number(subtotal) >= zone.freeShippingThreshold) {
      return { shippingCost: 0, zoneName: `${zone.name} (Free Shipping)` };
    }
    return { shippingCost: zone.baseCost, zoneName: zone.name };
  }
  // fixed
  return { shippingCost: zone.baseCost, zoneName: zone.name };
}

/**
 * POST /api/shipping-zones/calculate
 * body: { country, subtotal }
 */
export const calculateRate = asyncHandler(async (req, res) => {
  const { country, subtotal } = req.body;
  
  if (subtotal == null || Number(subtotal) < 0) {
    res.status(400);
    throw new Error('Invalid subtotal');
  }

  const result = await calculateShippingCost(country, Number(subtotal));
  res.json(result);
});

/**
 * GET /api/shipping-zones
 * Public or admin list (returns all sorted by creation)
 */
export const listShippingZones = asyncHandler(async (_req, res) => {
  const zones = await ShippingZone.find({}).sort('-createdAt');
  res.json(zones);
});

/**
 * POST /api/shipping-zones
 * Admin only
 */
export const createShippingZone = asyncHandler(async (req, res) => {
  const {
    name, countries = [], rateType, baseCost,
    freeShippingThreshold, isDefault, isActive
  } = req.body;

  if (!name?.trim()) {
    res.status(400);
    throw new Error('Shipping zone name is required');
  }
  if (!['fixed', 'free', 'conditional_free'].includes(rateType)) {
    res.status(400);
    throw new Error('rateType must be fixed, free, or conditional_free');
  }

  const exists = await ShippingZone.findOne({ name: name.trim() });
  if (exists) {
    res.status(400);
    throw new Error('A shipping zone with this name already exists');
  }

  // If this zone is set as default, unset other default zones
  if (isDefault) {
    await ShippingZone.updateMany({}, { isDefault: false });
  }

  const zone = await ShippingZone.create({
    name: name.trim(),
    countries: countries.map(c => c.trim()),
    rateType,
    baseCost: Number(baseCost) || 0,
    freeShippingThreshold: Number(freeShippingThreshold) || 0,
    isDefault: !!isDefault,
    isActive: isActive !== false
  });

  res.status(201).json(zone);
});

/**
 * PUT /api/shipping-zones/:id
 * Admin only
 */
export const updateShippingZone = asyncHandler(async (req, res) => {
  const zone = await ShippingZone.findById(req.params.id);
  if (!zone) {
    res.status(404);
    throw new Error('Shipping zone not found');
  }

  const {
    name, countries, rateType, baseCost,
    freeShippingThreshold, isDefault, isActive
  } = req.body;

  if (name != null) {
    const exists = await ShippingZone.findOne({ name: name.trim(), _id: { $ne: zone._id } });
    if (exists) {
      res.status(400);
      throw new Error('A shipping zone with this name already exists');
    }
    zone.name = name.trim();
  }

  if (countries != null) {
    zone.countries = countries.map(c => c.trim());
  }

  if (rateType != null) {
    if (!['fixed', 'free', 'conditional_free'].includes(rateType)) {
      res.status(400);
      throw new Error('rateType must be fixed, free, or conditional_free');
    }
    zone.rateType = rateType;
  }

  if (baseCost != null) {
    zone.baseCost = Number(baseCost) || 0;
  }

  if (freeShippingThreshold != null) {
    zone.freeShippingThreshold = Number(freeShippingThreshold) || 0;
  }

  if (isDefault != null) {
    if (isDefault && !zone.isDefault) {
      // Unset other defaults
      await ShippingZone.updateMany({}, { isDefault: false });
    }
    zone.isDefault = !!isDefault;
  }

  if (isActive != null) {
    zone.isActive = !!isActive;
  }

  const updated = await zone.save();
  res.json(updated);
});

/**
 * DELETE /api/shipping-zones/:id
 * Admin only
 */
export const deleteShippingZone = asyncHandler(async (req, res) => {
  const zone = await ShippingZone.findById(req.params.id);
  if (!zone) {
    res.status(404);
    throw new Error('Shipping zone not found');
  }

  await zone.deleteOne();
  res.json({ message: 'Shipping zone deleted' });
});
