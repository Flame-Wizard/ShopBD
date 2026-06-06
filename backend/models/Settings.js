const mongoose = require('mongoose');

const shippingZoneSchema = new mongoose.Schema({
  region: String,
  cost: Number,
  estimatedDays: String,
});

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'ShopBD' },
    storeTagline: { type: String, default: 'Bangladesh\'s Premium Online Store' },
    logo: { type: String, default: '' },
    address: { type: String, default: 'Dhaka, Bangladesh' },
    phone: { type: String, default: '+880 1700-000000' },
    email: { type: String, default: 'support@shopbd.com' },
    currency: { type: String, default: 'BDT' },
    taxRate: { type: Number, default: 0 },
    shippingZones: [shippingZoneSchema],
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    analyticsApiKey: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
