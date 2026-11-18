# Description

- User should be able to add the web-app to the phone screen.

# Implementation Requirements

- Follow Vite docs for adding PWA to SvelteKit. https://vite-pwa-org.netlify.app/frameworks/sveltekit.html
  - FIRST check if the implementation already exists and IDENTIFY what is missing.
- Create (if not existing) PWA web manifest for the app to be downloadable on phones.

## Implementation Details (Generated)

### Analysis: what already existed vs. what was missing

- **Already existed:** custom service worker `src/service-worker/index.ts` — precaches immutable build assets + everything in `static/`, network-first with cache fallback. SvelteKit automatically bundles and registers `src/service-worker/index.ts` in production builds, so no registration code is needed. This covers the TODO.md "caching for JS and HTML files" item.
- **Actually missing for "Add to Home Screen":** the web app manifest, PNG install icons, and `<head>` meta tags. `@vite-pwa/sveltekit` is not installed and is not needed — adding it would double-register a service worker on top of the existing one.

### Decisions (user-confirmed)

- **Approach: minimal.** Keep the existing hand-rolled service worker; add only `static/manifest.webmanifest` + icons + `app.html` tags. Do NOT migrate to `@vite-pwa/sveltekit` (workbox/`injectManifest` adds build complexity and double-registration risk with `adapter-cloudflare` for no gain — the SW already exists and precaches all of `static/`, which will include the manifest and icons automatically).
- **Icons:** generate branded PNGs into `static/icons/` — Ukrainian blue/yellow rounded square with a "UB" monogram (matching the "UkrBank 🇺🇦" header): `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` (180×180).
- **Manifest values:** `name`/`short_name`: "UkrBank", `start_url`: "/", `scope`: "/", `display`: "standalone", `theme_color`: "#6366f1" (indigo-500, matches the layout gradient), `background_color`: "#030712" (gray-950 splash, matches dark gradient), icons: 192 + 512 (`purpose: "any"`) and 512 maskable (`purpose: "maskable"`).
- **iOS:** include `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, and an `apple-touch-icon` link in `src/app.html` (Safari ignores manifest icons for home-screen installs).

### Files to create / change

1. `static/icons/icon-192.png`, `static/icons/icon-512.png`, `static/icons/icon-maskable-512.png`, `static/icons/apple-touch-icon.png` — generated branded icons.
2. `static/manifest.webmanifest` — new manifest with the values above.
3. `src/app.html` — add to `<head>`: `<link rel="manifest" href="/manifest.webmanifest" />`, `<meta name="theme-color" content="#6366f1" />`, `<meta name="mobile-web-app-capable" content="yes" />`, `<meta name="apple-mobile-web-app-capable" content="yes" />`, `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`, `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />`.
4. `src/routes/+layout.svelte` — point the favicon at the new PNG (`/icons/icon-192.png`) instead of the default Svelte `favicon.svg`.
5. Service worker: **no changes** — manifest/icons live in `static/`, so they are precached via `$app/manifest` `assets` and registration stays automatic.

### Validation

- `npm run build` → verify `manifest.webmanifest` and `icons/*.png` are emitted and served at `/manifest.webmanifest`, `/icons/...`.
- `npx prettier --check` on changed files; `npx svelte-check` → no new errors in `src/`.
- Manual check: Chrome DevTools → Application → Manifest shows name/icons/`display: standalone` and an install prompt appears; service worker registered; on iOS, Share → "Add to Home Screen" uses the apple-touch-icon.

### Out-of-scope observation (flagged, not fixed here)

- App code fetches mocks from `/src/lib/mocks/*.json`, a dev-only path; production only serves `static/mocks/`. First-run `initializeNewUser()` would 404 in a production/offline PWA. Separate fix: change fetch paths to `/mocks/...`.
