import express from 'express';
import publicApp from './public-app.js';

const app = express();
const VERIFY_HOST = 'verify.misfitmafia.site';
const PRINTIFY_STORE_URL = 'https://misfitmafia.printify.me/';
const PRINTIFY_API_BASE = 'https://api.printify.com/v1';

function hostOf(req) {
  return String(req.get('x-forwarded-host') || req.get('host') || '')
    .split(',')[0]
    .trim()
    .split(':')[0]
    .toLowerCase();
}

function isVerifyHost(req) {
  return hostOf(req) === VERIFY_HOST;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function money(cents) {
  return `$${(Number(cents || 0) / 100).toFixed(2)}`;
}

async function printifyRequest(path) {
  const token = process.env.PRINTIFY_API_TOKEN;
  if (!token) throw new Error('PRINTIFY_API_TOKEN is not configured.');

  const response = await fetch(`${PRINTIFY_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'MisfitMafiaSite/1.0'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Printify API ${response.status}: ${text.slice(0, 300)}`);
  }

  return response.json();
}

async function resolveShopId() {
  if (process.env.PRINTIFY_SHOP_ID) return process.env.PRINTIFY_SHOP_ID;

  const shops = await printifyRequest('/shops.json');
  if (!Array.isArray(shops) || shops.length === 0) {
    throw new Error('No Printify shops were found for this API token.');
  }

  const preferred = shops.find(shop =>
    String(shop.title || '').toLowerCase().includes('misfit mafia')
  );

  return String((preferred || shops[0]).id);
}

async function loadProducts() {
  const shopId = await resolveShopId();
  const payload = await printifyRequest(`/shops/${encodeURIComponent(shopId)}/products.json?limit=50`);
  return Array.isArray(payload?.data) ? payload.data : [];
}

function storefrontShell(content) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="Browse official Misfit Mafia merch. Checkout and fulfillment are handled securely by Printify.">
  <title>Misfit Mafia Shop</title>
  <style>
    :root{--bg:#070809;--panel:#111317;--line:#2c3038;--text:#f5f5f5;--muted:#aeb2bb;--red:#b51f2a;--red2:#e13b47}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 50% -10%,#341016 0,#0b0c0e 40%,#060708 76%);color:var(--text);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;min-height:100vh}a{color:inherit}.wrap{width:min(1180px,calc(100% - 36px));margin:0 auto}.nav{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:20px 0;border-bottom:1px solid #24272e}.navleft,.navright{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.brand{font-size:24px;font-weight:950;text-decoration:none}.btn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border-radius:10px;padding:11px 16px;font-weight:800;border:1px solid #444954;background:#20232a}.btn.red{background:linear-gradient(180deg,var(--red2),var(--red));border-color:#e14b55}.hero{padding:58px 0 34px}.hero h1{font-size:clamp(46px,8vw,82px);margin:0 0 12px;letter-spacing:-.04em}.hero p{max-width:780px;color:#c5c8cf;font-size:18px;line-height:1.65}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;padding:12px 0 58px}.product{background:linear-gradient(180deg,#15171b,#0f1114);border:1px solid var(--line);border-radius:18px;overflow:hidden;display:flex;flex-direction:column}.product img{width:100%;aspect-ratio:1/1;object-fit:cover;background:#0d0f12}.product-body{padding:18px;display:flex;flex-direction:column;gap:10px;flex:1}.product h2{font-size:20px;margin:0}.price{font-size:20px;font-weight:900}.muted{color:var(--muted);line-height:1.55}.product .btn{margin-top:auto}.notice{background:#111317;border:1px solid var(--line);border-radius:16px;padding:18px;margin:0 0 30px}.empty{background:#111317;border:1px solid var(--line);border-radius:16px;padding:28px;margin-bottom:60px}.footer{border-top:1px solid #24272e;padding:28px 0 42px;color:#858a94;font-size:13px}
    @media(max-width:860px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.grid{grid-template-columns:1fr}.nav{align-items:flex-start;flex-direction:column}}
  </style>
</head>
<body><div class="wrap">
  <nav class="nav"><div class="navleft"><a class="btn red" href="https://verify.misfitmafia.site/">Verify</a><a class="brand" href="/">Misfit Mafia</a></div><div class="navright"><a class="btn" href="/shop">Shop</a><a class="btn" href="${PRINTIFY_STORE_URL}" target="_blank" rel="noopener noreferrer">Printify Cart</a></div></nav>
  ${content}
  <footer class="footer">Misfit Mafia merch browsing is provided on this site. Cart, payment, checkout, fulfillment, shipping and customer support are handled by Printify.</footer>
</div></body></html>`;
}

function renderProducts(products) {
  const published = products.filter(product => product?.visible !== false);

  if (!published.length) {
    return '<div class="empty"><h2>No products are showing yet.</h2><p class="muted">The shop is connected, but there are no visible products returned by Printify right now.</p><a class="btn red" href="' + PRINTIFY_STORE_URL + '" target="_blank" rel="noopener noreferrer">Open Printify Store</a></div>';
  }

  return `<div class="grid">${published.map(product => {
    const image = product?.images?.find(img => img?.is_default)?.src || product?.images?.[0]?.src || '';
    const enabledVariants = Array.isArray(product?.variants) ? product.variants.filter(v => v?.is_enabled !== false) : [];
    const prices = enabledVariants.map(v => Number(v?.price)).filter(Number.isFinite);
    const minimum = prices.length ? Math.min(...prices) : 0;
    const priceLabel = minimum ? `From ${money(minimum)}` : 'View price on Printify';
    const description = String(product?.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);

    return `<article class="product">
      ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(product?.title || 'Misfit Mafia merch')}" loading="lazy">` : ''}
      <div class="product-body">
        <h2>${escapeHtml(product?.title || 'Misfit Mafia Merch')}</h2>
        <div class="price">${escapeHtml(priceLabel)}</div>
        ${description ? `<div class="muted">${escapeHtml(description)}${description.length >= 180 ? '…' : ''}</div>` : ''}
        <a class="btn red" href="${PRINTIFY_STORE_URL}" target="_blank" rel="noopener noreferrer">Buy on Printify</a>
      </div>
    </article>`;
  }).join('')}</div>`;
}

async function shopHandler(req, res) {
  if (isVerifyHost(req)) return publicApp(req, res);

  try {
    const products = await loadProducts();
    return res.status(200).send(storefrontShell(`
      <main>
        <section class="hero"><h1>Misfit Mafia Shop</h1><p>Browse official Misfit Mafia merch here. When you're ready to buy, Printify handles the cart, payment, checkout, fulfillment and shipping.</p></section>
        <div class="notice"><strong>Checkout stays on Printify.</strong><div class="muted">This site only displays the catalog. No card or checkout information is collected by misfitmafia.site.</div></div>
        ${renderProducts(products)}
      </main>`));
  } catch (error) {
    console.error('Printify storefront error:', error);
    return res.status(200).send(storefrontShell(`
      <main>
        <section class="hero"><h1>Misfit Mafia Shop</h1><p>The native catalog is ready, but the Printify API connection still needs to be configured.</p></section>
        <div class="empty"><h2>Shop setup required</h2><p class="muted">Add PRINTIFY_API_TOKEN to Railway. PRINTIFY_SHOP_ID is optional because the app can discover your shop automatically.</p><a class="btn red" href="${PRINTIFY_STORE_URL}" target="_blank" rel="noopener noreferrer">Shop on Printify for now</a></div>
      </main>`));
  }
}

app.get(['/shop', '/store', '/merch'], shopHandler);
app.use(publicApp);

export default app;
