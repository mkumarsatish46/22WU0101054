const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema({
  ts: { type: Date, default: Date.now },
  referrer: String,
  ip: String,
  ua: String
}, { _id: false });

const LinkSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortcode: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  clicks: { type: [ClickSchema], default: [] }
});

module.exports = mongoose.model('Link', LinkSchema);
