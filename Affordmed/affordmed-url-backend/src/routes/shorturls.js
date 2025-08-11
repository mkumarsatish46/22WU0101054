const express = require('express');
const { customAlphabet } = require('nanoid');
const Link = require('../models/Link');

const router = express.Router();
const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

function isValidUrl(url) {
  try { new URL(url); return true; } catch { return false; }
}

// Create short URL
router.post('/', async (req, res) => {
  try {
    let { url, validity, shortcode } = req.body || {};

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid or missing url' });
    }
    if (validity !== undefined && (!Number.isInteger(validity) || validity <= 0)) {
      return res.status(400).json({ error: 'validity must be a positive integer (minutes)' });
    }
    const minutes = validity ?? 30;

    if (shortcode) {
      if (!/^[a-zA-Z0-9]{3,20}$/.test(shortcode)) {
        return res.status(400).json({ error: 'shortcode must be alphanumeric, length 3-20' });
      }
      const exists = await Link.findOne({ shortcode });
      if (exists) return res.status(409).json({ error: 'shortcode already in use' });
    } else {
      do { shortcode = nano(); } while (await Link.findOne({ shortcode }));
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + minutes * 60 * 1000);

    const link = await Link.create({
      originalUrl: url,
      shortcode,
      createdAt: now,
      expiresAt
    });

    const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
    return res.status(201).json({
      shortLink: `${base}/${link.shortcode}`,
      expiry: link.expiresAt.toISOString()
    });
  } catch (e) {
    return res.status(500).json({ error: 'server_error', message: e.message });
  }
});

// List all (helper for UI)
router.get('/', async (_req, res) => {
  const list = await Link.find({}, '-__v').sort({ createdAt: -1 });
  res.json(list);
});

// Stats
router.get('/:code/stats', async (req, res) => {
  const code = req.params.code;
  const link = await Link.findOne({ shortcode: code }, '-__v');
  if (!link) return res.status(404).json({ error: 'not_found' });

  const now = new Date();
  const expired = now > link.expiresAt;

  res.json({
    shortcode: link.shortcode,
    originalUrl: link.originalUrl,
    createdAt: link.createdAt,
    expiry: link.expiresAt,
    expired,
    totalClicks: link.clicks.length,
    clicks: link.clicks.map(c => ({ ts: c.ts, referrer: c.referrer || null, ip: c.ip || null }))
  });
});

module.exports = router;
