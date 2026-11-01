const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Simple JSON helper
function readJSON(filename) {
  try {
    const dataPath = path.join(__dirname, '../src/data', filename);
    if (!fs.existsSync(dataPath)) return [];
    const content = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

async function initDB() {
  console.log('Connecting to database host:', process.env.DB_HOST);
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  console.log('Connected! Setting up database tables...');

  // 1. Drop existing tables to avoid conflict and guarantee fresh migration
  console.log('Dropping existing tables...');
  await connection.execute('DROP TABLE IF EXISTS order_items');
  await connection.execute('DROP TABLE IF EXISTS orders');
  await connection.execute('DROP TABLE IF EXISTS customers');
  await connection.execute('DROP TABLE IF EXISTS inquiries');
  await connection.execute('DROP TABLE IF EXISTS bookings');
  await connection.execute('DROP TABLE IF EXISTS discounts');
  await connection.execute('DROP TABLE IF EXISTS reviews');
  await connection.execute('DROP TABLE IF EXISTS journal');
  await connection.execute('DROP TABLE IF EXISTS settings');
  await connection.execute('DROP TABLE IF EXISTS reels');
  await connection.execute('DROP TABLE IF EXISTS banners');
  await connection.execute('DROP TABLE IF EXISTS products');

  // 2. Create products table
  console.log('Creating products table...');
  await connection.execute(`
    CREATE TABLE products (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      category VARCHAR(100),
      volume VARCHAR(50),
      image_url VARCHAR(255),
      position INT DEFAULT 0,
      visible BOOLEAN DEFAULT true,
      badge VARCHAR(100),
      top_notes TEXT,
      heart_notes TEXT,
      base_notes TEXT,
      sizes TEXT,
      additional_images TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Create banners table
  console.log('Creating banners table...');
  await connection.execute(`
    CREATE TABLE banners (
      id VARCHAR(255) PRIMARY KEY,
      image_url VARCHAR(255) NOT NULL,
      mobile_image_url VARCHAR(255),
      position INT DEFAULT 0,
      active BOOLEAN DEFAULT true
    )
  `);

  // 4. Create reels table
  console.log('Creating reels table...');
  await connection.execute(`
    CREATE TABLE reels (
      id VARCHAR(255) PRIMARY KEY,
      video_url VARCHAR(255) NOT NULL,
      thumbnail_url VARCHAR(255),
      handle VARCHAR(100),
      likes VARCHAR(50),
      product_tag VARCHAR(100),
      position INT DEFAULT 0,
      active BOOLEAN DEFAULT true
    )
  `);

  // 5. Create customers table
  console.log('Creating customers table...');
  await connection.execute(`
    CREATE TABLE customers (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      spent DECIMAL(10, 2) DEFAULT 0.00,
      orders INT DEFAULT 0,
      last_active VARCHAR(100),
      password_hash VARCHAR(255) DEFAULT NULL,
      phone VARCHAR(50) DEFAULT NULL
    )
  `);

  // 6. Create orders table
  console.log('Creating orders table...');
  await connection.execute(`
    CREATE TABLE orders (
      id VARCHAR(255) PRIMARY KEY,
      customer_id VARCHAR(255),
      customer_name VARCHAR(255),
      customer_email VARCHAR(255),
      total DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      payment_status VARCHAR(50) DEFAULT 'Pending',
      razorpay_order_id VARCHAR(255) NULL,
      razorpay_payment_id VARCHAR(255) NULL,
      razorpay_signature VARCHAR(255) NULL,
      shipping_address TEXT,
      discount_code VARCHAR(100),
      shipping_carrier VARCHAR(100) DEFAULT NULL,
      shipping_tracking_id VARCHAR(255) DEFAULT NULL,
      shipping_label_url VARCHAR(512) DEFAULT NULL,
      shipping_cost DECIMAL(10, 2) DEFAULT NULL,
      created_at VARCHAR(100),
      date VARCHAR(100),
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    )
  `);

  // 7. Create order_items table
  console.log('Creating order_items table...');
  await connection.execute(`
    CREATE TABLE order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id VARCHAR(255) NOT NULL,
      product_id VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      size VARCHAR(50) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      quantity INT NOT NULL,
      image VARCHAR(255),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);

  // 8. Create inquiries table
  console.log('Creating inquiries table...');
  await connection.execute(`
    CREATE TABLE inquiries (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      inquiry_type VARCHAR(100) DEFAULT 'General',
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'New',
      created_at VARCHAR(100),
      date VARCHAR(100)
    )
  `);

  // 9. Create bookings table
  console.log('Creating bookings table...');
  await connection.execute(`
    CREATE TABLE bookings (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      message TEXT,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at VARCHAR(100),
      date VARCHAR(100)
    )
  `);

  // 10. Create discounts table
  console.log('Creating discounts table...');
  await connection.execute(`
    CREATE TABLE discounts (
      id VARCHAR(255) PRIMARY KEY,
      code VARCHAR(100) UNIQUE NOT NULL,
      type VARCHAR(50) NOT NULL,
      value DECIMAL(10, 2) DEFAULT 0.00,
      usage_count INT DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at VARCHAR(100)
    )
  `);

  // 11. Create reviews table
  console.log('Creating reviews table...');
  await connection.execute(`
    CREATE TABLE reviews (
      id VARCHAR(255) PRIMARY KEY,
      product_id VARCHAR(255),
      product_name VARCHAR(255),
      customer VARCHAR(255) NOT NULL,
      rating INT DEFAULT 5,
      comment TEXT,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at VARCHAR(100),
      date VARCHAR(100)
    )
  `);

  // 12. Create journal table
  console.log('Creating journal table...');
  await connection.execute(`
    CREATE TABLE journal (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      date VARCHAR(100) NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      category VARCHAR(100),
      status VARCHAR(50) DEFAULT 'Draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 13. Create settings table
  console.log('Creating settings table...');
  await connection.execute(`
    CREATE TABLE settings (
      key_name VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  console.log('✓ All tables created successfully!');

  // ================= SEEDING DATA =================

  // 1. Seed Products
  console.log('Seeding products...');
  const products = readJSON('products.json');
  for (const p of products) {
    const top = p.scent_notes ? JSON.stringify(p.scent_notes.top || []) : '[]';
    const heart = p.scent_notes ? JSON.stringify(p.scent_notes.mid || p.scent_notes.heart || []) : '[]';
    const base = p.scent_notes ? JSON.stringify(p.scent_notes.base || []) : '[]';
    const sizes = p.sizes ? JSON.stringify(p.sizes) : '[]';
    const additionalImages = p.additional_images ? JSON.stringify(p.additional_images) : '[]';
    
    let imgUrl = p.image_url || '';
    if (!imgUrl) {
      let slug = (p.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      if (slug === 'dream-droplet') slug = 'dream-drop-let';
      const localFile = path.join(__dirname, '../public/images', `product-${slug}.png`);
      if (fs.existsSync(localFile)) {
        imgUrl = `/images/product-${slug}.png`;
      }
    }

    await connection.execute(
      `INSERT INTO products (id, name, description, price, category, volume, image_url, position, visible, badge, top_notes, heart_notes, base_notes, sizes, additional_images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id, 
        p.name, 
        p.description || '', 
        p.price || 0, 
        p.category || '', 
        p.volume || '', 
        imgUrl, 
        p.position || 0, 
        p.visible ? 1 : 0, 
        p.badge || null, 
        top, 
        heart, 
        base, 
        sizes,
        additionalImages
      ]
    );
  }

  // 2. Seed Banners
  console.log('Seeding banners...');
  const banners = readJSON('banners.json');
  for (const b of banners) {
    await connection.execute(
      `INSERT INTO banners (id, image_url, mobile_image_url, position, active)
       VALUES (?, ?, ?, ?, ?)`,
      [b.id, b.image_url, b.mobile_image_url || null, b.position || 0, b.active ? 1 : 0]
    );
  }

  // 3. Seed Reels
  console.log('Seeding reels...');
  const reels = readJSON('reels.json');
  for (const r of reels) {
    await connection.execute(
      `INSERT INTO reels (id, video_url, thumbnail_url, handle, likes, product_tag, position, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r.id, 
        r.video_url || '', 
        r.thumbnail_url || null, 
        r.handle || '', 
        r.likes || '', 
        r.product_tag || '', 
        r.position || 0, 
        r.active ? 1 : 0
      ]
    );
  }

  // 4. Seed Customers
  console.log('Seeding customers...');
  const customers = readJSON('customers.json');
  for (const c of customers) {
    await connection.execute(
      `INSERT INTO customers (id, name, email, spent, orders, last_active, password_hash, phone)
       VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)`,
      [c.id, c.name, c.email.toLowerCase().trim(), c.spent || 0, c.orders || 0, c.lastActive || '']
    );
  }

  // 5. Seed Discounts
  console.log('Seeding discounts...');
  const discounts = readJSON('discounts.json');
  for (const d of discounts) {
    await connection.execute(
      `INSERT INTO discounts (id, code, type, value, usage_count, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [d.id, d.code, d.type, d.value || 0, d.usage_count || 0, d.active ? 1 : 0, d.created_at || new Date().toISOString()]
    );
  }

  // 6. Seed Reviews
  console.log('Seeding reviews...');
  const reviews = readJSON('reviews.json');
  for (const r of reviews) {
    await connection.execute(
      `INSERT INTO reviews (id, product_id, product_name, customer, rating, comment, status, created_at, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r.id, 
        r.product_id || null, 
        r.product || r.product_name || '', 
        r.customer, 
        r.rating || 5, 
        r.comment || '', 
        r.status || 'Pending', 
        r.created_at || new Date().toISOString(),
        r.date || ''
      ]
    );
  }

  // 7. Seed Journal
  console.log('Seeding journal...');
  const journal = readJSON('journal.json');
  for (const j of journal) {
    await connection.execute(
      `INSERT INTO journal (id, title, author, date, excerpt, content, category, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [j.id, j.title, j.author, j.date, j.excerpt || '', j.content, j.category || '', j.status || 'Draft']
    );
  }

  // 8. Seed Settings
  console.log('Seeding settings...');
  const settings = readJSON('settings.json');
  if (settings && typeof settings === 'object' && !Array.isArray(settings)) {
    for (const [key, val] of Object.entries(settings)) {
      await connection.execute(
        `INSERT INTO settings (key_name, value) VALUES (?, ?)`,
        [key, JSON.stringify(val)]
      );
    }
  }

  // 9. Seed Inquiries
  console.log('Seeding inquiries...');
  const inquiries = readJSON('inquiries.json');
  for (const inq of inquiries) {
    await connection.execute(
      `INSERT INTO inquiries (id, name, email, inquiry_type, message, status, created_at, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [inq.id, inq.name, inq.email, inq.inquiryType || 'General', inq.message, inq.status || 'New', inq.created_at || null, inq.date || null]
    );
  }

  // 10. Seed Bookings
  console.log('Seeding bookings...');
  const bookings = readJSON('bookings.json');
  for (const b of bookings) {
    await connection.execute(
      `INSERT INTO bookings (id, name, email, location, message, status, created_at, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.id, b.name, b.email, b.location, b.message || '', b.status || 'Pending', b.created_at || null, b.date || null]
    );
  }

  // 11. Seed Orders
  console.log('Seeding orders...');
  const orders = readJSON('orders.json');
  for (const o of orders) {
    // Address
    const address = o.shipping_address ? JSON.stringify(o.shipping_address) : '';
    await connection.execute(
      `INSERT INTO orders (id, customer_id, customer_name, customer_email, total, status, shipping_address, discount_code, created_at, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o.id, 
        o.customer_id || null, 
        o.customer ? o.customer.name : '', 
        o.customer ? o.customer.email : '', 
        o.total || 0, 
        o.status || 'Pending', 
        address, 
        o.discount_code || null, 
        o.created_at || new Date().toISOString(),
        o.date || ''
      ]
    );

    // Order items
    if (Array.isArray(o.items)) {
      for (const item of o.items) {
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, name, size, price, quantity, image)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            o.id,
            item.product_id || null,
            item.name,
            item.size || '',
            item.price || 0,
            item.quantity || 1,
            item.image || ''
          ]
        );
      }
    }
  }

  console.log('✓ Seeding complete!');
  await connection.end();
}

initDB().catch((err) => {
  console.error('Database setup failed:', err);
  process.exit(1);
});
