import crypto from 'crypto';
import express from 'express';
import shopApp from './shop-wrapper.js';
import { db } from './db.js';

const app = express();
const VERIFY_HOST = 'verify.misfitmafia.site';
const ADMIN_PASSWORD_SHA256 = '229bf12af52f43cf4f068927f5bb4c978891ec4bd7e400181dd457c4f378c826';
const ADMIN_SESSION = crypto.randomBytes(32).toString('hex');

app.use(express.urlencoded({ extended: false }));

function hostOf(req) {
  return String(req.get('x-forwarded-host') || req.get('host') || '')
    .split(',')[0].trim().split(':')[0].toLowerCase();
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

function cookieValue(req, name) {
  const cookies = String(req.headers.cookie || '').split(';');
  for (const item of cookies) {
    const [key, ...rest] = item.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

function isAdmin(req) {
  return cookieValue(req, 'mm_site_admin') === ADMIN_SESSION;
}

function passwordMatches(password) {
  const supplied = crypto.createHash('sha256').update(String(password || '')).digest('hex');
  const a = Buffer.from(supplied, 'hex');
  const b = Buffer.from(ADMIN_PASSWORD_SHA256, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function ensureSiteCreatorsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS site_creators (
      id BIGSERIAL PRIMARY KEY,
      display_name TEXT NOT NULL,
      youtube_channel_url TEXT NOT NULL,
      youtube_channel_id TEXT,
      youtube_handle TEXT,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.query(`ALTER TABLE site_creators ADD COLUMN IF NOT EXISTS youtube_handle TEXT`);
}

function normalizeHandle(value = '') {
  let text = String(value || '').trim();
  const urlMatch = text.match(/youtube\.com\/@([^/?#]+)/i);
  if (urlMatch) text = `@${urlMatch[1]}`;
  if (text && !text.startsWith('@')) text = `@${text}`;
  return /^@[A-Za-z0-9._-]+$/.test(text) ? text : '';
}

function shell(title, body) {
  return `<!doctype html><html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)} | Misfit Mafia</title>
  <style>
    :root{--bg:#08090b;--panel:#121419;--line:#333740;--red:#e21d2d;--silver:#c7cbd2;--muted:#969ca6;--white:#f7f7f8}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 50% -15%,#3b0d13 0,#0b0c0f 38%,#07080a 75%);color:var(--silver);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;min-height:100vh}.wrap{width:min(1120px,calc(100% - 34px));margin:auto}.nav{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:22px 0;border-bottom:1px solid #292c33}.brand{color:var(--red);font-size:24px;font-weight:950;text-decoration:none}.nav a{color:var(--silver);text-decoration:none}.panel{background:linear-gradient(180deg,#15171c,#101216);border:1px solid var(--line);border-radius:18px;padding:24px}.login{max-width:470px;margin:90px auto}.login h1,.page h1,.page h2{color:var(--red)}label{display:block;font-weight:800;margin:12px 0 7px;color:var(--silver)}input{width:100%;background:#090a0d;color:var(--white);border:1px solid #3b4049;border-radius:9px;padding:12px 13px;font-size:16px}.btn,button{display:inline-flex;align-items:center;justify-content:center;border:1px solid #e64a56;border-radius:9px;padding:11px 15px;background:#b61724;color:white;text-decoration:none;font-weight:850;cursor:pointer}.btn.gray,button.gray{background:#242831;border-color:#414650;color:var(--silver)}button.danger{background:#6f151c;border-color:#9f2730}.error{border:1px solid #7d2630;background:#2a1115;color:#ffb9bf;border-radius:10px;padding:12px;margin-bottom:14px}.page{padding:34px 0 60px}.grid{display:grid;grid-template-columns:360px 1fr;gap:18px;align-items:start}.creator{border-top:1px solid #30343c;padding:16px 0;display:grid;grid-template-columns:1fr auto;gap:12px}.creator:first-child{border-top:0}.creator h3{color:var(--red);margin:0 0 6px}.small{color:var(--muted);font-size:13px;word-break:break-all}.actions{display:flex;gap:8px;flex-wrap:wrap}.status{font-size:12px;font-weight:900;border:1px solid #4a4f58;border-radius:999px;padding:4px 8px;display:inline-block;margin-top:8px}.status.on{color:#a8e9bf;border-color:#34704a}.status.off{color:#c1c4ca}.hint{font-size:13px;color:var(--muted);line-height:1.5}.toprow{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px}@media(max-width:800px){.grid{grid-template-columns:1fr}.login{margin-top:45px}}
  </style></head><body><div class="wrap"><nav class="nav"><a class="brand" href="/">MISFIT MAFIA</a><div><a href="/shop">Shop</a> &nbsp; <a href="https://verify.misfitmafia.site/">Verify</a></div></nav>${body}</div></body></html>`;
}

app.get('/admin', async (req, res, next) => {
  if (isVerifyHost(req)) return shopApp(req, res, next);
  if (!isAdmin(req)) {
    return res.status(200).send(shell('Admin Login', `<main class="login panel"><h1>Website Admin</h1><p>Manage the creators displayed on the Misfit Mafia website.</p><form method="post" action="/admin/login"><label>Password</label><input type="password" name="password" autocomplete="current-password" required><div style="height:14px"></div><button type="submit">Login</button></form></main>`));
  }

  await ensureSiteCreatorsTable();
  const { rows } = await db.query('SELECT * FROM site_creators ORDER BY sort_order ASC, id ASC');
  const creators = rows.length ? rows.map(c => `<div class="creator"><div><h3>${escapeHtml(c.display_name)}</h3><div class="small">${escapeHtml(c.youtube_handle || c.youtube_channel_url)}</div><div class="small">${escapeHtml(c.youtube_channel_url)}</div><span class="status ${c.enabled ? 'on' : 'off'}">${c.enabled ? 'ENABLED' : 'DISABLED'}</span></div><div class="actions"><form method="post" action="/admin/creators/${c.id}/toggle"><button class="gray" type="submit">${c.enabled ? 'Disable' : 'Enable'}</button></form><form method="post" action="/admin/creators/${c.id}/delete" onsubmit="return confirm('Remove this creator from the website?')"><button class="danger" type="submit">Remove</button></form></div></div>`).join('') : '<p>No website creators have been added yet.</p>';

  return res.status(200).send(shell('Admin', `<main class="page"><div class="toprow"><div><h1>Website Creator Admin</h1><p>This list is separate from YouTube membership/OAuth creator connections.</p></div><a class="btn gray" href="/admin/logout">Log Out</a></div><div class="grid"><section class="panel"><h2>Add Creator</h2><form method="post" action="/admin/creators"><label>Display Name</label><input name="display_name" required placeholder="Creator name"><label>YouTube @Handle</label><input name="youtube_handle" required placeholder="@creator"><p class="hint">Enter the creator's YouTube handle, for example <strong>@creator</strong>. You can also paste a YouTube @handle URL and it will be converted automatically.</p><button type="submit">Add Creator</button></form></section><section class="panel"><h2>Website Creators</h2>${creators}</section></div></main>`));
});

app.post('/admin/login', (req, res, next) => {
  if (isVerifyHost(req)) return shopApp(req, res, next);
  if (!passwordMatches(req.body?.password)) {
    return res.status(401).send(shell('Admin Login', `<main class="login panel"><h1>Website Admin</h1><div class="error">Incorrect password.</div><form method="post" action="/admin/login"><label>Password</label><input type="password" name="password" required><div style="height:14px"></div><button type="submit">Login</button></form></main>`));
  }
  res.setHeader('Set-Cookie', `mm_site_admin=${encodeURIComponent(ADMIN_SESSION)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`);
  return res.redirect(303, '/admin');
});

app.get('/admin/logout', (req, res, next) => {
  if (isVerifyHost(req)) return shopApp(req, res, next);
  res.setHeader('Set-Cookie', 'mm_site_admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  return res.redirect(302, '/admin');
});

app.post('/admin/creators', async (req, res, next) => {
  if (isVerifyHost(req)) return shopApp(req, res, next);
  if (!isAdmin(req)) return res.redirect(303, '/admin');
  await ensureSiteCreatorsTable();
  const displayName = String(req.body?.display_name || '').trim();
  const handle = normalizeHandle(req.body?.youtube_handle || '');
  const url = handle ? `https://www.youtube.com/${handle}` : '';
  if (displayName && handle) {
    await db.query('INSERT INTO site_creators (display_name,youtube_channel_url,youtube_handle) VALUES ($1,$2,$3)', [displayName, url, handle]);
  }
  return res.redirect(303, '/admin');
});

app.post('/admin/creators/:id/toggle', async (req, res, next) => {
  if (isVerifyHost(req)) return shopApp(req, res, next);
  if (!isAdmin(req)) return res.redirect(303, '/admin');
  await ensureSiteCreatorsTable();
  await db.query('UPDATE site_creators SET enabled=NOT enabled, updated_at=NOW() WHERE id=$1', [req.params.id]);
  return res.redirect(303, '/admin');
});

app.post('/admin/creators/:id/delete', async (req, res, next) => {
  if (isVerifyHost(req)) return shopApp(req, res, next);
  if (!isAdmin(req)) return res.redirect(303, '/admin');
  await ensureSiteCreatorsTable();
  await db.query('DELETE FROM site_creators WHERE id=$1', [req.params.id]);
  return res.redirect(303, '/admin');
});

app.use(shopApp);

export default app;
