import express from 'express';
import botApp from './web.js';

const app = express();
const APP_NAME = 'Misfit Mafia YouTube Bot';
const MAIN_SITE = 'https://misfitmafia.site';
const VERIFY_SITE = 'https://verify.misfitmafia.site';
const PRINTIFY_STORE = 'https://misfitmafia.printify.me/';

function hostOf(req) {
  return String(req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim().split(':')[0].toLowerCase();
}

function isVerifyHost(req) {
  return hostOf(req) === 'verify.misfitmafia.site';
}

function verifyShell(body, { portal = false } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="application-name" content="${APP_NAME}">
  <meta name="apple-mobile-web-app-title" content="${APP_NAME}">
  <meta property="og:site_name" content="${APP_NAME}">
  <meta property="og:title" content="${APP_NAME}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${VERIFY_SITE}/">
  <meta name="description" content="${APP_NAME} verifies active paid YouTube channel memberships for participating creators and assigns the corresponding Discord membership roles.">
  <link rel="canonical" href="${VERIFY_SITE}/">
  <title>${APP_NAME}</title>
  <style>
    :root{--bg:#070809;--panel:#111317;--line:#2c3038;--text:#f5f5f5;--muted:#aaaeb7;--red:#b51f2a;--red2:#e13b47}
    *{box-sizing:border-box}html{background:var(--bg)}body{margin:0;min-height:100vh;background:radial-gradient(circle at 50% -15%,#321016 0,#0b0c0e 38%,#060708 74%);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    a{color:inherit}.wrap{width:min(1120px,calc(100% - 36px));margin:0 auto}.nav{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:24px 0;border-bottom:1px solid #24272e}.navleft{display:flex;align-items:center;gap:12px;min-width:0}.brand{text-decoration:none;font-size:20px;font-weight:900;white-space:nowrap}.verify-nav{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border-radius:10px;padding:11px 17px;font-weight:850;border:1px solid #e14b55;background:linear-gradient(180deg,var(--red2),var(--red));color:white;box-shadow:0 8px 24px rgba(181,31,42,.18)}.navlinks{display:flex;gap:8px;flex-wrap:wrap}.navlinks a,.btn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border-radius:10px;padding:11px 16px;font-weight:750;border:1px solid #444954;background:#20232a}.hero{padding:58px 0 42px}.hero h1{font-size:clamp(42px,7vw,76px);line-height:1;margin:0 0 22px;max-width:980px}.hero .purpose{max-width:960px;color:#e4e6ea;font-size:21px;line-height:1.65;margin:0 0 20px}.hero .detail{max-width:960px;color:#bfc3ca;font-size:17px;line-height:1.7;margin:0 0 28px}.btn.primary{background:linear-gradient(180deg,var(--red2),var(--red));border-color:#e14b55;color:white;padding:14px 24px;font-size:17px}.btn.secondary{background:#20232a;color:white}.features{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:10px 0 30px}.card{background:linear-gradient(180deg,#15171b,#0f1114);border:1px solid var(--line);border-radius:18px;padding:24px}.card h2,.card h3{margin-top:0}.card p,.legal p,.legal li{color:#b9bdc5;line-height:1.65}.notice{margin:0 0 54px}.notice h2{font-size:26px}.legal{max-width:900px;margin:34px auto 60px}.legal h1{font-size:42px;margin-bottom:8px}.legal h2{margin-top:32px}.legal ul{padding-left:22px}.updated{color:#858a94!important;font-size:14px}.footer{border-top:1px solid #24272e;padding:26px 0 40px;color:#858a94;text-align:center;font-size:13px}.footer a{color:#c8cbd1;margin:0 7px}.portal-title{text-align:center;padding:34px 0 12px}.portal-title h1{font-size:42px;margin:0 0 10px}.portal-title p{color:var(--muted)}.portal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:20px 0 54px}.portal-grid .card{display:flex;flex-direction:column;min-height:250px}.portal-grid .card p{flex:1}.actions{display:flex;gap:8px;flex-wrap:wrap}
    @media(max-width:800px){.features,.portal-grid{grid-template-columns:1fr}.nav{align-items:flex-start;flex-direction:column}.navleft{width:100%}.brand{font-size:17px}.hero{padding-top:38px}.hero h1{font-size:44px}}
  </style>
</head>
<body>
  <div class="wrap">
    <nav class="nav" aria-label="Primary navigation">
      <div class="navleft"><a class="verify-nav" href="/portal">Verify</a><a class="brand" href="/">Misfit Mafia YouTube Bot</a></div>
      <div class="navlinks"><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a>${portal ? '<a href="/">Home</a>' : ''}</div>
    </nav>
    ${body}
    <footer class="footer"><strong>Misfit Mafia YouTube Bot</strong><br><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a></footer>
  </div>
</body>
</html>`;
}

function hubShell(body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="Misfit Mafia — creators, live streams, community and official merch.">
  <meta property="og:site_name" content="Misfit Mafia">
  <meta property="og:title" content="Misfit Mafia">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${MAIN_SITE}/">
  <link rel="canonical" href="${MAIN_SITE}/">
  <title>Misfit Mafia</title>
  <style>
    :root{--bg:#070809;--panel:#111317;--line:#2c3038;--text:#f5f5f5;--muted:#aeb2bb;--red:#b51f2a;--red2:#e13b47}
    *{box-sizing:border-box}html{background:var(--bg);scroll-behavior:smooth}body{margin:0;min-height:100vh;background:radial-gradient(circle at 50% -10%,#341016 0,#0b0c0e 40%,#060708 76%);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit}.wrap{width:min(1180px,calc(100% - 36px));margin:0 auto}.nav{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:20px 0;border-bottom:1px solid #24272e}.navleft,.navright{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.brand{font-size:24px;font-weight:950;text-decoration:none;letter-spacing:.02em}.nav a.btn,.cta{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border-radius:10px;padding:11px 16px;font-weight:800;border:1px solid #444954;background:#20232a}.nav a.verify{background:linear-gradient(180deg,var(--red2),var(--red));border-color:#e14b55}.hero{padding:86px 0 56px}.kicker{text-transform:uppercase;letter-spacing:.2em;color:#c8cbd1;font-size:12px;font-weight:900}.hero h1{font-size:clamp(58px,10vw,112px);line-height:.88;margin:14px 0 22px;letter-spacing:-.055em}.hero p{max-width:780px;color:#c5c8cf;font-size:20px;line-height:1.65}.hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}.cta.primary{background:linear-gradient(180deg,var(--red2),var(--red));border-color:#e14b55}.section{padding:24px 0 58px}.section-head{display:flex;justify-content:space-between;align-items:end;gap:18px;margin-bottom:18px}.section-head h2{font-size:34px;margin:0}.section-head p{color:var(--muted);margin:0}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.card{background:linear-gradient(180deg,#15171b,#0f1114);border:1px solid var(--line);border-radius:18px;padding:24px}.card h3{margin:0 0 10px}.card p{color:#b9bdc5;line-height:1.65}.live-badge{display:inline-block;border:1px solid #e14b55;color:#fff;background:#9f1823;padding:5px 8px;border-radius:999px;font-size:12px;font-weight:900;margin-bottom:14px}.shop-card{display:flex;align-items:center;justify-content:space-between;gap:20px}.shop-copy{max-width:740px}.footer{border-top:1px solid #24272e;padding:28px 0 42px;color:#858a94;font-size:13px;display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap}.footer a{color:#c8cbd1;text-decoration:none;margin-right:12px}
    @media(max-width:800px){.grid{grid-template-columns:1fr}.nav{align-items:flex-start;flex-direction:column}.hero{padding-top:52px}.shop-card{align-items:flex-start;flex-direction:column}}
  </style>
</head>
<body><div class="wrap">
  <nav class="nav" aria-label="Primary navigation">
    <div class="navleft"><a class="btn verify" href="${VERIFY_SITE}/">Verify</a><a class="brand" href="/">Misfit Mafia</a></div>
    <div class="navright"><a class="btn" href="#creators">Creators</a><a class="btn" href="/shop">Shop</a></div>
  </nav>
  ${body}
  <footer class="footer"><div><strong>Misfit Mafia</strong></div><div><a href="${VERIFY_SITE}/privacy">Privacy</a><a href="${VERIFY_SITE}/terms">Terms</a><a href="/shop">Merch</a></div></footer>
</div></body></html>`;
}

app.get('/', (req, res) => {
  if (isVerifyHost(req)) {
    return res.status(200).send(verifyShell(`
      <main>
        <section class="hero">
          <h1>Misfit Mafia YouTube Bot</h1>
          <p class="purpose"><strong>Purpose of this application:</strong> Misfit Mafia YouTube Bot is a Discord membership verification application. It verifies whether a Discord user's connected YouTube account has an active paid channel membership with a participating YouTube creator and then assigns or maintains the Discord role that corresponds to that creator's YouTube membership level.</p>
          <p class="detail">Viewers authenticate with Discord so the application can identify their Discord account and linked YouTube identity. Participating YouTube creators separately authorize their own YouTube channel with Google OAuth so the application can read the creator's channel identity, current membership levels, and current active channel memberships. This information is used only to verify paid memberships and manage the related Discord roles.</p>
        </section>
        <section class="features" aria-label="How Misfit Mafia YouTube Bot works">
          <article class="card"><h2>1. Identify the Discord user</h2><p>The viewer starts verification with Discord. Misfit Mafia YouTube Bot identifies the viewer's Discord account and the YouTube identity linked to that Discord account.</p></article>
          <article class="card"><h2>2. Check YouTube membership</h2><p>The application compares that YouTube identity with membership information from YouTube creator channels that have explicitly authorized Misfit Mafia YouTube Bot.</p></article>
          <article class="card"><h2>3. Manage the Discord role</h2><p>When an active eligible membership is found, the application assigns or maintains the Discord role configured for the matching YouTube membership level.</p></article>
        </section>
        <section class="card notice">
          <h2>Why Misfit Mafia YouTube Bot requests Google and YouTube data</h2>
          <p>Misfit Mafia YouTube Bot requests YouTube access only from participating creators who authorize channels they own or manage. The requested access is used to identify the authorized creator channel, read its available membership levels, read its current active channel members, verify membership status, and determine which configured Discord role applies.</p>
          <p>Google and YouTube user data is not sold, used for advertising, or used to build advertising profiles. See the public Privacy Policy for details about collection, use, storage, sharing, and deletion.</p>
          <div class="actions"><a class="btn secondary" href="/privacy">Privacy Policy</a><a class="btn secondary" href="/terms">Terms of Service</a></div>
        </section>
      </main>`));
  }

  return res.status(200).send(hubShell(`
    <main>
      <section class="hero">
        <div class="kicker">Creators • Community • Live</div>
        <h1>MISFIT<br>MAFIA</h1>
        <p>The home for Misfit Mafia creators, live streams, community updates and official merch. Catch who is live, see what is coming up next, and support the crew.</p>
        <div class="hero-actions"><a class="cta primary" href="#creators">Watch the Mafia</a><a class="cta" href="/shop">Shop Merch</a></div>
      </section>

      <section class="section" id="creators">
        <div class="section-head"><div><h2>Creators & Live</h2><p>Live and scheduled YouTube streams will live here.</p></div></div>
        <div class="grid">
          <article class="card"><span class="live-badge">CREATOR</span><h3>Misfit Mafia</h3><p>This card is ready to show the channel's current live stream, next scheduled stream, or latest upload.</p></article>
          <article class="card"><span class="live-badge">CREATOR</span><h3>Scooter</h3><p>This card is ready to show the channel's current live stream, next scheduled stream, or latest upload.</p></article>
          <article class="card"><span class="live-badge">MORE COMING</span><h3>Misfit Creators</h3><p>Connected creators can be added here without changing or removing their verification data.</p></article>
        </div>
      </section>

      <section class="section">
        <article class="card shop-card">
          <div class="shop-copy"><div class="kicker">Official Merch</div><h2>Misfit Mafia Store</h2><p>Browse official Misfit Mafia merch. Product browsing starts here and secure checkout and fulfillment are handled by Printify.</p></div>
          <a class="cta primary" href="/shop">Shop Now</a>
        </article>
      </section>
    </main>`));
});

app.get('/portal', (req, res) => {
  if (!isVerifyHost(req)) return res.redirect(302, `${VERIFY_SITE}/portal`);
  res.status(200).send(verifyShell(`
    <section class="portal-title"><h1>Verify</h1><p>All Misfit Mafia YouTube Bot verification tools are kept here.</p></section>
    <section class="portal-grid">
      <article class="card"><h2>Viewer Verification</h2><p>Verify an active YouTube membership, check your current status, or force a fresh membership check.</p><div class="actions"><a class="btn primary" href="/verify?mode=verify">Verify Membership</a><a class="btn secondary" href="/verify?mode=status">Check Status</a><a class="btn secondary" href="/verify?mode=recheck">Recheck</a></div></article>
      <article class="card"><h2>Creator Connect</h2><p>Participating YouTube creators can authorize the channel they own or manage for membership verification.</p><div class="actions"><a class="btn primary" href="/creator-connect">Creator Connect</a></div></article>
      <article class="card"><h2>Administration</h2><p>Restricted controls for creator management, membership-level role mappings, grace periods, audits, and synchronization.</p><div class="actions"><a class="btn secondary" href="/admin">Admin Login</a></div></article>
    </section>`, { portal: true }));
});

app.get(['/shop','/store','/merch'], (req, res) => {
  if (isVerifyHost(req)) return res.redirect(302, `${MAIN_SITE}/shop`);
  return res.redirect(302, PRINTIFY_STORE);
});

app.get('/privacy', (req, res, next) => {
  if (!isVerifyHost(req)) return res.redirect(302, `${VERIFY_SITE}/privacy`);
  res.status(200).send(verifyShell(`
    <main class="legal"><div class="card">
      <h1>Misfit Mafia YouTube Bot Privacy Policy</h1><p class="updated">Effective August 7, 2026</p>
      <p>This Privacy Policy explains how <strong>Misfit Mafia YouTube Bot</strong> processes information when users verify YouTube memberships for Discord roles and when participating YouTube creators authorize their channels.</p>
      <h2>Information we process</h2><ul><li>Discord user identifiers, usernames or display names, and the YouTube identity connected to the Discord account when a user chooses to verify.</li><li>YouTube channel identifiers, channel names, membership levels, and current membership information needed to determine whether an eligible membership is active and which Discord role applies.</li><li>OAuth access and refresh tokens for participating creator channels when required to perform ongoing membership synchronization.</li><li>Operational records such as role mappings, verification status, grace-period records, and connection timestamps.</li></ul>
      <h2>How information is used</h2><p>Information is used to authenticate accounts, connect Discord users with their linked YouTube identity, determine eligible membership status and level, assign or remove corresponding Discord roles, maintain grace periods, synchronize memberships, troubleshoot the service, and protect administrative access.</p>
      <h2>Google API data</h2><p>Misfit Mafia YouTube Bot's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.</p><p>Google and YouTube data obtained through OAuth is not sold, used for advertising, or used to build advertising profiles. It is used only for the membership-verification and Discord-role functionality described on this website.</p>
      <h2>Sharing</h2><p>We do not sell personal information. Information may be processed by infrastructure providers necessary to operate the application and database. Relevant verification results are used within the connected Discord community to assign or remove roles. Google user data is not disclosed to unrelated third parties for advertising or marketing.</p>
      <h2>Storage and security</h2><p>Account links, creator authorization records, membership status, and role mappings may be stored while needed to operate the service. Reasonable technical and administrative safeguards are used to protect stored information.</p>
      <h2>Data deletion</h2><p>Users may request deletion of stored account-link or verification records by contacting the Misfit Mafia server administration. Creators may disconnect their channel and revoke Google OAuth access through their Google Account permissions.</p>
      <h2>Changes</h2><p>This policy may be updated as the service changes. The effective date above will be updated when material revisions are made.</p>
    </div></main>`));
});

app.get('/terms', (req, res) => {
  if (!isVerifyHost(req)) return res.redirect(302, `${VERIFY_SITE}/terms`);
  res.status(200).send(verifyShell(`
    <main class="legal"><div class="card">
      <h1>Misfit Mafia YouTube Bot Terms of Service</h1><p class="updated">Effective August 7, 2026</p>
      <p>These Terms govern use of <strong>Misfit Mafia YouTube Bot</strong>, a service that verifies eligible YouTube memberships and manages corresponding Discord roles.</p>
      <h2>Use of the service</h2><p>You may use the service only for legitimate membership verification and related Discord-role functionality. Do not attempt to bypass access controls, impersonate another user, abuse OAuth flows, interfere with the service, or obtain data you are not authorized to access.</p>
      <h2>Creator authorization</h2><p>Only a creator or an authorized representative should connect a participating YouTube channel. By authorizing a channel, you confirm that you are permitted to grant the requested access for membership-verification purposes.</p>
      <h2>Membership and roles</h2><p>Discord roles are based on information available from connected services and administrator configuration. Membership status, APIs, outages, configuration errors, and grace-period rules may affect when a role is added, changed, or removed.</p>
      <h2>Third-party services</h2><p>The service relies on Google, YouTube, Discord, hosting, and database providers. Your use of those services remains subject to their own terms and policies.</p>
      <h2>Availability</h2><p>The service is provided on an as-available basis. Features may be changed, suspended, or discontinued for maintenance, security, policy compliance, or operational reasons.</p>
      <h2>Privacy</h2><p>How information is processed is described in the <a href="/privacy">Misfit Mafia YouTube Bot Privacy Policy</a>.</p>
      <h2>Changes</h2><p>These Terms may be updated as the service evolves. Continued use after an update constitutes acceptance of the revised Terms.</p>
    </div></main>`));
});

app.use(botApp);

export default app;
