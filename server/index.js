/**
 * DBG Preorder Site - Express Server
 * Serves frontend static files and provides API for products
 */

import express from 'express';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:3coinsltd@localhost:5432/rp';

const pool = new Pool({
  connectionString: DATABASE_URL,
  // SSL disabled for internal Docker network
  ssl: false
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// GET /api/products - Returns all active products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        name,
        category,
        image,
        condition_desc as condition,
        original_price as "originalPrice",
        preorder_price as "preorderPrice",
        deposit,
        badge,
        whatsapp_msg as "whatsappMsg",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM dbg_products 
      WHERE status = 'active' 
      ORDER BY created_at DESC`
    );
    
    // Convert to frontend-expected format
    const products = result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      category: row.category,
      image: row.image,
      condition: row.condition,
      originalPrice: row.originalPrice,
      preorderPrice: row.preorderPrice,
      deposit: row.deposit,
      badge: row.badge,
      whatsappMsg: row.whatsappMsg
    }));
    
    res.json({ products });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products', products: [] });
  }
});

// POST /api/products - Add a new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, category, image, condition, originalPrice, preorderPrice, deposit, badge, whatsappMsg } = req.body;
    
    // Validate required fields
    if (!name || !category || !image || !preorderPrice) {
      return res.status(400).json({ 
        error: 'Missing required fields. Required: name, category, image, preorderPrice' 
      });
    }
    
    // Validate category
    const validCategories = ['car', 'laptop', 'smartphone', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      });
    }
    
    const result = await pool.query(
      `INSERT INTO dbg_products 
        (name, category, image, condition_desc, original_price, preorder_price, deposit, badge, whatsapp_msg)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, category, image, condition || null, originalPrice || null, preorderPrice, deposit || null, badge || null, whatsappMsg || null]
    );
    
    const row = result.rows[0];
    res.status(201).json({
      id: row.id.toString(),
      name: row.name,
      category: row.category,
      image: row.image,
      condition: row.condition_desc,
      originalPrice: row.original_price,
      preorderPrice: row.preorder_price,
      deposit: row.deposit,
      badge: row.badge,
      whatsappMsg: row.whatsapp_msg,
      status: row.status
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, image, condition, originalPrice, preorderPrice, deposit, badge, whatsappMsg, status } = req.body;
    
    // Build dynamic query
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (image !== undefined) {
      updates.push(`image = $${paramCount++}`);
      values.push(image);
    }
    if (condition !== undefined) {
      updates.push(`condition_desc = $${paramCount++}`);
      values.push(condition);
    }
    if (originalPrice !== undefined) {
      updates.push(`original_price = $${paramCount++}`);
      values.push(originalPrice);
    }
    if (preorderPrice !== undefined) {
      updates.push(`preorder_price = $${paramCount++}`);
      values.push(preorderPrice);
    }
    if (deposit !== undefined) {
      updates.push(`deposit = $${paramCount++}`);
      values.push(deposit);
    }
    if (badge !== undefined) {
      updates.push(`badge = $${paramCount++}`);
      values.push(badge);
    }
    if (whatsappMsg !== undefined) {
      updates.push(`whatsapp_msg = $${paramCount++}`);
      values.push(whatsappMsg);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE dbg_products SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const row = result.rows[0];
    res.json({
      id: row.id.toString(),
      name: row.name,
      category: row.category,
      image: row.image,
      condition: row.condition_desc,
      originalPrice: row.original_price,
      preorderPrice: row.preorder_price,
      deposit: row.deposit,
      badge: row.badge,
      whatsappMsg: row.whatsapp_msg,
      status: row.status
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Soft delete (set status to inactive)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE dbg_products SET status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ success: true, message: 'Product deactivated', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Serve static frontend files (must come after API routes)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at /api/products`);
      console.log(`🌐 Frontend served from ${distPath}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing connections...');
  await pool.end();
  process.exit(0);
});