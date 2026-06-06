require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');

const bdLocations = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Comilla', 'Mymensingh', 'Gazipur'];
const salesChannels = ['Online Store', 'Daraz', 'Facebook Shop', 'Physical Store'];
const paymentMethods = ['Cash on Delivery', 'bKash', 'Nagad', 'Bank Transfer'];

// Categories with real Unsplash image URLs
const categoriesData = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets, phones, and tech accessories',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
  },
  {
    name: 'Fashion & Clothing',
    slug: 'fashion-clothing',
    description: 'Traditional and modern Bengali fashion for men and women',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Furniture, decor, and home essentials',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Skincare, haircare, and grooming products',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Sports equipment, activewear, and fitness gear',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  },
  {
    name: 'Books & Stationery',
    slug: 'books-stationery',
    description: 'Bengali and English books, notebooks, and art supplies',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
  },
  {
    name: 'Food & Groceries',
    slug: 'food-groceries',
    description: 'Organic produce, local spices, and packaged foods',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
  },
  {
    name: 'Handicrafts & Art',
    slug: 'handicrafts-art',
    description: 'Authentic Bangladeshi handmade crafts and artwork',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
  },
];

// Products with real Unsplash URLs — Bangladesh company "ShopBD"
const productsData = [
  // Electronics
  {
    name: 'Samsung Galaxy A54 5G',
    slug: 'samsung-galaxy-a54-5g',
    sku: 'EL-001',
    description: 'Samsung Galaxy A54 5G with 6.4" Super AMOLED display, 50MP camera, and 5000mAh battery. Perfect for everyday use in Bangladesh.',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
      'https://images.unsplash.com/photo-1598327106026-d9521da673f1?w=800&q=80',
    ],
    price: 42000,
    salePrice: 38500,
    costPrice: 30000,
    stock: 45,
    brand: 'Samsung',
    tags: ['smartphone', '5g', 'samsung', 'mobile'],
    variants: [{ name: 'Color', options: ['Awesome Graphite', 'Awesome Lime', 'Awesome Violet'] }],
    unitsSold: 87,
    location: 'Dhaka',
    salesChannel: 'Online Store',
    averageRating: 4.5,
    numReviews: 23,
  },
  {
    name: 'Xiaomi Redmi Buds 4 Pro',
    slug: 'xiaomi-redmi-buds-4-pro',
    sku: 'EL-002',
    description: 'True wireless earbuds with Active Noise Cancellation, 43dB noise reduction, and 9 hours battery life.',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800&q=80',
    ],
    price: 4500,
    salePrice: 3800,
    costPrice: 2500,
    stock: 120,
    brand: 'Xiaomi',
    tags: ['earbuds', 'wireless', 'anc', 'audio'],
    variants: [{ name: 'Color', options: ['White', 'Black'] }],
    unitsSold: 234,
    location: 'Chittagong',
    salesChannel: 'Daraz',
    averageRating: 4.3,
    numReviews: 56,
  },
  {
    name: 'HP Pavilion 15 Laptop',
    slug: 'hp-pavilion-15-laptop',
    sku: 'EL-003',
    description: 'HP Pavilion 15 with Intel Core i5-12th Gen, 8GB RAM, 512GB SSD. Ideal for students and professionals.',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
    ],
    price: 75000,
    salePrice: 69999,
    costPrice: 58000,
    stock: 18,
    brand: 'HP',
    tags: ['laptop', 'computer', 'hp', 'student'],
    unitsSold: 45,
    location: 'Dhaka',
    salesChannel: 'Online Store',
    averageRating: 4.6,
    numReviews: 18,
  },
  {
    name: 'Walton Smart TV 43"',
    slug: 'walton-smart-tv-43',
    sku: 'EL-004',
    description: 'Walton 43" Full HD Smart TV with Android OS, built-in WiFi, and 3 HDMI ports. Bangladesh\'s trusted brand.',
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80',
    ],
    price: 32000,
    salePrice: 28500,
    costPrice: 22000,
    stock: 30,
    brand: 'Walton',
    tags: ['tv', 'smart-tv', 'walton', 'android'],
    unitsSold: 112,
    location: 'Rajshahi',
    salesChannel: 'Physical Store',
    averageRating: 4.2,
    numReviews: 34,
  },
  // Fashion
  {
    name: 'Aarong Cotton Panjabi (White)',
    slug: 'aarong-cotton-panjabi-white',
    sku: 'FA-001',
    description: 'Premium handloom cotton Panjabi from Aarong. Perfect for Eid, weddings, and formal occasions. Made by skilled artisans of Bangladesh.',
    images: [
      'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    ],
    price: 2800,
    salePrice: 2300,
    costPrice: 1200,
    stock: 85,
    brand: 'Aarong',
    tags: ['panjabi', 'eid', 'traditional', 'cotton', 'men'],
    variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] }],
    unitsSold: 320,
    location: 'Dhaka',
    salesChannel: 'Online Store',
    averageRating: 4.8,
    numReviews: 89,
  },
  {
    name: 'Jamdani Saree (Traditional)',
    slug: 'jamdani-saree-traditional',
    sku: 'FA-002',
    description: 'Authentic Jamdani saree — UNESCO Intangible Cultural Heritage. Woven by master weavers of Narayanganj. Each piece is unique.',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    ],
    price: 8500,
    salePrice: null,
    costPrice: 5000,
    stock: 25,
    brand: 'Narayanganj Weavers',
    tags: ['saree', 'jamdani', 'traditional', 'women', 'heritage'],
    variants: [{ name: 'Color', options: ['Red', 'Blue', 'Green', 'Cream'] }],
    unitsSold: 67,
    location: 'Dhaka',
    salesChannel: 'Facebook Shop',
    averageRating: 4.9,
    numReviews: 42,
  },
  {
    name: "Men's Denim Jacket (Slim Fit)",
    slug: 'mens-denim-jacket-slim-fit',
    sku: 'FA-003',
    description: 'Premium quality slim-fit denim jacket. Made from 100% cotton denim. Suitable for all seasons in Bangladesh.',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
      'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800&q=80',
    ],
    price: 1800,
    salePrice: 1400,
    costPrice: 800,
    stock: 60,
    brand: 'DhakaDenim',
    tags: ['jacket', 'denim', 'men', 'casual'],
    variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL'] }, { name: 'Color', options: ['Blue', 'Black', 'Light Blue'] }],
    unitsSold: 198,
    location: 'Gazipur',
    salesChannel: 'Daraz',
    averageRating: 4.4,
    numReviews: 67,
  },
  {
    name: "Women's Kurti Set (Embroidered)",
    slug: 'womens-kurti-set-embroidered',
    sku: 'FA-004',
    description: 'Beautifully embroidered kurti set with palazzo pants. Perfect for casual and semi-formal occasions. Soft georgette fabric.',
    images: [
      'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    ],
    price: 2200,
    salePrice: 1750,
    costPrice: 900,
    stock: 70,
    brand: 'Rang BD',
    tags: ['kurti', 'women', 'embroidered', 'set'],
    variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] }, { name: 'Color', options: ['Pink', 'Yellow', 'White', 'Blue'] }],
    unitsSold: 285,
    location: 'Sylhet',
    salesChannel: 'Facebook Shop',
    averageRating: 4.6,
    numReviews: 78,
  },
  // Home & Living
  {
    name: 'Rattan Bamboo Chair',
    slug: 'rattan-bamboo-chair',
    sku: 'HL-001',
    description: 'Handcrafted rattan bamboo chair made by local artisans of Sylhet. Eco-friendly, durable, and stylish.',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
    ],
    price: 3500,
    salePrice: 2999,
    costPrice: 1800,
    stock: 22,
    brand: 'Sylhet Craft',
    tags: ['chair', 'bamboo', 'rattan', 'handmade', 'eco'],
    unitsSold: 54,
    location: 'Sylhet',
    salesChannel: 'Online Store',
    averageRating: 4.7,
    numReviews: 29,
  },
  {
    name: 'Cotton Nakshi Kantha Bedsheet',
    slug: 'cotton-nakshi-kantha-bedsheet',
    sku: 'HL-002',
    description: 'Traditional Nakshi Kantha hand-embroidered bedsheet. A UNESCO recognized art form from Bangladesh. Pure cotton, king size.',
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
    ],
    price: 4500,
    salePrice: 3800,
    costPrice: 2200,
    stock: 35,
    brand: 'Heritage BD',
    tags: ['bedsheet', 'kantha', 'embroidery', 'cotton', 'handmade'],
    variants: [{ name: 'Size', options: ['Single', 'Double', 'King'] }],
    unitsSold: 143,
    location: 'Rajshahi',
    salesChannel: 'Daraz',
    averageRating: 4.8,
    numReviews: 51,
  },
  // Beauty
  {
    name: 'Meril Moisturizing Cream (200ml)',
    slug: 'meril-moisturizing-cream-200ml',
    sku: 'BC-001',
    description: 'Bangladesh\'s #1 moisturizing cream by Square Toiletries. Non-greasy formula with Vitamin E. Suitable for all skin types.',
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80',
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800&q=80',
    ],
    price: 180,
    salePrice: 155,
    costPrice: 80,
    stock: 500,
    brand: 'Meril',
    tags: ['cream', 'skincare', 'moisturizer', 'meril'],
    variants: [{ name: 'Size', options: ['100ml', '200ml', '400ml'] }],
    unitsSold: 1240,
    location: 'Dhaka',
    salesChannel: 'Daraz',
    averageRating: 4.5,
    numReviews: 215,
  },
  {
    name: 'Organic Mustard Oil (1L)',
    slug: 'organic-mustard-oil-1l',
    sku: 'BC-002',
    description: 'Cold-pressed pure mustard oil from Rajshahi farms. Ideal for cooking, hair care, and massage. No preservatives.',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
      'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&q=80',
    ],
    price: 280,
    salePrice: 245,
    costPrice: 150,
    stock: 200,
    brand: 'Pure Harvest BD',
    tags: ['mustard-oil', 'organic', 'natural', 'cooking'],
    unitsSold: 892,
    location: 'Rajshahi',
    salesChannel: 'Physical Store',
    averageRating: 4.7,
    numReviews: 134,
  },
  // Sports
  {
    name: 'Cricket Bat (English Willow)',
    slug: 'cricket-bat-english-willow',
    sku: 'SP-001',
    description: 'Grade 2 English Willow cricket bat. Full size (Size 6). Inspired by Bangladesh national team. Ready to play.',
    images: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
      'https://images.unsplash.com/photo-1540747913346-19212a729441?w=800&q=80',
    ],
    price: 5500,
    salePrice: 4800,
    costPrice: 3000,
    stock: 40,
    brand: 'BDSports',
    tags: ['cricket', 'bat', 'sports', 'willow'],
    variants: [{ name: 'Size', options: ['Size 5', 'Size 6', 'Full Size'] }],
    unitsSold: 78,
    location: 'Dhaka',
    salesChannel: 'Online Store',
    averageRating: 4.4,
    numReviews: 31,
  },
  // Books
  {
    name: 'Humayun Ahmed Collection (Set of 5)',
    slug: 'humayun-ahmed-collection-set-5',
    sku: 'BK-001',
    description: 'Bestseller collection of 5 novels by Bangladesh\'s most beloved author Humayun Ahmed. Includes Misir Ali and Himu series.',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80',
    ],
    price: 950,
    salePrice: 790,
    costPrice: 450,
    stock: 75,
    brand: 'Anyaprokash',
    tags: ['books', 'humayun-ahmed', 'bengali', 'novel', 'literature'],
    unitsSold: 456,
    location: 'Dhaka',
    salesChannel: 'Online Store',
    averageRating: 4.9,
    numReviews: 112,
  },
  // Food
  {
    name: 'Hilsa Fish (Frozen, 1kg)',
    slug: 'hilsa-fish-frozen-1kg',
    sku: 'FD-001',
    description: 'Fresh-frozen Ilish (Hilsa) fish from the Padma River — Bangladesh\'s national fish. Cleaned and packed hygienically.',
    images: [
      'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80',
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
    ],
    price: 1200,
    salePrice: 1050,
    costPrice: 750,
    stock: 100,
    brand: 'Padma Fresh',
    tags: ['hilsa', 'fish', 'ilish', 'padma', 'food'],
    unitsSold: 234,
    location: 'Khulna',
    salesChannel: 'Facebook Shop',
    averageRating: 4.8,
    numReviews: 89,
  },
  // Handicrafts
  {
    name: 'Muslin Silk Shawl (Hand-woven)',
    slug: 'muslin-silk-shawl-hand-woven',
    sku: 'HC-001',
    description: 'Revival of Dhaka Muslin — the legendary fabric of Bangladesh. Hand-woven by artisans from Dhamrai. Perfect as a premium gift.',
    images: [
      'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
    price: 12000,
    salePrice: null,
    costPrice: 7000,
    stock: 12,
    brand: 'Dhamrai Crafts',
    tags: ['muslin', 'shawl', 'handmade', 'silk', 'heritage'],
    variants: [{ name: 'Color', options: ['Ivory', 'Gold', 'Rose'] }],
    unitsSold: 23,
    location: 'Dhaka',
    salesChannel: 'Online Store',
    averageRating: 5.0,
    numReviews: 18,
  },
];

const generateOrders = (users, products, categoryMap) => {
  const orders = [];
  const statuses = ['Delivered', 'Delivered', 'Delivered', 'Shipped', 'Processing', 'Pending', 'Cancelled'];

  for (let i = 0; i < 80; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const price = product.salePrice || product.price;
      subtotal += price * qty;
      items.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        qty,
        price,
      });
    }

    const location = bdLocations[Math.floor(Math.random() * bdLocations.length)];
    const channel = salesChannels[Math.floor(Math.random() * salesChannels.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const orderStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const shippingCost = Math.random() > 0.3 ? 80 : 0;
    const totalPrice = subtotal + shippingCost;

    // Random date in last 6 months
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180));

    orders.push({
      user: user._id,
      items,
      shippingAddress: {
        fullName: user.name,
        phone: `+880 1${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        street: `${Math.floor(Math.random() * 100) + 1} Main Road`,
        city: location,
        district: location,
        postalCode: `${Math.floor(Math.random() * 9000) + 1000}`,
      },
      paymentMethod,
      paymentStatus: orderStatus === 'Delivered' ? 'Paid' : 'Pending',
      orderStatus,
      subtotal,
      tax: 0,
      shippingCost,
      totalPrice,
      location,
      salesChannel: channel,
      createdAt: date,
      deliveredAt: orderStatus === 'Delivered' ? new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000) : undefined,
      paidAt: orderStatus === 'Delivered' ? date : undefined,
    });
  }
  return orders;
};

const seed = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  console.log('🌱 Seeding database...');

  // Clear all
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
    Order.deleteMany(),
    Coupon.deleteMany(),
    Settings.deleteMany(),
  ]);

  // Create admin
  const admin = await User.create({
    name: 'ShopBD Admin',
    email: process.env.ADMIN_EMAIL || 'admin@shopbd.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'superadmin',
    isActive: true,
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create sample customers
  const customers = await User.insertMany([
    { name: 'Rahim Uddin', email: 'rahim@example.com', password: 'password123', role: 'customer' },
    { name: 'Fatema Begum', email: 'fatema@example.com', password: 'password123', role: 'customer' },
    { name: 'Karim Sheikh', email: 'karim@example.com', password: 'password123', role: 'customer' },
    { name: 'Nasrin Akter', email: 'nasrin@example.com', password: 'password123', role: 'customer' },
    { name: 'Mohammad Ali', email: 'mali@example.com', password: 'password123', role: 'customer' },
  ]);
  console.log(`✅ ${customers.length + 1} users created`);

  // Create categories
  const categories = await Category.insertMany(categoriesData);
  const categoryMap = {};
  categories.forEach((c) => (categoryMap[c.slug] = c._id));
  console.log(`✅ ${categories.length} categories created`);

  // Map category IDs to products
  const catSlugMap = {
    'samsung-galaxy-a54-5g': 'electronics',
    'xiaomi-redmi-buds-4-pro': 'electronics',
    'hp-pavilion-15-laptop': 'electronics',
    'walton-smart-tv-43': 'electronics',
    'aarong-cotton-panjabi-white': 'fashion-clothing',
    'jamdani-saree-traditional': 'fashion-clothing',
    'mens-denim-jacket-slim-fit': 'fashion-clothing',
    'womens-kurti-set-embroidered': 'fashion-clothing',
    'rattan-bamboo-chair': 'home-living',
    'cotton-nakshi-kantha-bedsheet': 'home-living',
    'meril-moisturizing-cream-200ml': 'beauty-personal-care',
    'organic-mustard-oil-1l': 'beauty-personal-care',
    'cricket-bat-english-willow': 'sports-fitness',
    'humayun-ahmed-collection-set-5': 'books-stationery',
    'hilsa-fish-frozen-1kg': 'food-groceries',
    'muslin-silk-shawl-hand-woven': 'handicrafts-art',
  };

  const productsWithCats = productsData.map((p) => ({
    ...p,
    category: categoryMap[catSlugMap[p.slug]],
    isPublished: true,
  }));

  const products = await Product.insertMany(productsWithCats);
  console.log(`✅ ${products.length} products created`);

  // Create coupons
  await Coupon.insertMany([
    { code: 'WELCOME10', type: 'percentage', value: 10, expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 200, isActive: true },
    { code: 'EID2024', type: 'fixed', value: 500, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), usageLimit: 100, isActive: true },
    { code: 'SAVE15', type: 'percentage', value: 15, expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), usageLimit: 50, isActive: true },
  ]);
  console.log('✅ Coupons created');

  // Create settings
  await Settings.create({
    storeName: 'ShopBD',
    storeTagline: "Bangladesh's Premium Online Store",
    currency: 'BDT',
    taxRate: 0,
    address: '123 Gulshan Avenue, Dhaka 1212, Bangladesh',
    phone: '+880 1700-SHOPBD',
    email: 'support@shopbd.com',
    shippingZones: [
      { region: 'Dhaka City', cost: 60, estimatedDays: '1-2 days' },
      { region: 'Dhaka Division', cost: 80, estimatedDays: '2-3 days' },
      { region: 'Other Divisions', cost: 120, estimatedDays: '3-5 days' },
    ],
    socialLinks: {
      facebook: 'https://facebook.com/shopbd',
      instagram: 'https://instagram.com/shopbd',
    },
    analyticsApiKey: process.env.ANALYTICS_API_KEY,
  });
  console.log('✅ Settings created');

  // Generate orders
  const allUsers = [admin, ...customers];
  const ordersData = generateOrders(allUsers, products);

  // Need to handle timestamps manually
  for (const order of ordersData) {
    const doc = new Order(order);
    doc.createdAt = order.createdAt;
    await Order.collection.insertOne({ ...doc.toObject(), createdAt: order.createdAt, updatedAt: order.createdAt });
  }
  console.log(`✅ ${ordersData.length} sample orders created`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔑 Admin Login: ${process.env.ADMIN_EMAIL || 'admin@shopbd.com'}`);
  console.log(`🔑 Admin Pass:  ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`);
  console.log(`🔑 Analytics API Key: ${process.env.ANALYTICS_API_KEY}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeder error:', err);
      process.exit(1);
    });
}

module.exports = { seed };
