/**
 * Database initialization script for DBG Preorder Site
 * Creates table and seeds default products
 * 
 * Usage: node scripts/db-init.js
 */

import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:3coinsltd@localhost:5432/rp';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false
});

// SQL to create the products table
const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS dbg_products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('car', 'laptop', 'smartphone', 'other')),
  image TEXT NOT NULL,
  condition_desc VARCHAR(100),
  original_price VARCHAR(50),
  preorder_price VARCHAR(50) NOT NULL,
  deposit VARCHAR(50),
  badge VARCHAR(100),
  whatsapp_msg TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for active products query
CREATE INDEX IF NOT EXISTS idx_dbg_products_status ON dbg_products(status);
`;

// Default seed products
const SEED_PRODUCTS = [
  {
    name: 'Toyota Camry 2020 LE',
    category: 'car',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
    condition: 'UAE / US Used',
    originalPrice: '$18,500',
    preorderPrice: '$16,200',
    deposit: '$500',
    badge: 'Most Popular',
    whatsappMsg: 'Hello! I\'m interested in preordering the Toyota Camry 2020 LE. Can you guide me on the deposit process?'
  },
  {
    name: 'MacBook Pro M3 Max (14-inch)',
    category: 'laptop',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800&h=600&fit=crop',
    condition: 'UK Used - Grade A',
    originalPrice: '$2,499',
    preorderPrice: '$2,150',
    deposit: '$100',
    badge: 'Limited Slots',
    whatsappMsg: 'Hi, I want to reserve the MacBook Pro M3 Max. Is it still available for the $2,150 preorder price?'
  },
  {
    name: 'iPhone 15 Pro Max (256GB)',
    category: 'smartphone',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=600&fit=crop',
    condition: 'US Used - Like New',
    originalPrice: '$1,199',
    preorderPrice: '$980',
    deposit: '$50',
    badge: 'Flash Sale',
    whatsappMsg: 'Hello, I\'d like to preorder the iPhone 15 Pro Max. Please send me the payment details for the $50 deposit.'
  }
];

async function initDatabase() {
  console.log('🔧 Initializing database...');
  console.log(`📡 Connecting to: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
  
  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Create table
    console.log('📝 Creating table...');
    await pool.query(CREATE_TABLE_SQL);
    console.log('✅ Table created/verified');
    
    // Check if products already exist
    const existingCheck = await pool.query('SELECT COUNT(*) FROM dbg_products WHERE status = $1', ['active']);
    const count = parseInt(existingCheck.rows[0].count);
    
    if (count > 0) {
      console.log(`ℹ️  Found ${count} existing products, skipping seed`);
    } else {
      // Seed products
      console.log('🌱 Seeding default products...');
      
      for (const product of SEED_PRODUCTS) {
        await pool.query(
          `INSERT INTO dbg_products 
            (name, category, image, condition_desc, original_price, preorder_price, deposit, badge, whatsapp_msg)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            product.name,
            product.category,
            product.image,
            product.condition,
            product.originalPrice,
            product.preorderPrice,
            product.deposit,
            product.badge,
            product.whatsappMsg
          ]
        );
        console.log(`  ✓ Added: ${product.name}`);
      }
      
      console.log('✅ Seeding complete');
    }
    
    // Show final count
    const finalCheck = await pool.query('SELECT * FROM dbg_products WHERE status = $1 ORDER BY id', ['active']);
    console.log(`\n📊 Database ready with ${finalCheck.rows.length} active products:`);
    finalCheck.rows.forEach(row => {
      console.log(`  [${row.id}] ${row.name} - ${row.preorder_price}`);
    });
    
    await pool.end();
    console.log('\n✅ Database initialization complete!');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    await pool.end();
    process.exit(1);
  }
}

// Run init
initDatabase();