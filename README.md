# Polo Inventory — Shopify Integration

Full inventory system for print-on-demand polo business. Tracks raw stock by colour+size, printed (returned) stock by colour+design+size, and auto-deducts when Shopify orders arrive via webhook.

## Architecture

```
Shopify order placed
       ↓
Shopify webhook (POST /webhooks/orders/create)
       ↓
Express server verifies HMAC + parses colour/design/size from variant title
       ↓
Deducts from printed stock first, then raw stock
       ↓
Logs to SQLite DB
       ↓
Frontend polls /api/inventory + /api/log every 15s
```

## Deploy in 10 minutes (Railway — free tier)

### 1. Push to GitHub
```bash
cd polo-inventory
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/YOUR_USERNAME/polo-inventory.git
git push -u origin main
```

### 2. Deploy on Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select your repo → Railway auto-detects Node.js and deploys
3. Your public URL appears in the dashboard (e.g. `https://polo-inventory-production.up.railway.app`)

### 3. Add environment variable
In Railway dashboard → Variables:
```
SHOPIFY_WEBHOOK_SECRET = (you'll get this from Shopify in step 4)
```

### 4. Register Shopify webhook
1. Shopify Admin → Settings → Notifications → scroll to Webhooks
2. Click "Create webhook"
3. Event: `Order creation`
4. Format: `JSON`
5. URL: `https://YOUR-RAILWAY-URL.railway.app/webhooks/orders/create`
6. Copy the "Signing secret" shown → paste it as `SHOPIFY_WEBHOOK_SECRET` in Railway

### 5. Open your inventory app
Visit `https://YOUR-RAILWAY-URL.railway.app` → go to "Shopify setup" tab → enter your Railway URL → test connection.

---

## Shopify variant naming (IMPORTANT)

The server parses colour and design from Shopify product variant titles.
Your variants **must include** the polo colour and design name.

**Correct format:**
```
Navy / 911 Turbo / Medium
Black / Maserati / Small  
Red / Fireline / Large
```

Set this up in Shopify: Products → [your product] → Variants → edit variant title.

The server matches against colour names and design names stored in your inventory DB.

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | Full stock state |
| GET | `/api/log` | Order + return history |
| POST | `/api/order` | Manual order |
| POST | `/api/return` | Log return to printed stock |
| PATCH | `/api/stock` | Update raw quantity |
| POST | `/api/colour` | Add new colour |
| DELETE | `/api/colour/:name` | Remove colour |
| POST | `/api/design` | Add design to colour |
| GET | `/api/health` | Health check |
| POST | `/webhooks/orders/create` | Shopify webhook receiver |

---

## Local development

```bash
npm install
cp .env.example .env
# Edit .env with your SHOPIFY_WEBHOOK_SECRET
npm run dev
# Server runs at http://localhost:3000
```

To test webhooks locally, use [ngrok](https://ngrok.com):
```bash
ngrok http 3000
# Use the ngrok URL as your Shopify webhook URL temporarily
```

---

## Returns flow

When a customer returns a polo:
1. Go to "Log return" tab
2. Select colour, design, size — enter qty
3. Submit → unit added to **printed stock** (not raw)

On next order for that same colour+design+size → server uses printed stock first, then raw.

---

## Fulfillment priority logic

```
order for Navy / 911 Turbo / Medium x1
  → check printed[Navy][911 Turbo][Medium] → e.g. 2 available → use 1 from printed
  → raw stock NOT touched

order for Navy / 911 Turbo / Medium x3, printed has 2
  → use 2 from printed + 1 from raw

order for Navy / Fireline / Small, no printed stock
  → use raw stock only → triggers print job
```
