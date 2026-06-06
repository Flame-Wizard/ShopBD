const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: String, // e.g. "Color", "Size"
  options: [String], // e.g. ["Red", "Blue"]
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, unique: true, sparse: true },
    description: { type: String, default: '' },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: null },
    stock: { type: Number, required: true, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, default: '' },
    tags: [String],
    variants: [variantSchema],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    unitsSold: { type: Number, default: 0 },
    location: { type: String, default: 'Dhaka' },
    salesChannel: { type: String, enum: ['Online Store', 'Daraz', 'Facebook Shop', 'Physical Store'], default: 'Online Store' },
    costPrice: { type: Number, default: 0 },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

productSchema.pre('validate', function () {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Product', productSchema);
