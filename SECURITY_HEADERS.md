# Security headers

This is a static site. Whether you can *enforce* HTTP security headers depends on the host.

## Included (host-supported) config

- [`_headers`](_headers): Works on **Netlify** and **Cloudflare Pages** (and some other static hosts that support this convention).

It sets a baseline of:
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy` (CSP)
- `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- Framing protections (`X-Frame-Options`, `frame-ancestors`)

## Hosting notes

### GitHub Pages
GitHub Pages does not let you set arbitrary response headers for a custom domain.

Options:
- Put the site behind **Cloudflare** (recommended) and configure headers at the edge.
- Use a host that supports headers natively (Netlify/Cloudflare Pages).

### CSP maintenance
The CSP in [`_headers`](_headers) allows:
- Font Awesome CSS from `https://cdnjs.cloudflare.com`
- Google Analytics/Tag Manager scripts and beacons

If you add new third-party scripts/styles, you must update CSP accordingly.
