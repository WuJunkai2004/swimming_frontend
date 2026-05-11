# swimming_frontend

Vue 3 + Vite frontend for a swimming association website (FZU). UI framework: PrimeVue 4 (Aura theme, blue preset) + PrimeFlex + PrimeIcons.

## Commands

- `npm run dev` — dev server (host exposed)
- `npm run debug` — dev server proxying all API requests to backend URL from `.env`
- `npm run build` — production build
- `./build.sh` — **use this for production builds**; runs CSS variable check then builds
- `node scripts/gen_docs.js` — fetches OpenAPI spec from backend (`/v3/api-docs`) and generates `src/api/API_docs.md`
- `node scripts/gen_apilist.js` — extracts API paths from `API_docs.md` into `API_list.txt`
- `node scripts/gen_vercel.js` — generates `vercel.json` with API rewrites (needs `BACKEND_URL` env var)

## Architecture

- `src/main.js` — app entry, configures PrimeVue, router, ConfirmationService
- `src/router/index.js` — public routes; `src/router/login.js` — admin/manage routes
- `src/views/` — page components (one file per route, lazy-loaded)
- `src/views/manage/` — admin panel pages
- `src/api/api.js` — Vite plugin for dev-mode API mocking + proxy config generator. Reads `src/api/API_list.txt` at build time.
- `src/utils/` — utility modules (useToken, useAlert, useStorage, Excel export, mappings, etc.)

## Build-time CSS variable check

`build.sh` runs `src/styles/report_css_variables.py` which scans all `.vue` files for `var(--...)` references and verifies each variable is listed in `src/styles/checked_css_variables.txt`. If you add a new CSS variable, you **must** add it to that file or the build will fail.

## Path aliases

- `@/` → `src/` (configured in both vite.config.js and jsconfig.json)
- `#/` → `src/utils/` (vite.config.js only, not in jsconfig.json — IDE won't resolve it)

## PrimeVue auto-import

`unplugin-vue-components` with `PrimeVueResolver` auto-imports PrimeVue components — no manual import needed in SFCs.

## API proxy pipeline

`gen_docs.js` → `API_docs.md` → `gen_apilist.js` → `API_list.txt` → consumed by `api.js` (dev mock/proxy) and `gen_vercel.js` (Vercel rewrites). Must run in order.

## Deployment

- Vercel: triggered via `workflow_dispatch` in `.github/workflows/vercel_deploy.yml`. Generates `vercel.json` from API list then deploys with Vercel CLI.
- API docs sync: on push to `main` when `API_docs.md` changes, syncs docs to a Gitee repo.

## Environment

- `.env` file contains `backend=<url>` — required for `debug` mode and doc generation scripts
- `.env` is gitignored
- Node: `^20.19.0 || >=22.12.0`

## No test/lint/typecheck commands

This repo has no configured test runner, linter, or type checker. There are no tests.
