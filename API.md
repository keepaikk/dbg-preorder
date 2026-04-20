# DBG Preorder Site - API Documentation

## Overview
The DBG preorder site (`dbg.rpnmore.com`) uses a PostgreSQL database for product storage, with an Express.js backend API. Products are managed through the REST API.

---

## Database Schema

### Table: `dbg_products`

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | SERIAL | Auto | Primary key |
| `name` | VARCHAR(255) | Yes | Product name |
| `category` | VARCHAR(50) | Yes | One of: `car`, `laptop`, `smartphone`, `other` |
| `image` | TEXT | Yes | Image URL |
| `condition_desc` | VARCHAR(100) | No | Condition description |
| `original_price` | VARCHAR(50) | No | Original price (e.g., "$18,500") |
| `preorder_price` | VARCHAR(50) | Yes | Preorder price |
| `deposit` | VARCHAR(50) | No | Required deposit |
| `badge` | VARCHAR(100) | No | Promotional badge |
| `whatsapp_msg` | TEXT | No | WhatsApp message template |
| `status` | VARCHAR(20) | Auto | `active` or `inactive` |
| `created_at` | TIMESTAMP | Auto | Creation timestamp |
| `updated_at` | TIMESTAMP | Auto | Last update timestamp |

---

## API Endpoints

### Base URL
```
https://dbg.rpnmore.com/api
```

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

### Get Products
```http
GET /api/products
```

Returns all active products.

**Response:**
```json
{
  "products": [
    {
      "id": "1",
      "name": "Toyota Camry 2020 LE",
      "category": "car",
      "image": "https://images.unsplash.com/...",
      "condition": "UAE / US Used",
      "originalPrice": "$18,500",
      "preorderPrice": "$16,200",
      "deposit": "$500",
      "badge": "Most Popular"
    }
  ]
}
```

---

### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "Toyota Camry 2020 LE",
  "category": "car",
  "image": "https://images.unsplash.com/...",
  "condition": "UAE / US Used",
  "originalPrice": "$18,500",
  "preorderPrice": "$16,200",
  "deposit": "$500",
  "badge": "Most Popular",
  "whatsappMsg": "Hello! I'm interested..."
}
```

**Required fields:** `name`, `category`, `image`, `preorderPrice`

**Valid categories:** `car`, `laptop`, `smartphone`, `other`

**Response:** `201 Created` with product object

---

### Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Updated Product Name",
  "preorderPrice": "$15,000"
}
```

**Response:** `200 OK` with updated product object

---

### Delete Product (Soft Delete)
```http
DELETE /api/products/:id
```

Sets product status to `inactive`.

**Response:**
```json
{
  "success": true,
  "message": "Product deactivated",
  "id": 1
}
```

---

## N8N Integration

### Adding Products via N8N Webhook

Instead of n8n providing products, n8n will **POST** new products to the API.

**N8N Workflow:**
1. Trigger: When new product data available (Google Sheets, Airtable, etc.)
2. HTTP Request node:
   - Method: `POST`
   - URL: `https://dbg.rpnmore.com/api/products`
   - Body: JSON with product fields

**Example N8N HTTP Request:**
```json
{
  "method": "POST",
  "url": "https://dbg.rpnmore.com/api/products",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "name": "{{$json.product_name}}",
    "category": "{{$json.category}}",
    "image": "{{$json.image_url}}",
    "preorderPrice": "{{$json.price}}"
  }
}
```

---

## Environment Variables

### Development (`.env`)
```
DATABASE_URL=postgresql://postgres:3coinsltd@localhost:5432/rp
NODE_ENV=development
PORT=3000
```

### Production (`.env.production`)
```
DATABASE_URL=postgresql://postgres:3coinsltd@rpnmore-rpnmore-ktcg1a:5432/rp
NODE_ENV=production
PORT=3000
```

---

## Deployment

### Docker Build
```bash
docker build -t dbg-preorder .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:3coinsltd@rpnmore-rpnmore-ktcg1a:5432/rp" \
  dbg-preorder
```

### Dokploy Configuration
1. Set `DATABASE_URL` environment variable
2. Build and deploy with Dockerfile
3. Run `node scripts/db-init.js` once to initialize database (can be done in startup script)

### Initial Database Setup
After first deployment, run:
```bash
node scripts/db-init.js
```

This creates the table and seeds default products.

---

## Frontend Integration

The frontend fetches products from `/api/products` on mount and refreshes every 5 minutes.

**Error Handling:**
- If API fails, shows hardcoded fallback products
- Manual retry available on error