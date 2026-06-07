const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const axios = require('axios');

// @route  GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, rating, brand, sort, page = 1, limit = 12, view } = req.query;

  const filter = { isPublished: true };

  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { brand: { $regex: keyword, $options: 'i' } },
      { tags: { $in: [new RegExp(keyword, 'i')] } },
    ];
  }
  if (category) filter.category = category;
  if (brand) filter.brand = { $regex: brand, $options: 'i' };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (rating) filter.averageRating = { $gte: Number(rating) };

  let sortOption = {};
  if (sort === 'price-asc') sortOption = { price: 1 };
  else if (sort === 'price-desc') sortOption = { price: -1 };
  else if (sort === 'rating') sortOption = { averageRating: -1 };
  else if (sort === 'popular') sortOption = { unitsSold: -1 };
  else sortOption = { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  if (req.query.format === 'integration') {
    const seenIds = new Set();
    const seenNames = new Set();
    const uniqueProducts = [];

    for (const p of products) {
      const idVal = p.sku || String(p._id);
      const nameKey = p.name.trim().toLowerCase();

      if (seenIds.has(idVal) || seenNames.has(nameKey)) {
        continue;
      }

      seenIds.add(idVal);
      seenNames.add(nameKey);
      uniqueProducts.push(p);
    }

    const formatted = uniqueProducts.map((p) => ({
      id: String(p._id),
      name: p.name,
      price: p.salePrice || p.price,
      category: p.category ? p.category.name : 'Uncategorized',
      stock: p.stock,
      reviewCount: p.numReviews || 0,
      rating: p.averageRating || 0,
    }));
    return res.json({
      success: true,
      products: formatted,
    });
  }

  res.json({
    success: true,
    products,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

// @route  GET /api/products/:slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const reviews = await Review.find({ product: product._id, isApproved: true })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .limit(20);

  res.json({ success: true, product, reviews });
});

// @route  POST /api/products (admin)
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @route  PUT /api/products/:id (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @route  DELETE /api/products/:id (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, message: 'Product deleted' });
});

// @route  GET /api/products/admin/all (admin)
const getAdminProducts = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const filter = {};
  if (keyword) filter.name = { $regex: keyword, $options: 'i' };

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name')
    .sort(sort)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @route  POST /api/products/import (admin) — import from external API
const importProducts = asyncHandler(async (req, res) => {
  const { apiUrl, bearerToken, save } = req.body;
  if (!apiUrl) {
    res.status(400);
    throw new Error('API URL is required');
  }

  const headers = {};
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;

  const { data } = await axios.get(apiUrl, { headers, timeout: 10000 });
  const raw = Array.isArray(data) ? data : data.products || data.data || [];

  const mapped = raw.map((p) => {
    const skuVal = p.sku || p.id || '';
    const nameVal = p.name || p.title || 'Unknown';
    const catVal = p.categoryName || (typeof p.category === 'string' ? p.category : p.category?.name) || 'Uncategorized';
    
    return {
      name: nameVal,
      sku: skuVal ? String(skuVal) : undefined,
      categoryName: catVal,
      description: p.description || p.body_html || '',
      images: p.images?.map((i) => (typeof i === 'string' ? i : i.src || i.url)) || (p.image ? [p.image] : []),
      price: parseFloat(p.price || p.regular_price || 0),
      salePrice: parseFloat(p.sale_price || p.salePrice || 0) || null,
      stock: parseInt(p.stock_quantity !== undefined ? p.stock_quantity : (p.stock !== undefined ? p.stock : 100)),
      brand: p.brand || '',
    };
  });

  if (save) {
    const results = [];
    const processedNames = new Set();
    const processedSkus = new Set();

    for (const p of mapped) {
      try {
        // Prevent duplicate processing in the same import batch
        if (processedNames.has(p.name) || (p.sku && processedSkus.has(p.sku))) {
          continue;
        }

        // Find existing product by SKU or name
        let existingProduct = null;
        if (p.sku) {
          existingProduct = await Product.findOne({ sku: p.sku });
        }
        if (!existingProduct) {
          existingProduct = await Product.findOne({ name: { $regex: new RegExp(`^${p.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } });
        }

        // Resolve category
        const catName = p.categoryName;
        let category = await Category.findOne({ name: { $regex: new RegExp(`^${catName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } });
        if (!category) {
          const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          let uniqueSlug = slug || 'uncategorized';
          let count = 1;
          while (await Category.findOne({ slug: uniqueSlug })) {
            uniqueSlug = `${slug}-${count++}`;
          }
          category = await Category.create({ name: catName, slug: uniqueSlug });
        }

        if (existingProduct) {
          // Update the stock if a product stock is changed
          if (existingProduct.stock !== p.stock) {
            existingProduct.stock = p.stock;
            await existingProduct.save();
          }
          results.push(existingProduct);
        } else {
          // Set resolved category ID
          p.category = category._id;

          // Generate a clean unique slug
          const baseSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          let uniqueSlug = baseSlug || 'product';
          let count = 1;
          while (await Product.findOne({ slug: uniqueSlug })) {
            uniqueSlug = `${baseSlug}-${count++}`;
          }
          p.slug = uniqueSlug;

          const created = await Product.create(p);
          results.push(created);
        }

        processedNames.add(p.name);
        if (p.sku) processedSkus.add(p.sku);
      } catch (err) {
        console.error(`Error importing product ${p.name}:`, err);
      }
    }
    return res.json({ success: true, message: `Processed ${results.length} products`, products: results });
  }

  res.json({ success: true, preview: mapped });
});

// @route  POST /api/products/bulk (admin)
const bulkAction = asyncHandler(async (req, res) => {
  const { action, ids } = req.body;
  if (action === 'delete') {
    await Product.deleteMany({ _id: { $in: ids } });
    return res.json({ success: true, message: `Deleted ${ids.length} products` });
  }
  if (action === 'publish') {
    await Product.updateMany({ _id: { $in: ids } }, { isPublished: true });
    return res.json({ success: true, message: `Published ${ids.length} products` });
  }
  if (action === 'unpublish') {
    await Product.updateMany({ _id: { $in: ids } }, { isPublished: false });
    return res.json({ success: true, message: `Unpublished ${ids.length} products` });
  }
  res.status(400).json({ success: false, message: 'Unknown action' });
});

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getAdminProducts, importProducts, bulkAction };
