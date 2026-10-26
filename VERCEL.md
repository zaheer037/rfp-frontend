# Deploy the frontend to Vercel with a Railway backend

Backend source: https://github.com/zaheer037/rfp-intelligence-

## 1. Prepare Railway

Deploy the backend image and follow its Railway guide: a persistent `/var/data` volume, the required volume UID setting, `RFP_API_KEY`, `GROQ_API_KEY`, one replica, and `/health/ready` healthcheck. Generate a Railway public HTTPS domain and wait for readiness.

A new backend volume has no indexes. Index Bid1 and Bid2 sequentially through the backend API, or use the frontend's **Bid library → Add a bid → Use an existing backend folder** after deployment. Use `Bid1` as identifier/folder, then `Bid2`. Extract each record to populate all structured-record and comparison views. Indexing/search do not need Groq; extraction/Q&A do.

## 2. Import this repository

Import `zaheer037/rfp-frontend` into Vercel with:

| Setting | Value |
| --- | --- |
| Root Directory | Repository root (`./`) |
| Framework preset | Vite |
| Node.js | 22.x (`package.json` pins the major) |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |

`api/index.ts` is the server-side gateway. The supplied `vercel.json` routes `/api/*` to it and other application routes to the React entry point. Deploy the entire repository, including `server/` and `api/`; uploading only `dist/` omits login and the backend gateway.

## 3. Configure environment variables

Set the following in Vercel's project environment settings for the environments you intend to use:

| Variable | Value | Visibility |
| --- | --- | --- |
| `BACKEND_URL` | Railway public backend origin, e.g. `https://your-backend.up.railway.app` | Server only |
| `BACKEND_API_KEY` | Exact same value as Railway's `RFP_API_KEY` | Secret, server only |
| `SESSION_SECRET` | A new random secret of at least 32 characters | Secret, server only |
| `DEMO_EMAIL` | `admin@gmail.com` (also the default) | Server only; demo identity is public |
| `DEMO_PASSWORD` | `admin` (also the default) | Server only; intentionally public demo password |
| `VITE_SITE_URL` | Frontend's final `https://...vercel.app` or custom-domain origin | Public metadata |

Use the backend's HTTPS origin without `/api`, a search path, or a trailing subpath. Do not put Groq credentials in Vercel; they stay in Railway. Do not add a `VITE_` prefix to backend keys or session secrets. Only `VITE_SITE_URL` is intended for the browser build.

Generate a session secret locally with `openssl rand -hex 32`; copy the result directly into Vercel. Never commit a real `.env`. Set the frontend domain once known and redeploy to regenerate canonical metadata/sitemap. Redeploy after changing project environment variables.

The browser talks to its own `/api`; the Node gateway attaches `X-API-Key` to allowlisted backend routes. Browser-to-Railway CORS configuration is unnecessary for this architecture. Login uses an eight-hour signed HttpOnly, SameSite=Lax cookie with Secure enabled in production. It is a shared demo account and workspace, without per-user tenant isolation.

## 4. Verify the deployed connection

1. Open `/api/health`: this checks the frontend function only, not Railway connectivity.
2. Open `/app` in a private browser window; it should redirect to `/login`.
3. Sign in with **admin@gmail.com / admin**. Chat opens first; an idle backend reports zero active agents.
4. Open **Bid library**; the backend connection should display its actual collections, or an empty state on a fresh volume. Add/index the bundled bids if necessary.
5. Search Bid2 for a laptop specification, open a citation and its source PDF.
6. Ask a question and poll it to completion; verify source citations and the live activity count. Extraction runs on Railway, while Vercel submits/polls short requests.
7. Refresh a deep link such as `/app/bids`; it should load the application.
8. Sign out, then confirm `/api/bids` returns 401.

If the workspace reports a connection error, verify the Railway HTTPS origin, backend readiness, and the matching API keys. Missing frontend session configuration produces 503; a backend 401 becomes a safe gateway error without exposing its key. Backend capacity limits may return 429; allow the active job to finish before retrying.

The included request limiter is per function instance. Use Vercel Firewall or another shared limiter for a publicly exposed paid-provider demo. Hosted Secure-cookie/routing/performance checks remain deployment checks; local QA is recorded separately in `QA_REPORT.md`.

Official references: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [environment variables](https://vercel.com/docs/environment-variables).
