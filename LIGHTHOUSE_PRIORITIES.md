Lighthouse prioritized fixes (summary)

Top priorities (performance)

- Reduce initial JS payloads
  - Why: large vendor/three/jspdf chunks slow FCP and TTI.
  - Fixes:
    - Keep lazy-loading for `ThreeGlobe` (done: `LazyLoadGlobe.jsx`) and reduce geometry/texture. Edited: `frontend/src/components/ThreeGlobe.jsx` (reduced sphere segments and texture to 1024).
    - Ensure `jspdf`, `html2canvas` and `gsap` are imported dynamically where used. Files: `frontend/src/components/TranslationWorkspace.jsx` (jspdf dynamic import), `frontend/src/components/GSAPEffects.jsx` (gsap dynamic import).
    - Consider splitting `three` into a separate async chunk (Vite `manualChunks` already configured in `frontend/vite.config.js`).
- Defer non-critical scripts and animations until after FCP
  - Delay auto-playing/auto-rotating visual effects until after first paint or user interaction.
  - Where: `GSAPEffects.jsx`, `ThreeGlobe.jsx` (controls.autoRotate enabled; keep, but lazy-load until visible).

Accessibility (high impact, quick wins)

- Add a skip link and landmarks (done)
  - Files: `frontend/src/App.jsx` (skip link), `frontend/src/pages/HomePage.jsx` (`main` now has `id="main-content"` and `role="main"`).
- Logo alt text fixed
  - File: `frontend/src/components/HeroSection.jsx` (alt updated to "Code Alpha logo").
- Testimonials region labeled
  - File: `frontend/src/components/Testimonials.jsx` (role="region" aria-label added).
- Contrast and focus states
  - Recommendation: run Lighthouse in headed mode and use `axe` or browser devtools to identify failing contrast ratios; adjust `--hero-sub-l` or token values in `frontend/src/index.css` for low-contrast text.

Best practices / Production readiness

- Serve assets with Brotli + gzip via CDN; set long TTLs for hashed assets and short TTL for `index.html`.
- Add security headers (CSP, HSTS). See `DEPLOYMENT.md` for deploy steps.
- Upload source maps to Sentry if enabling error tracking during CI.

Notes about Lighthouse run

- Current Lighthouse run returned `NO_FCP` (headless paint failure). Re-run in headed mode or while the machine is unlocked with `npx lighthouse http://localhost:4174 --view` for accurate metrics.

Suggested next steps (ordered)

1. Re-run Lighthouse in headed mode and capture results.
2. Further reduce Three.js payload (remove unused modules, lower texture to 512 if acceptable).
3. Audit remaining third-party libs for dynamic import opportunities.
4. Implement image format conversions (AVIF/WebP) and responsive image sizes.
5. Apply color-contrast fixes discovered by Lighthouse/axe.

If you want, I can:

- Re-run Lighthouse in headed mode and parse the new report.
- Further reduce ThreeGlobe (texture->512, remove particles) and re-build.
