# QA report — October 25, 2026

The frontend was reviewed as a researcher: enter through the landing page, sign in, inspect a real bid, verify an amended deadline against its PDF, search a technical requirement, ask a question, compare bids, inspect the run, then upload a new collection. Checks used the actual local FastAPI, FAISS/local ONNX models and configured Groq account. No production model responses are hardcoded.

## Executed evidence

- `npm run lint` and the TypeScript/Vite production build passed.
- Ten unit/integration tests passed: session tampering/expiry, origin validation, quotas, formatting and an HTTP regression proving reads do not consume the mutation quota. Coverage is scoped to `server/security.ts` and `src/lib/format.ts`: 96.55% lines, 89.79% branches, 100% functions. This is not application-wide React coverage.
- All **33 browser assertions passed**. The retained visible-Chrome suite is `tests/user-journey.mjs`. Results, actual API-driven screenshots and accessibility findings are in `artifacts/user-journey-results.json`. It exercises authentication failures, real source downloads, all 20 fields, JSON export, amendment history, filtered search, evidence dialogs, controlled outage/recovery, real Groq Q&A/comparison, traces, measured evaluation, unseen upload, mobile navigation and expired sessions.
- Six page/theme states were scanned with axe WCAG 2 A/AA and 2.1 AA rules. Dark theme colors were also checked for a real rendered change, rather than relying on a toggle label. This is automated coverage, not a claim of a full manual accessibility audit.
- Responsive workspace checks cover 320, 390, 768, 1024 and 1440 px with no page-level horizontal overflow. Wide comparison tables scroll within their container. Mobile/desktop, light/dark and source-dialog screenshots are saved.
- Lighthouse mobile report: `artifacts/lighthouse-mobile.json`; the optimized local build reached **90 performance, 100 accessibility, 100 best practices and 100 SEO**. Measurements use Lighthouse's mobile simulation on localhost; hosted Core Web Vitals remain unmeasured. CSS pruning retains theme/state selectors, responsive images reduce hero transfer, and the research evidence dialog is split out of the public landing bundle.
- `npm install` reported zero known dependency vulnerabilities. All **19 backend regression/OCR tests pass** in the Docker image under a 1 GiB memory limit and one CPU; detailed backend evidence lives separately in `rfp-intelligence/artifacts`.

## Issues found and corrected

1. API login origin handling through the Vite proxy.
2. Button/badge contrast and explicit search filter labels.
3. Q&A bid selection persisting into the comparison route.
4. Read requests consuming the same quota as mutations, blocking a later upload.
5. Unused design-system CSS, oversized hero transfer and an eager evidence-dialog dependency.
6. CSS pruning dropping the dark-theme variable selector; fixed with explicit safelisting and a rendered-color regression check.
7. HTML bid identifier pattern updated for current browser regular-expression rules.
8. Live provider reasoning parts, JSON-encoded citation objects and schema retry feedback handled in the backend without bypassing citation/semantic validation.

## Deployment and review limits

Vercel and Railway deployments were not performed. Their real HTTPS URLs, production Secure cookies, function routing, persistent disk, cache behavior and hosted performance still need a deployment smoke check. The Vercel configuration passes instance validation against its official JSON schema (`artifacts/vercel-validation.json`). The supplied CI workflow is ready for the standalone frontend repository; it has not run on GitHub.

The account is a shared public demo, not a private multi-tenant identity system. Configure distributed public rate limits before exposing paid model usage. Browser uploads are intentionally capped at 2 MB; larger collections use the backend folder path. Provider timeouts and unsupported or rejected claims remain visible as partial runs or explicit missing evidence. Extraction confidence is a heuristic; a human should verify consequential bid decisions.

No satisfaction score is invented. The reviewed workflow is usable end to end locally; the evidence files show exactly what was checked. The temporary synthetic `BrowserQA-*` collection was removed after successful upload verification; its history remains auditable.

An exact-value scan found no configured backend key, Groq key or session secret in the built assets and saved QA artifacts (`artifacts/secret-scan.json`). This is a targeted check, not a substitute for a repository secret scanner.

Chat-first revision: login opens `/app` as the chatbot; the bid library is `/app/bids`. The demo password is lowercase `admin` and `Admin` is rejected. New checks verify seven role descriptions, zero when idle, and a positive live agent count during a real Groq request. Backend counters release even when a step fails; three extraction specialists are counted as three simultaneous executions under one role. No conversation-memory feature was added in this layout change.

The final visual review also preserved dynamically generated Radix variant classes during CSS pruning, including the default checkbox surface styling.

Backend layout regression, October 26, 2026: all 33 existing browser assertions also passed against the refactored `src/rfp` Docker image on isolated QA ports (frontend 4174/API 8002). The rebuilt local backend subsequently passed login, status, library and real filtered-search smoke checks through localhost:5173. Details are in the backend source-layout validation report. Frontend source behavior was not changed by this refactor.

## Repository publication checks — October 26, 2026

Pinned the tested Node major to 22 and documented Vercel-to-Railway setup. Lint, TypeScript and production build passed. All 14 unit/integration tests pass, including Vercel rewrite forwarding, server-only credentials, 202 job submission/polling, safe upstream-auth errors and Secure production cookies. An additional built-site smoke passed 11 checks against the actual local backend, including login/chat-first routing, seven agent roles, library/search, SPA deep links, theme/mobile rendering and logout, with no browser runtime errors. It made no new Groq requests. These checks are in `artifacts/repository-*.txt` and `artifacts/repository-browser-smoke.json`.

The actual Vercel configuration instance passed validation using the official schema. Its upstream schema has an invalid unused trigger definition, so direct instance validation was used; `repository-vercel-validation.json` records that limit. Railway/Vercel HTTPS deployment smoke checks remain pending user deployment.
