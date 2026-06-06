const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @route  GET /api/users (admin)
const getUsers = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit = 20, role } = req.query;
  const filter = {};
  if (keyword) filter.$or = [
    { name: { $regex: keyword, $options: 'i' } },
    { email: { $regex: keyword, $options: 'i' } },
  ];
  if (role) filter.role = role;

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort('-createdAt')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @route  GET /api/users/:id (admin)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @route  PUT /api/users/:id (admin)
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  await user.save();
  res.json({ success: true, user });
});

// @route  DELETE /api/users/:id (admin)
const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});

// @route  PUT /api/users/:id/toggle-ban (admin)
const toggleBan = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, isActive: user.isActive, message: user.isActive ? 'User unbanned' : 'User banned' });
});

// @route  PUT /api/users/me/wishlist/:productId
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const pid = req.params.productId;
  const idx = user.wishlist.indexOf(pid);
  if (idx === -1) {
    user.wishlist.push(pid);
  } else {
    user.wishlist.splice(idx, 1);
  }
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
});

// @route  PUT /api/users/me/addresses
const updateAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = req.body.addresses;
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @route  PUT /api/users/me/password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});

module.exports = { getUsers, getUserById, updateUser, deleteUser, toggleBan, toggleWishlist, updateAddresses, changePassword };
