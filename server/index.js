const express = require('express');
const crypto = require('crypto');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const SHOPIFY_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || 'your_webhook_secret_here';

// ── Database ──────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    );
  `);
  // Seed initial data if empty
  const res = await pool.query(`SELECT key FROM inventory WHERE key = 'data'`);
  if (res.rows.length === 0) {
    await pool.query(
      `INSERT INTO inventory (key, value) VALUES ('data', $1)`,
      [JSON.stringify(getInitialData())]
    );
    console.log('Database seeded with initial data');
  }
}

async function loadData() {
  const res = await pool.query(`SELECT value FROM inventory WHERE key = 'data'`);
  return res.rows[0].value;
}

async function saveData(data) {
  await pool.query(
    `UPDATE inventory SET value = $1 WHERE key = 'data'`,
    [JSON.stringify(data)]
  );
}

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());

// ── Initial data ──────────────────────────────────────────────
function getInitialData() {
  return {
    categories: {
      Polos: {
        Navy:         { hex:'#1a237e', designs:['Attire Navy Blue','Iconic Scuderia','Maserati Legacy','Original','Porsche 911 Turbo','Porsche Fireline','Porsche Fireline V2','Quadro','RB Racing Core','RallyX','Speed Mark','Vette'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        Black:        { hex:'#212121', designs:['AMG Mark','Attire CEO','Attire Black','F1 Noir','GrandPrix','Honda Mark','Iconic Scuderia','Maserati Legacy','Merc Mark','Miura Bull','Porsche 911 Turbo','Porsche Fireline','Porsche Fireline V2','Quadro','RB Racing Core','Rosso Nero','Speed Mark'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        White:        { hex:'#e0e0e0', designs:['AMG Mark','Attire White','Miura Bull','Original','Porsche Fireline','Quattro','RallyX'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        Maroon:       { hex:'#800000', designs:['Ferrari Mark','Original','Porsche Mark'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        Red:          { hex:'#c62828', designs:['Attire Red','Iconic Scuderia','Maserati Legacy','Vette'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        'Royal Blue': { hex:'#1565c0', designs:['Maserati Legacy'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        Orange:       { hex:'#e65100', designs:['Toro'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        'Sea Green':  { hex:'#2e7d32', designs:['Original'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        'Teal Green': { hex:'#00695c', designs:['Original'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
      },
      Hoodies: {
        Black:        { hex:'#212121', designs:['AMG Momentum Gear','Attire Black','BMW Mark','Dogg Edition','Grove Drop','Iconic Scuderia','Jordan 23','Marley Version','Midnight Monster','Original','Pitstop','Porsche 911','Porsche Mark','Pure AMG','Rosso Nero','Tokyo Spirit'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        Maroon:       { hex:'#800000', designs:['Attire Maroon','Audi Mark','Ferrari Mark','Honda Mark'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        Navy:         { hex:'#1a237e', designs:['Attire Navy Blue','Original'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        'Royal Blue': { hex:'#1565c0', designs:['Attire Royal Blue','Original'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        'Dark Green': { hex:'#1b5e20', designs:['Attire Dark Green'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        'Teal Green': { hex:'#00695c', designs:['Original'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        White:        { hex:'#e0e0e0', designs:['Attire White'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
      },
      'Crew Necks': {
        Black:        { hex:'#212121', designs:['AD24 Black Edition','Code Dignity','Code Yakuza','PitStop Red Label','Pitstop White Label','Plain Cotton','Raw Primal','The 90s','The Original'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        White:        { hex:'#e0e0e0', designs:['Code Yakuza','PitStop Red Label','Pitstop Black Label','Raw Primal','Texas Dust'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
      },
      'Drop Shoulders': {
        Black:        { hex:'#212121', designs:['Air Drop 23','Attire Black','Chakra Cut'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        Maroon:       { hex:'#800000', designs:['Attire Maroon'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        'Sky Blue':   { hex:'#0288d1', designs:['Attire Sky Blue'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        'Olive Green':{ hex:'#827717', designs:['Attire Olive Green'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        Beige:        { hex:'#d7ccc8', designs:['Attire Beige'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        White:        { hex:'#e0e0e0', designs:['Attire White'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
      },
      Activewear: {
        Black:        { hex:'#212121', designs:['Active Pro','Armour','Iron Paradise','PowerPulse Tracksuit','Sprint','Stride'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        Navy:         { hex:'#1a237e', designs:['Active Pro','Armour','Iron Paradise','Sprint','Stride'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        Maroon:       { hex:'#800000', designs:['Active Pro','Armour','Iron Paradise','Sprint','Stride'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        'Olive Green':{ hex:'#827717', designs:['Armour','Champions Trophy','Iron Paradise','Sprint','Stride'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        White:        { hex:'#e0e0e0', designs:['Armour','Iron Paradise','Sprint','Stride'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        Yellow:       { hex:'#f9a825', designs:['Active Pro Female','Armour Female','Iron Paradise Female','Sprint Female'], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
      },
      Sweatshirts: {
        Black:        { hex:'#212121', designs:['AMG Black','Attire Black','Game Token','Porsche Fireline',"Player's Choice","The King's Call"], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
        White:        { hex:'#e0e0e0', designs:["Player's Choice","The King's Call"], stock:{S:0,M:0,L:0,XL:0,XXL:0} },
      },
    },
    printed: {},
    orders: [],
  };
}

// ── Shopify HMAC ──────────────────────────────────────────────
function verifyShopifyWebhook(req) {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  if (!hmac) return false;
  const digest = crypto.createHmac('sha256', SHOPIFY_SECRET).update(req.body).digest('base64');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

// ── Shopify line item parser ──────────────────────────────────
function parseLineItems(lineItems, data) {
  const sizeMap = {
    'small':'S','medium':'M','large':'L','extra large':'XL',
    'extra large (xl)':'XL','xl':'XL','2xl':'XXL','xxl':'XXL',
    's':'S','m':'M','l':'L'
  };

  return lineItems.map(item => {
    const title = item.title || '';
    const variant = item.variant_title || '';
    const parts = variant.split(' / ').map(p => p.trim());

    let colour = null, size = 'M';

    for (const part of parts) {
      const lp = part.toLowerCase();
      if (sizeMap[lp]) {
        size = sizeMap[lp];
      } else {
        let found = null;
        Object.values(data.categories).forEach(cat => {
          Object.keys(cat).forEach(cn => {
            if (cn.toLowerCase() === lp) found = cn;
          });
        });
        if (found) colour = found;
        else if (!colour) colour = part;
      }
    }
    if (!colour) colour = parts[0] || 'Unknown';

    const design = title
      .replace(/^Cosmo /i, '')
      .replace(/ Polo Shirt$/i, '').replace(/ Polo$/i, '')
      .replace(/ Hoodie$/i, '').replace(/ Crew Neck$/i, '')
      .replace(/ Drop Shoulder$/i, '').replace(/ Sweat ?[Ss]hirt$/i, '')
      .replace(/ Drifit$/i, '').replace(/ \|.*$/i, '')
      .trim() || 'Unknown';

    const tl = title.toLowerCase();
    let category = 'Polos';
    if (tl.includes('hoodie')) category = 'Hoodies';
    else if (tl.includes('crew neck')) category = 'Crew Necks';
    else if (tl.includes('drop shoulder')) category = 'Drop Shoulders';
    else if (tl.includes('drifit') || tl.includes('tracksuit') || tl.includes('activewear')) category = 'Activewear';
    else if (tl.includes('sweat')) category = 'Sweatshirts';

    return { category, colour, design, size, qty: item.quantity, sku: item.sku, rawTitle: title };
  });
}

// ── Fulfillment ───────────────────────────────────────────────
function fulfil(data, category, colour, design, size, qty) {
  const pk = `${category}||${colour}||${design}||${size}`;
  const pAvail = data.printed[pk] || 0;
  const rAvail = data.categories[category]?.[colour]?.stock[size] ?? 0;
  const fromPrinted = Math.min(pAvail, qty);
  const fromRaw = Math.min(rAvail, qty - fromPrinted);
  if (fromPrinted + fromRaw < qty) return { ok:false, fromPrinted, fromRaw, pAvail, rAvail };
  data.printed[pk] = pAvail - fromPrinted;
  if (data.categories[category]?.[colour]) data.categories[category][colour].stock[size] -= fromRaw;
  return { ok:true, fromPrinted, fromRaw };
}

// ── Webhook ───────────────────────────────────────────────────
app.post('/webhooks/orders/create', async (req, res) => {
  if (!verifyShopifyWebhook(req)) return res.status(401).send('Unauthorized');
  let order;
  try { order = JSON.parse(req.body.toString()); } catch { return res.status(400).send('Bad JSON'); }

  const data = await loadData();
  const lineItems = parseLineItems(order.line_items || [], data);
  const failed = [];

  for (const item of lineItems) {
    const result = fulfil(data, item.category, item.colour, item.design, item.size, item.qty);
    const src = result.fromPrinted > 0 && result.fromRaw > 0 ? 'Mixed' : result.fromPrinted > 0 ? 'Printed' : 'Raw';
    data.orders.unshift({
      type:'order', source:'shopify', orderId:`#${order.order_number}`,
      shopifyId: String(order.id),
      customer: `${order.customer?.first_name||''} ${order.customer?.last_name||''}`.trim() || order.email || '—',
      category: item.category, colour: item.colour, design: item.design,
      size: item.size, qty: item.qty,
      src: result.ok ? src : 'FAILED – insufficient stock',
      status: result.ok ? 'fulfilled' : 'failed',
      time: new Date().toISOString(),
    });
    if (!result.ok) failed.push(item);
  }

  // Keep only last 500 orders
  if (data.orders.length > 500) data.orders = data.orders.slice(0, 500);

  await saveData(data);
  console.log(`Shopify order #${order.order_number} processed. Failed: ${failed.length}`);
  res.status(200).json({ processed: lineItems.length, failed: failed.length });
});

// ── REST API ──────────────────────────────────────────────────
app.get('/api/inventory', async (req, res) => res.json(await loadData()));

app.post('/api/orders', async (req, res) => {
  const { orderId, customer, category, colour, design, size, qty } = req.body;
  const data = await loadData();
  const result = fulfil(data, category, colour, design, size, qty);
  if (!result.ok) return res.status(400).json({ ok:false, message:`Insufficient stock. ${result.fromPrinted} printed + ${result.fromRaw} raw available.` });
  const src = result.fromPrinted>0 && result.fromRaw>0 ? 'Mixed' : result.fromPrinted>0 ? 'Printed' : 'Raw';
  data.orders.unshift({ type:'order', source:'manual', orderId, customer, category, colour, design, size, qty, src, status:'fulfilled', time:new Date().toISOString() });
  await saveData(data);
  res.json({ ok:true, src, fromPrinted:result.fromPrinted, fromRaw:result.fromRaw });
});

app.post('/api/returns', async (req, res) => {
  const { orderId, customer, category, colour, design, size, qty, reason } = req.body;
  const data = await loadData();
  const pk = `${category}||${colour}||${design}||${size}`;
  data.printed[pk] = (data.printed[pk] || 0) + qty;
  data.orders.unshift({ type:'return', source:'manual', orderId:orderId||'—', customer:customer||'—', category, colour, design, size, qty, src:`Return: ${reason||'unspecified'}`, status:'returned', time:new Date().toISOString() });
  await saveData(data);
  res.json({ ok:true });
});

app.patch('/api/raw/:category/:colour/:size', async (req, res) => {
  const { category, colour, size } = req.params;
  const { qty } = req.body;
  const data = await loadData();
  if (!data.categories[category]?.[colour]) return res.status(404).json({ ok:false, message:'Not found' });
  data.categories[category][colour].stock[size] = Math.max(0, qty);
  await saveData(data);
  res.json({ ok:true });
});

app.post('/api/colours', async (req, res) => {
  const { category, name, hex, stock } = req.body;
  const data = await loadData();
  if (!data.categories[category]) return res.status(404).json({ ok:false, message:'Category not found' });
  if (data.categories[category][name]) return res.status(409).json({ ok:false, message:'Colour already exists' });
  data.categories[category][name] = { hex, designs:[], stock: stock||{S:0,M:0,L:0,XL:0,XXL:0} };
  await saveData(data);
  res.json({ ok:true });
});

app.delete('/api/colours/:category/:name', async (req, res) => {
  const data = await loadData();
  const { category, name } = req.params;
  if (data.categories[category]) delete data.categories[category][name];
  await saveData(data);
  res.json({ ok:true });
});

// ── Start ─────────────────────────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Cosmo Attire inventory server on port ${PORT}`);
      console.log(`Database: connected`);
    });
  })
  .catch(err => {
    console.error('DB init failed:', err.message);
    process.exit(1);
  });
