import asyncHandler from 'express-async-handler';
import HeroSettings from '../models/HeroSettings.js';

/**
 * GET /api/hero
 */
export const getHeroSettings = asyncHandler(async (req, res) => {
  let settings = await HeroSettings.findOne({ key: 'global' });
  if (!settings) {
    settings = await HeroSettings.create({ key: 'global' });
  }
  res.json(settings);
});

/**
 * PUT /api/hero
 */
export const updateHeroSettings = asyncHandler(async (req, res) => {
  let settings = await HeroSettings.findOne({ key: 'global' });
  if (!settings) {
    settings = new HeroSettings({ key: 'global' });
  }

  Object.assign(settings, req.body);
  const updated = await settings.save();
  res.json(updated);
});
