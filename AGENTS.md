# Unga Market — Base44 Dev Environment

## Architecture
Single Vite + React/TypeScript frontend (`src/`) with an Express API backend (`server.js`).
- `server.js` — Express API server with in-memory data (orders, products, settings). Also serves static files in production.
- `vite.config.ts` — Vite dev server on port 3000, proxies `/api` to the Express server (port 3001 via `PORT` env var).
- `products.js` — static FMCG product catalog imported by the server.

## Dev Setup (docker-compose.base44.yml)
One container runs both processes:
- `node --watch server.js` on port 3001 (backend with live reload via Node's --watch)
- `npx vite` on port 3000 (frontend with HMR)
- `npm install` runs at container startup (deps installed in-container, not bind-mounted)

## Key Changes for Base44
- `server.js`: PORT reads from `process.env.PORT` (defaults to 3000) so it can run on 3001 alongside Vite.
- `vite.config.ts`: proxy target configurable via `API_PROXY_TARGET` env var; `allowedHosts: true` for preview hostname.

## Secrets
- `GEMINI_API_KEY` (optional): Google Gemini API key for AI product image generation. Without it, the app falls back to generated SVG packshots. Get one at https://aistudio.google.com/apikey
- All other env vars (STORE_EMAIL, UPI_VPA, etc.) have sensible defaults in `server.js` and `.env.base44-defaults`.

## Verification
- `curl -sf http://localhost:3000/` returns the Vite-served HTML
- `curl -sf http://localhost:3000/api/config` returns store config JSON (confirms API proxy)
- Frontend edits hot-reload via Vite HMR; backend edits restart via `node --watch`
