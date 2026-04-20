# DBG Preorder Site

Glassmorphism e-commerce preorder site for DBG Dobuygoods. Built with React + Vite + Tailwind CSS + Express + PostgreSQL.

## Features

- 🛒 Product catalog with preorder pricing
- 📱 WhatsApp integration for instant contact
- ⏰ Countdown timer for urgency
- 🗄️ PostgreSQL database for products
- 🔄 Auto-refresh products every 5 minutes
- 🎨 Glassmorphism UI design
- 📱 Mobile responsive
- 🚀 Single-container deployment

## Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 4, Motion (Framer Motion)
- **Backend:** Express.js, Node.js 20
- **Database:** PostgreSQL
- **Icons:** Lucide React

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database

### Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Initialize database (first time only)
npm run db:init

# Build frontend
npm run build

# Start server
npm start
```

Server runs at http://localhost:3000

### Development Mode

```bash
# Run frontend dev server
npm run dev

# In another terminal, run backend
npm run dev:server
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/dbname` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` or `production` |

## Database Setup

Run the initialization script to create tables and seed default products:

```bash
npm run db:init
```

This creates:
- `dbg_products` table with proper schema
- Index on `status` column
- 3 seed products (Toyota Camry, MacBook Pro, iPhone)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/products` | Get all active products |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Soft delete product |

See [API.md](./API.md) for full documentation.

## N8N Integration

N8N can push products to the site via POST to `/api/products`:

```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "category": "smartphone",
  "image": "https://example.com/image.jpg",
  "preorderPrice": "$1,199"
}
```

## Docker Deployment

```bash
# Build image
docker build -t dbg-preorder .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:password@host:5432/dbname" \
  dbg-preorder
```

### Dokploy

1. Connect GitHub repo
2. Set environment variable `DATABASE_URL`
3. Deploy

## Project Structure

```
├── dist/                  # Built frontend (generated)
├── server/
│   └── index.js          # Express server
├── scripts/
│   └── db-init.js        # Database initialization
├── src/
│   ├── App.tsx           # Main React component
│   ├── index.css         # Tailwind styles
│   └── main.tsx          # React entry point
├── index.html            # HTML template
├── package.json
├── vite.config.ts
├── Dockerfile
├── API.md                # API documentation
└── README.md
```

## WhatsApp Integration

All WhatsApp CTAs use the direct chat link:
```
https://wa.me/message/6NH5AETQUU7TL1
```

No message parameter needed - users land directly in the chat.

## License

Apache-2.0