import express from 'express';
import botApp from './web.js';

const app = express();

function shell(title, body, { portal = false } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="Misfit Mafia YouTube Bot verifies eligible YouTube channel memberships and assigns the corresponding Discord roles.">
  <title>${title}</title>
  <style>
    :root{--bg:#070809;--panel:#111317;--panel2:#171a20;--line:#2c3038;--text:#f5f5f5;--muted:#aaaeb7;--red:#b51f2a;--red2:#e13b47;--silver:#c7cad1;--green:#277a4c}
    *{box-sizing:border-box}html{background:var(--bg)}body{margin:0;min-height:100vh;background:radial-gradient(circle at 50% -15%,#321016 0,#0b0c0e 38%,#060708 74%);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    a{color:inherit}.wrap{width:min(1120px,calc(100% - 36px));margin:0 auto}.nav{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:24px 0}.brand{text-decoration:none;display:flex;gap:12px;align-items:center}.seal{width:44px;height:44px;border:1px solid #4a4e57;border-radius:50%;display:grid;place-items:center;font-weight:900;letter-spacing:.08em;background:#101216}.brand strong{display:block;text-transform:uppercase;letter-spacing:.08em}.brand small{display:block;color:var(--muted);margin-top:2px}.navlinks{display:flex;gap:8px;flex-wrap:wrap}.navlinks a,.btn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border-radius:10px;padding:11px 16px;font-weight:750;border:1px solid #444954;background:#20232a}.hero{padding:70px 0 54px;text-align:center}.eyebrow{color:#d7d9de;text-transform:uppercase;letter-spacing:.2em;font-size:12px;font-weight:800}.hero h1{font-size:clamp(44px,8vw,82px);line-height:.94;margin:14px auto 20px;max-width:920px;text-transform:uppercase;letter-spacing:-.045em}.hero p{max-width:780px;margin:0 auto 28px;color:#c3c6cc;font-size:19px;line-height:1.65}.btn.primary{background:linear-gradient(180deg,var(--red2),var(--red));border-color:#e14b55;color:white;padding:14px 24px;font-size:17px;box-shadow:0 12px 35px rgba(150,0,15,.24)}.btn.secondary{background:#20232a;color:white}.btn.green{background:#236c46;border-color:#398b61}.features{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:8px 0 52px}.card{background:linear-gradient(180deg,#15171b,#0f1114);border:1px solid var(--line);border-radius:18px;padding:22px}.card h2,.card h3{margin-top:0}.card p,.legal p,.legal li{color:#b9bdc5;line-height:1.65}.number{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;border:1px solid #565a63;margin-bottom:16px;font-weight:900}.legal{max-width:900px;margin:34px auto 60px}.legal h1{font-size:42px;margin-bottom:8px}.legal h2{margin-top:32px}.legal ul{padding-left:22px}.updated{color:#858a94!important;font-size:14px}.footer{border-top:1px solid #24272e;padding:26px 0 40px;color:#858a94;text-align:center;font-size:13px}.footer a{color:#c8cbd1;margin:0 7px}.portal-title{text-align:center;padding:30px 0 12px}.portal-title h1{font-size:42px;margin:0 0 10px}.portal-title p{color:var(--muted)}.portal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:20px 0 54px}.portal-grid .card{display:flex;flex-direction:column;min-height:250px}.portal-grid .card p{flex:1}.actions{display:flex;gap:8px;flex-wrap:wrap}
    @media(max-width:800px){.features,.portal-grid{grid-template-columns:1fr}.nav{align-items:flex-start;flex-direction:column}.hero{padding-top:42px}.hero h1{font-size:46px}}
  </style>
</head>
<body>
  <div class="wrap">
    <nav class="nav">
      <a class="brand" href="/"><span class="seal">MM</span><span><strong>Misfit Mafia YouTube Bot</strong><small>Membership Verification</small></span></a>
      <div class="navlinks"><a href="/privacy">Privacy</a><a href="/terms">Terms</a>${portal ? '<a href="/">About</a>' : ''}</div>
    </nav>
    ${body}
    <footer class="footer"><strong>Misfit Mafia YouTube Bot</strong><br><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a></footer>
  </div>
</body>
</html>`;
}

app.get('/', (_req, res) => {
  res.status(200).send(shell('Misfit Mafia YouTube Bot', `
    <main>
      <section class="hero">
        <div class="eyebrow">Official Discord membership verification</div>
        <h1>Misfit Mafia YouTube Bot</h1>
        <p>Misfit Mafia YouTube Bot connects a Discord member's linked YouTube identity with participating YouTube creator memberships. It checks whether an eligible paid membership is active and uses the membership level to assign or maintain the correct Discord role. This information page is public and does not require a login.</p>
        <a class="btn primary" href="/portal">Enter Verification Portal</a>
      </section>
      <section class="features">
        <article class="card"><div class="number">1</div><h2>Connect Discord</h2><p>When you choose to verify, Discord identifies your account and the YouTube identity connected to it. No login is required to read this site.</p></article>
        <article class="card"><div class="number">2</div><h2>Check YouTube Membership</h2><p>The bot compares your connected YouTube identity with membership information supplied by participating creator channels.</p></article>
        <article class="card"><div class="number">3</div><h2>Assign the Right Role</h2><p>If an eligible membership is active, the matching Discord role is assigned based on the creator's configured membership levels.</p></article>
      </section>
      <section class="card" style="margin-bottom:54px"><h2>Why Google and YouTube access is used</h2><p>Participating creators authorize their own YouTube channels so the service can read the membership information needed to provide membership verification. Google and YouTube data is used only for this verification and Discord-role functionality. It is not sold or used for advertising.</p><div class="actions"><a class="btn secondary" href="/privacy">Read Privacy Policy</a><a class="btn secondary" href="/terms">Read Terms of Service</a></div></section>
    </main>`));
});

app.get('/portal', (_req, res) => {
  res.status(200).send(shell('Verification Portal — Misfit Mafia YouTube Bot', `
    <section class="portal-title"><div class="eyebrow">Membership desk</div><h1>Verification Portal</h1><p>Choose what you need to do.</p></section>
    <section class="portal-grid">
      <article class="card"><h2>Viewer Verification</h2><p>Verify an active YouTube membership, check your current status, or force a fresh membership check.</p><div class="actions"><a class="btn primary" href="/verify?mode=verify">Verify Membership</a><a class="btn secondary" href="/verify?mode=status">Check Status</a><a class="btn secondary" href="/verify?mode=recheck">Recheck</a></div></article>
      <article class="card"><h2>Creator Connect</h2><p>For participating creators who need to authorize the YouTube channel they own for membership verification.</p><div class="actions"><a class="btn green" href="/creator-connect">Creator Connect</a></div></article>
      <article class="card"><h2>Administration</h2><p>Restricted controls for creator management, membership-level role mappings, grace periods, audits, and synchronization.</p><div class="actions"><a class="btn secondary" href="/admin">Admin Login</a></div></article>
    </section>`, { portal: true }));
});

app.get('/privacy', (_req, res) => {
  res.status(200).send(shell('Privacy Policy — Misfit Mafia YouTube Bot', `
    <main class="legal"><div class="card">
      <h1>Privacy Policy</h1><p class="updated">Effective August 7, 2026</p>
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

app.get('/terms', (_req, res) => {
  res.status(200).send(shell('Terms of Service — Misfit Mafia YouTube Bot', `
    <main class="legal"><div class="card">
      <h1>Terms of Service</h1><p class="updated">Effective August 7, 2026</p>
      <p>These Terms govern use of <strong>Misfit Mafia YouTube Bot</strong>, a service that verifies eligible YouTube memberships and manages corresponding Discord roles.</p>
      <h2>Use of the service</h2><p>You may use the service only for legitimate membership verification and related Discord-role functionality. Do not attempt to bypass access controls, impersonate another user, abuse OAuth flows, interfere with the service, or obtain data you are not authorized to access.</p>
      <h2>Creator authorization</h2><p>Only a creator or an authorized representative should connect a participating YouTube channel. By authorizing a channel, you confirm that you are permitted to grant the requested access for membership-verification purposes.</p>
      <h2>Membership and roles</h2><p>Discord roles are based on information available from connected services and administrator configuration. Membership status, APIs, outages, configuration errors, and grace-period rules may affect when a role is added, changed, or removed.</p>
      <h2>Third-party services</h2><p>The service relies on Google, YouTube, Discord, hosting, and database providers. Your use of those services remains subject to their own terms and policies.</p>
      <h2>Availability</h2><p>The service is provided on an as-available basis. Features may be changed, suspended, or discontinued for maintenance, security, policy compliance, or operational reasons.</p>
      <h2>Privacy</h2><p>How information is processed is described in the <a href="/privacy">Privacy Policy</a>.</p>
      <h2>Changes</h2><p>These Terms may be updated as the service evolves. Continued use after an update constitutes acceptance of the revised Terms.</p>
    </div></main>`));
});

app.use(botApp);

export default app;
