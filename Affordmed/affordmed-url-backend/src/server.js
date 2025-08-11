const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const logger = require('./middleware/logger');
const shorturls = require('./routes/shorturls');
const Link = require('./models/Link');

dotenv.config();

const app = express();
app.use(cors()); 
app.use(express.json());

// Mandatory custom logger middleware
app.use(logger);

// API routes
app.use('/shorturls', shorturls);

// Redirection route: GET /:code -> redirect + record click
app.get('/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const link = await Link.findOne({ shortcode: code });
    if (!link) return res.status(404).send('Shortcode not found');
    if (new Date() > link.expiresAt) return res.status(410).send('Link expired');

    link.clicks.push({
      ts: new Date(),
      referrer: req.get('referer') || req.get('referrer') || null,
      ip: (req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '').toString(),
      ua: req.get('user-agent') || ''
    });
    await link.save();

    return res.redirect(302, link.originalUrl);
  } catch (e) {
    return res.status(500).send('server_error');
  }
});

const PORT = process.env.PORT || 4000
;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/affordmed_urlshort';

mongoose.connect(MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
}).catch((err) => {
  console.error('Mongo connection error', err);
  process.exit(1);
});
