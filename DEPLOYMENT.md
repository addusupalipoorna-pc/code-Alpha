Deployment checklist — Code Alpha (frontend)

Overview

- Build static frontend with Vite and host on CDN-backed static hosting (Vercel, Netlify, Azure Static Web Apps, or S3 + CloudFront).

Build & verify (local)

1. Install deps: from `frontend/` run:
   - `npm ci`
2. Build production assets:
   - `npm run build` (configured in `frontend/package.json` to run `vite build`)
3. Preview locally:
   - `npm run preview` (served on `localhost:4174` by default)
4. Run Lighthouse (headed) for final checks:
   - `npx lighthouse http://localhost:4174 --view`

Hosting recommendations

- Preferred: Vercel or Netlify for easiest CI/CD and PR previews.
  - Both auto-detect Vite builds and serve from global CDN with HTTPS.
- Alternative: Azure Static Web Apps — integrates with GitHub Actions and supports custom routes to backend (API folder).
- Manual: S3 + CloudFront with `index.html` fallback for SPAs.

CI/CD

- GitHub Actions recommended; pipeline steps:
  - Checkout, Node setup (use Node 18+), `npm ci`, `npm run build`, `actions/upload-artifact` artifact for diagnostics.
  - On successful build, deploy with `vercel --prod` or `az staticwebapp upload` or `aws s3 sync` + CloudFront invalidation.

Performance & caching

- Serve compressed assets: enable Brotli + gzip on CDN or server.
- Set long cache TTLs for hashed assets (`/assets/*.js`, `/assets/*.css`) and short TTL for `index.html` (e.g., 60s) to allow fast cache invalidation.
- Use `Cache-Control: public, max-age=31536000, immutable` for hashed assets.

Asset optimizations

- Ensure the `dist/` contains manually chunked vendor files (Vite `manualChunks` already configured).
- Reduce Three.js texture sizes (use 1024 or 512 where acceptable) and lazy-load heavy components.
- Convert large raster imagery (textures, hero images) to WebP/AVIF and serve responsive sizes.

Security & best practices

- Serve over HTTPS (platforms above handle this automatically).
- Add `Content-Security-Policy` headers on hosting or CDN edge.
- Ensure `X-Frame-Options`, `Referrer-Policy`, and `Strict-Transport-Security` headers are set.
- Avoid embedding secrets in client code; store env-only secrets in server/backend.

Monitoring & Error reporting

- Add Sentry or similar for front-end JS errors (minified source maps upload during CI).
- Add basic uptime and synthetic checks (Pingdom, UptimeRobot).

Optional enhancements

- Add a small Service Worker (Workbox) for offline caching of static assets and faster repeat visits.
- Use image CDN (Cloudinary, Imgix) for on-the-fly responsive images + format conversion.

Rollback & staging

- Keep a `staging` branch with preview deploys enabled.
- Test Lighthouse and core user flows on staging before `main` merge.

Commands summary (frontend):

- Install: `cd frontend && npm ci`
- Build: `cd frontend && npm run build`
- Preview: `cd frontend && npm run preview`

Contact & notes

- Backend API is in `backend/` (Flask). When deploying frontend to a different origin, ensure CORS and API_BASE_URL env var are configured.
