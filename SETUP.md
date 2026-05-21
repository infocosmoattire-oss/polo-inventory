# Polo Inventory — Setup Guide

## What you have

```
polo-inventory/
├── server/
│   └── index.js        ← Node.js backend (Shopify webhook + REST API)
├── public/
│   └── index.html      ← Inventory dashboard (open in any browser)
├── package.json
├── Procfile            ← For Railway deployment
└── SETUP.md            ← This file
```

---

## Step 1 — Deploy the server (Railway, free)

1. Create a GitHub repo and push this whole folder to it
2. Go to https://railway.app → Sign up free → New Project → Deploy from GitHub repo
3. Select your repo → Railway auto-detects Node.js and deploys
4. Go to your project → Variables → Add:
   ```
   SHOPIFY_WEBHOOK_SECRET = (copy from Shopify in Step 2)
   ```
5. Copy your Railway URL — looks like: `https://polo-inventory-production.up.railway.app`

---

## Step 2 — Register webhook in Shopify

1. In Shopify Admin → Settings → Notifications → scroll to bottom → Webhooks
2. Click **Create webhook**
3. Fill in:
   - **Event**: Order creation
   - **Format**: JSON
   - **URL**: `https://YOUR-RAILWAY-URL/webhooks/orders/create`
4. Click Save — Shopify will show you the **Signing secret**
5. Copy that secret → paste into Railway as `SHOPIFY_WEBHOOK_SECRET`
6. Redeploy (or Railway auto-redeploys on env change)

---

## Step 3 — Connect the dashboard

1. Open `public/index.html` in your browser (double-click the file)
2. Go to **Configuration** tab
3. Paste your Railway URL (e.g. `https://polo-inventory-production.up.railway.app`)
4. Click **Save** — you should see "Synced" in green
5. The webhook URL is auto-shown — verify it matches what you put in Shopify

---

## Step 4 — Configure Shopify product variants

For stock to auto-deduct correctly, your Shopify polo products MUST have variants in this order:

| Option | What it maps to | Example |
|--------|----------------|---------|
| Option 1 | Colour | Navy, Black, White, Red |
| Option 2 | Design | Fireline, Maserati, 911 Turbo |
| Option 3 | Size | S, M, L, XL |

Shopify sends `variant_title` as `"Navy / Fireline / M"` — the server splits this automatically.

---

## How it works when a Shopify order comes in

```
Customer orders "Navy / Fireline / M" x1 on Shopify
        ↓
Shopify sends webhook to your server
        ↓
Server verifies it's real (HMAC signature check)
        ↓
Checks printed stock first → Navy / Fireline / M
        ↓ (none available)
Deducts 1 from raw Navy / M stock
        ↓
Saves to inventory.json
        ↓
Dashboard polls every 10s → shows updated stock + order in history
```

---

## Running locally (for testing)

```bash
npm install
SHOPIFY_WEBHOOK_SECRET=test node server/index.js
```

Server runs at http://localhost:3000  
Open public/index.html → set server URL to `http://localhost:3000`

To test a fake Shopify webhook locally:
```bash
curl -X POST http://localhost:3000/webhooks/orders/create \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Hmac-Sha256: SKIP" \
  -d '{"order_number":1001,"customer":{"first_name":"Ali","last_name":"Hassan"},"line_items":[{"variant_title":"Navy / Fireline / M","quantity":1,"title":"Polo Shirt","sku":"POLO-001"}]}'
```
*(Note: HMAC check will fail for this test curl — comment out verifyShopifyWebhook for local testing)*

---

## Inventory data

All inventory is stored in `server/inventory.json` — auto-created on first run.  
Edit this file directly to set your real starting stock levels, or use the dashboard's Edit Stock tab.
