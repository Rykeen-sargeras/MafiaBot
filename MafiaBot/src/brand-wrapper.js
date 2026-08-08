import express from 'express';
import { fileURLToPath } from 'node:url';
import adminApp from './admin-wrapper.js';

const app = express();
const VERIFY_HOST = 'verify.misfitmafia.site';
const BG = '/brand-assets/pinstripe-background.png';
const LOGO = '/brand-assets/misfit-mafia-logo.png';
const ASSET_DIRECTORY = fileURLToPath(new URL('./assets/', import.meta.url));

function hostOf(req) {
  return String(req.get('x-forwarded-host') || req.get('host') || '')
    .split(',')[0]
    .trim()
    .split(':')[0]
    .toLowerCase();
}

app.use('/brand-assets', express.static(ASSET_DIRECTORY, {
  immutable: true,
  maxAge: '7d',
}));

app.use((req, res, next) => {
  if (hostOf(req) === VERIFY_HOST) return next();

  const originalSend = res.send.bind(res);
  res.send = body => {
    if (typeof body !== 'string' || !body.includes('</head>')) return originalSend(body);

    const css = `<style id="mm-global-branding">
      :root{--mm-red:#e21d2d;--mm-silver:#c7cbd2}
      html,body{min-height:100%!important}
      body{background-image:linear-gradient(rgba(0,0,0,.48),rgba(0,0,0,.66)),url('${BG}')!important;background-size:cover!important;background-position:center top!important;background-attachment:fixed!important;background-repeat:no-repeat!important;color:var(--mm-silver)!important}
      body:before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 8%,rgba(226,29,45,.08),transparent 34%);z-index:-1}
      h1,h2,h3,.brand,.kicker{color:var(--mm-red)!important}
      p,.muted,.small,label,.footer{color:var(--mm-silver)!important}
      .card,.panel,.product,.notice,.empty{background:rgba(10,11,14,.90)!important;backdrop-filter:blur(5px);border-color:rgba(199,203,210,.20)!important}
      .nav{background:rgba(4,5,7,.72)!important;backdrop-filter:blur(7px);padding-left:14px!important;padding-right:14px!important;border-radius:0 0 14px 14px}
      .mm-brand-logo{display:block;width:150px;height:auto;object-fit:contain;filter:drop-shadow(0 8px 18px rgba(0,0,0,.55))}
      .mm-hero-logo{display:block;width:min(515px,82vw);height:auto;margin:8px auto 26px;filter:drop-shadow(0 16px 30px rgba(0,0,0,.60))}
      .hero{text-align:center}
      .hero p{margin-left:auto!important;margin-right:auto!important}
      @media(max-width:700px){.mm-brand-logo{width:112px}.mm-hero-logo{width:min(360px,88vw)}}
    </style>`;

    let branded = body.replace('</head>', `${css}</head>`);
    const logoLink = `<a class="brand mm-logo-link" href="/"><img class="mm-brand-logo" src="${LOGO}" alt="Misfit Mafia"></a>`;
    branded = branded
      .replace(/<a class="brand" href="\/">MISFIT MAFIA<\/a>/g, logoLink)
      .replace(/<a class="brand" href="\/">Misfit Mafia<\/a>/g, logoLink);

    if (req.path === '/' && branded.includes('<main>')) {
      branded = branded.replace('<main>', `<main><div class="mm-logo-hero-wrap"><img class="mm-hero-logo" src="${LOGO}" alt="Misfit Mafia logo"></div>`);
    }

    return originalSend(branded);
  };

  next();
});

app.use(adminApp);

export default app;
