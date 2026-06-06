const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  qty: { type: Number, required: true, min: 1 },
  variant: { type: String, default: '' },
  price: { type: Number, required: true },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  street: String,
  city: String,
  district: String,
  postalCode: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'bKash', 'Nagad', 'Bank Transfer'],
      default: 'Cash on Delivery',
    },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    trackingNumber: { type: String, default: '' },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    coupon: { type: String, default: '' },
    discount: { type: Number, default: 0 },
    shippingMethod: { type: String, default: 'Standard' },
    location: { type: String, default: 'Dhaka' },
    salesChannel: { type: String, default: 'Online Store' },
    paidAt: Date,
    deliveredAt: Date,
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
