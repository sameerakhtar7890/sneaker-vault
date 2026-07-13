import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const REQUIRED = ['fullName', 'address', 'city', 'postalCode'];

function validateBody(body) {
  for (const field of REQUIRED) {
    if (!String(body[field] || '').trim()) {
      return `${field} is required`;
    }
  }
  return null;
}

function formatAddress(doc) {
  return {
    _id: doc._id,
    label: doc.label,
    fullName: doc.fullName,
    address: doc.address,
    city: doc.city,
    postalCode: doc.postalCode,
    country: doc.country || 'US',
    isDefault: doc.isDefault,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

async function clearOtherDefaults(user, exceptId) {
  user.addresses.forEach(a => {
    if (String(a._id) !== String(exceptId)) a.isDefault = false;
  });
}

export const listAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  const sorted = [...(user.addresses || [])].sort(
    (a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)
  );
  res.json(sorted.map(formatAddress));
});

export const createAddress = asyncHandler(async (req, res) => {
  const err = validateBody(req.body);
  if (err) { res.status(400); throw new Error(err); }

  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (!user.canAddAddress()) {
    res.status(400); throw new Error('Maximum of 10 saved addresses reached');
  }

  const isFirst = user.addresses.length === 0;
  const setDefault = Boolean(req.body.isDefault) || isFirst;

  if (setDefault) {
    user.addresses.forEach(a => { a.isDefault = false; });
  }

  user.addresses.push({
    label: (req.body.label || 'Home').trim(),
    fullName: req.body.fullName.trim(),
    address: req.body.address.trim(),
    city: req.body.city.trim(),
    postalCode: req.body.postalCode.trim(),
    country: (req.body.country || 'US').trim(),
    isDefault: setDefault
  });

  await user.save();
  const created = user.addresses[user.addresses.length - 1];
  res.status(201).json(formatAddress(created));
});

export const updateAddress = asyncHandler(async (req, res) => {
  const err = validateBody(req.body);
  if (err) { res.status(400); throw new Error(err); }

  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  const addr = user.addresses.id(req.params.id);
  if (!addr) { res.status(404); throw new Error('Address not found'); }

  addr.label = (req.body.label || addr.label || 'Home').trim();
  addr.fullName = req.body.fullName.trim();
  addr.address = req.body.address.trim();
  addr.city = req.body.city.trim();
  addr.postalCode = req.body.postalCode.trim();
  addr.country = (req.body.country || 'US').trim();

  if (req.body.isDefault === true) {
    await clearOtherDefaults(user, addr._id);
    addr.isDefault = true;
  } else if (req.body.isDefault === false && addr.isDefault) {
    addr.isDefault = false;
    if (!user.addresses.some(a => a.isDefault && String(a._id) !== String(addr._id))) {
      const other = user.addresses.find(a => String(a._id) !== String(addr._id));
      if (other) other.isDefault = true;
    }
  }

  await user.save();
  res.json(formatAddress(addr));
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  const addr = user.addresses.id(req.params.id);
  if (!addr) { res.status(404); throw new Error('Address not found'); }

  const wasDefault = addr.isDefault;
  user.addresses.pull(req.params.id);

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.json({ message: 'Address removed' });
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  const addr = user.addresses.id(req.params.id);
  if (!addr) { res.status(404); throw new Error('Address not found'); }

  await clearOtherDefaults(user, addr._id);
  addr.isDefault = true;
  await user.save();
  res.json(formatAddress(addr));
});
