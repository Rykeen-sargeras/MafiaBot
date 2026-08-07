import express from 'express';

const publicSite = express.Router();

function shell(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="Misfit Mafia YouTube Bot verifies YouTube channel memberships and helps assign matching Discord roles.">
  <title>${title}</title>
  <style>
    :root{--bg:#070708;--panel:#111216;--panel2:#17181d;--line:#30323a;--text:#f4f4f5;--muted:#a4a7ae;--red:#b11f2b;--red2:#d32d3a;--silver:#d3d5da}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 50% -15%,#301015 0,#0b0b0d 38%,#060607 75%);color:var(--text);font-family:Inter,Arial,sans-serif;min-height:100vh}
    a{color:inherit}.wrap{max-width:1080px;margin:0 auto;padding:28px 18px 54px}.nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-bottom:28px}.brand{text-decoration:none;font-weight:900;letter-spacing:.06em;text-transform:uppercase}.brand small{display:block;color:var(--muted);font-size:12px;margin-top:4px;letter-spacing:.03em;text-transform:none}.links{display:flex;gap:8px;flex-wrap:wrap}.btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 17px;border-radius:10px;text-decoration:none;font-weight:800;border:1px solid #c53b45;background:linear-gradient(180deg,var(--red2),var(--red));color:#fff}.btn.gray{background:#24262c;border-color:#444750}.btn.ghost{background:transparent;border-color:#444750}.hero{border:1px solid #393b43;border-radius:24px;padding:48px;background:linear-gradient(145deg,rgba(177,31,43,.18),rgba(17,18,22,.97) 45%,rgba(8,8,10,.99));margin:36px 0 22px;position:relative;overflow:hidden}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.2em;color:var(--silver);font-weight:800}.hero h1{font-size:clamp(38px,7vw,72px);line-height:.96;margin:12px 0 18px;text-transform:uppercase;letter-spacing:-.035em}.hero p{max-width:770px;color:#c8c9cd;font-size:18px;line-height:1.65}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:26px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.card{background:linear-gradient(180deg,#16171b,#101115);border:1px solid var(--line);border-radius:18px;padding:22px}.card h2{margin-top:0}.card p,.legal p,.legal li{color:#c5c7cc;line-height:1.65}.legal{max-width:900px;margin:20px auto}.legal h1{font-size:42px}.legal h2{margin-top:30px}.footer{text-align:center;color:#777b83;font-size:13px;padding:34px 0 8px}.footer a{color:#c5c7cc;margin:0 7px}@media(max-width:800px){.grid{grid-template-columns:1fr}.nav{align-items:flex-start;flex-direction:column}.hero{padding:30px}}
  </style>
</head>
<body><div class="wrap">
  <nav class="nav">
    <a class="brand" href="/">Misfit Mafia YouTube Bot<small>YouTube membership verification for Discord</small></a>
    <div class="links"><a class="btn ghost" href="/privacy">Privacy</a><a class="btn ghost" href="/terms">Terms</a></div>
  </nav>
  ${body}
  <footer class="footer"><strong>Misfit Mafia YouTube Bot</strong><br><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a></footer>
</div></body></html>`;
}

publicSite.get('/', (_req, res) => {
  res.status(200).send(shell('Misfit Mafia YouTube Bot', `
    <section class="hero">
      <div class="eyebrow">Official membership verification</div>
      <h1>Misfit Mafia YouTube Bot</h1>
      <p><strong>Misfit Mafia YouTube Bot</strong> is a Discord membership-verification service for participating YouTube creators and their communities. It connects a Discord member's linked YouTube identity, checks whether that YouTube account has an eligible active channel membership, identifies the membership level, and helps assign or maintain the matching Discord role.</p>
      <p>This homepage is public and can be viewed without signing in. Authentication is only requested after you choose to enter the verification portal or connect an authorized creator account.</p>
      <div class="actions"><a class="btn" href="/portal">Enter Verification Portal</a><a class="btn ghost" href="/privacy">Read Privacy Policy</a></div>
    </section>
    <section class="grid">
      <article class="card"><h2>For viewers</h2><p>Verify an eligible YouTube membership using the YouTube identity connected to your Discord account, then receive the Discord role that corresponds to your membership level.</p></article>
      <article class="card"><h2>For creators</h2><p>Participating creators can authorize the YouTube channel they own so the service can read membership levels and current member information required for verification.</p></article>
      <article class="card"><h2>For Discord communities</h2><p>The bot supports role mapping, membership rechecks, grace periods, scheduled audits, and automatic role synchronization for connected communities.</p></article>
    </section>`));
});

publicSite.get('/portal', (_req, res) => {
  res.status(200).send(shell('Verification Portal — Misfit Mafia YouTube Bot', `
    <section class="hero"><div class="eyebrow">Verification portal</div><h1>Choose your action</h1><p>Use the options below to verify or check a membership. Creator and administrator areas are separate and may require authentication.</p></section>
    <section class="grid">
      <article class="card"><h2>Verify Membership</h2><p>Connect Discord and check the linked YouTube identity for an eligible membership.</p><a class="btn" href="/verify?mode=verify">Verify Membership</a></article>
      <article class="card"><h2>Check Status</h2><p>Review the membership status currently associated with your Discord and YouTube connection.</p><a class="btn gray" href="/verify?mode=status">Check Status</a></article>
      <article class="card"><h2>Creator Connect</h2><p>For participating YouTube creators who have been asked to connect their channel.</p><a class="btn gray" href="/creator-connect">Creator Connect</a></article>
    </section>`));
});

publicSite.get('/privacy', (_req, res) => {
  res.status(200).send(shell('Privacy Policy — Misfit Mafia YouTube Bot', `
    <main class="legal"><div class="card">
      <h1>Privacy Policy</h1><p><strong>Effective:</strong> August 7, 2026</p>
      <p>This Privacy Policy explains how Misfit Mafia YouTube Bot processes information when users verify YouTube memberships for Discord roles and when participating creators connect their YouTube channels.</p>
      <h2>Information processed</h2>
      <ul><li>Discord user identifiers, username/display name, and connected YouTube identity when a user chooses to verify.</li><li>YouTube channel identifiers, channel names, membership levels, and current membership information needed to determine eligibility and the applicable Discord role.</li><li>For participating creators, Google OAuth authorization information and tokens necessary to perform membership synchronization.</li><li>Operational records such as role mappings, verification status, grace-period dates, connection timestamps, and audit information.</li></ul>
      <h2>How information is used</h2><p>Information is used only to authenticate users, connect Discord and YouTube identities, determine eligible membership status and level, assign or remove corresponding Discord roles, perform synchronization and audits, maintain grace periods, troubleshoot the service, and protect administrative functions.</p>
      <h2>Google API Services data</h2><p>Misfit Mafia YouTube Bot's use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. Google/YouTube data obtained through OAuth is not sold or used for advertising.</p>
      <h2>Sharing</h2><p>Personal information is not sold. Information may be processed by infrastructure providers needed to host the application and database. Verification results may be used within the connected Discord community solely to manage membership-related roles.</p>
      <h2>Retention and security</h2><p>Information is retained only as needed to operate the service, maintain active account connections, support membership grace periods, and satisfy legitimate security or troubleshooting needs. Reasonable technical safeguards are used to protect stored information and OAuth credentials.</p>
      <h2>Revoking access</h2><p>Users and creators may revoke Google access from their Google Account permissions. Disconnecting the service may prevent future membership verification or synchronization.</p>
      <h2>Contact</h2><p>Questions about this policy can be directed to the Misfit Mafia YouTube Bot administrator through the connected Misfit Mafia Discord community.</p>
      <p><a class="btn gray" href="/">Back to Homepage</a></p>
    </div></main>`));
});

publicSite.get('/terms', (_req, res) => {
  res.status(200).send(shell('Terms of Service — Misfit Mafia YouTube Bot', `
    <main class="legal"><div class="card">
      <h1>Terms of Service</h1><p><strong>Effective:</strong> August 7, 2026</p>
      <p>These Terms govern use of Misfit Mafia YouTube Bot, a service that verifies eligible YouTube channel memberships and assists with membership-related Discord role management.</p>
      <h2>Purpose</h2><p>The service is intended only for participating Discord communities and YouTube creators that choose to use it for membership verification and role synchronization.</p>
      <h2>Account authorization</h2><p>You may only connect accounts and YouTube channels that you are authorized to use. Creators must authorize channels they own or are authorized to administer.</p>
      <h2>Service availability</h2><p>Verification results depend on information made available by Discord, Google, YouTube, and connected creators. The service may be interrupted, delayed, changed, or unavailable at times.</p>
      <h2>Acceptable use</h2><p>You may not attempt to bypass authentication, gain unauthorized administrative access, misuse OAuth authorization, interfere with the service, or use the service for unlawful purposes.</p>
      <h2>Membership and role decisions</h2><p>Discord roles are assigned based on available membership information and configured role mappings. A creator or community administrator may change membership requirements, role mappings, or grace periods.</p>
      <h2>Changes</h2><p>These Terms may be updated as the service changes. Continued use after an update constitutes acceptance of the revised Terms.</p>
      <p><a class="btn gray" href="/">Back to Homepage</a></p>
    </div></main>`));
});

export default publicSite;
