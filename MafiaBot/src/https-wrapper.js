import express from 'express';
import brandedApp from './brand-wrapper.js';

const app = express();
const VERIFY_HOST = 'verify.misfitmafia.site';

function hostOf(req) {
  return String(req.get('x-forwarded-host') || req.get('host') || '')
    .split(',')[0]
    .trim()
    .split(':')[0]
    .toLowerCase();
}

app.use((req, res, next) => {
  const host = hostOf(req);
  const forwardedProto = String(req.get('x-forwarded-proto') || '').split(',')[0].trim().toLowerCase();

  // Railway terminates TLS at the proxy and supplies x-forwarded-proto.
  // Force the public main site onto HTTPS. Leave the verification host's
  // existing OAuth behavior untouched.
  if (host !== VERIFY_HOST && host.endsWith('misfitmafia.site') && forwardedProto === 'http') {
    return res.redirect(301, `https://${host}${req.originalUrl || '/'}`);
  }

  next();
});

app.use(brandedApp);

export default app;
