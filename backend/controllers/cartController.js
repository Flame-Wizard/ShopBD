const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price salePrice stock slug');
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json({ success: true, cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const { product: productId, qty = 1, variant = '' } = req.body;
  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existingIdx = cart.items.findIndex(
    (i) => i.product.toString() === productId && i.variant === variant
  );

  if (existingIdx > -1) {
    cart.items[existingIdx].qty += qty;
  } else {
    cart.items.push({ product: productId, qty, variant });
  }
  await cart.save();
  await cart.populate('items.product', 'name images price salePrice stock slug');
  res.json({ success: true, cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { qty } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }

  const item = cart.items.id(req.params.itemId);
  if (!item) { res.status(404); throw new Error('Item not found'); }
  item.qty = qty;
  await cart.save();
  await cart.populate('items.product', 'name images price salePrice stock slug');
  res.json({ success: true, cart });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }
  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  await cart.save();
  res.json({ success: true, cart });
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
