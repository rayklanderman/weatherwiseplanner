# WeatherWise Planner – Project Memory

## Mission Snapshot
- **Goal:** Help people plan outdoor activities months in advance by revealing the historical probability of adverse weather (very hot/cold/wet/windy/uncomfortable) for any location and calendar day.
- **Data Source Strategy:** NASA MERRA-2 climatology accessed via GES DISC OPeNDAP, with a bundled NetCDF sample and mock JSON for demos to avoid live API calls.
- **Hackathon Priorities:** Deliver a polished, mobile-friendly UX with persuasive insights, even if data is mocked.

## Frontend Architecture
- **Stack:** React 19 + TypeScript (Vite), Tailwind CSS 4, Zustand-free (contextless) state driven through hooks, Leaflet for mapping, Plotly.js for charts, Headless UI for menus.
- **Entry Points:**
  - `src/main.tsx` wires `App` into the DOM with strict mode.
  - `src/App.tsx` orchestrates layout, state, and feature sections.
- **Core Components:**
  - `MapSelector` — Leaflet map with draggable marker for lat/lon selection; defaults to Denver when coordinates are unset.
  - `ConditionToggles` — Tailwind-styled checkboxes for the five risk categories.
  - `ResultsPanel` — Summaries, probability chips, and metadata; handles loading/error/empty states.
  - `ChartDisplay` — Plotly histogram per condition with pill selector for switching conditions.
  - `ExportButton` — Headless UI menu to download CSV or JSON via utility exporters.
- **Hooks & Services:**
  - `useWeatherQuery` wraps async fetching (demo vs API) and memoizes natural-language summaries.
  - `useGeolocation` requests browser coordinates with graceful fallbacks.
  - `services/nasaDataService` posts to `/api/query` or loads `/mock-data/mockResponse.json` depending on config.
  - `services/probabilityCalculator` converts API responses into friendly summary strings and exposes condition labels.
- **Utilities:**
  - `utils/unitConverter` exposes Kelvin/precip/wind conversions and a heat-index helper.
  - `utils/exportHandler` builds CSV/JSON downloads with metadata rows.
- **Styling:** Tailwind 4 with `@tailwindcss/forms`, custom `brand` palette, Inter variable font stack, and a PostCSS pipeline using `@tailwindcss/postcss` + `autoprefixer`.
- **Config & Assets:**
  - `config.json` toggles demo mode, default date/conditions, and NASA attribution text.
  - `public/mock-data/mockResponse.json` holds the canonical demo payload.
  - `public/sample_data/merra2_sample_denver_2018_2023.nc` marks where real NetCDF samples should live.

## Backend Architecture
- **Framework:** FastAPI (`backend/main.py`) with CORS enabled and a `/query` endpoint returning either mock data or a proto NetCDF-derived payload.
- **Data Fetcher:** `backend/data_fetcher.py` abstracts loading from mock JSON or NetCDF (via xarray) and populates metadata + query echoes.
- **Deployment Assumption:** Backend can run locally on port 8000 with `uvicorn backend.main:app --reload`, and the Vite dev server proxies `/api/*` to it.
- **Demo Mode:** Frontend defaults to `demoMode: true` via `config.json`, so the API is optional unless real data is wired up.

## Dependency Inventory
### Frontend (package.json)
**Runtime:** `react`, `react-dom`, `react-leaflet`, `leaflet`, `plotly.js`, `react-plotly.js`, `@headlessui/react`, `@heroicons/react`, `clsx`, `zustand`, `date-fns`.

**Dev Tooling:** `typescript`, `vite`, `@vitejs/plugin-react-swc`, `tailwindcss@4`, `@tailwindcss/forms`, `@tailwindcss/postcss`, `postcss`, `autoprefixer`, `prettier`, `eslint@9` + plugins (`@typescript-eslint/*`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-config-prettier`), `@types/*` packages, `typescript-eslint` meta package.

### Backend (backend/requirements.txt)
`fastapi`, `uvicorn`, `pydantic`, `xarray`, `netCDF4`, `pandas`, `numpy`.

## Development Workflow
- **Install:** `yarn install` (frontend) and `pip install -r backend/requirements.txt` inside a Python venv when backend is needed.
- **Run dev server:** `yarn dev` (Vite on 5173; use `--host` to expose) and optionally `uvicorn backend.main:app --reload` on 8000.
- **Quality Gates:** `yarn lint`, `yarn typecheck`, `yarn build` (currently succeeds with a warning about large Plotly bundles).
- **Formatting:** `yarn format` (Prettier).
- **Exports:** CSV/JSON downloads incorporate metadata such as date, lat/lon, and NASA attribution.

## Data & UX Logic
1. User drops a pin in `MapSelector`, updates `lat/lon` in app state.
2. Date picker and toggles (in `App`) update `dateOfYear` and `conditions`.
3. `useWeatherQuery` fires when coordinates and conditions exist, calling:
   - `loadDemoResponse` (static JSON) if `demoMode` is true.
   - Otherwise `queryWeatherRisk` posting to `/api/query`.
4. Response is cached in hook state; `buildSummaries` creates human-readable bullet points.
5. `ResultsPanel` renders probabilities and trends; `ChartDisplay` shows histograms with dynamic condition selection.
6. `ExportButton` pipes the entire payload into CSV/JSON exporters.

## Outstanding Opportunities
- Wire live NASA data: implement real OPeNDAP fetch in `data_fetcher.py`, handle credentials, and expose thresholds per condition.
- Improve bundle size by lazy-loading Plotly charts or using `react-plotly.js` dynamic import.
- Extend analytics: add trend visualizations, scenario narratives, comparative modes, or activity-based threshold presets.
- Harden backend: add validation tests, caching (per lat/lon/day), error observability, and deployment manifests.
- Accessibility polish: ensure map keyboard controls and semantic aria labels for dynamic summaries.
- Deployment docs: scripts for Vercel (frontend) and Render/Fly.io (backend), including environment toggles for live data.

## Recent Worklog (2025-10)
- Scaffolded Vite + React + TypeScript project structure with Tailwind 4, ESLint 9, Prettier 3, and Yarn scripts.
- Implemented core UI components, hooks, and demo data services according to the product spec.
- Added FastAPI backend skeleton with mock/NetCDF fetcher and requirements lock.
- Upgraded all dependencies to latest releases, migrating Tailwind to v4 and ESLint to the flat config format.
- Established Yarn-based workflow (dev/build/lint/typecheck/format) and documented commands in `README.md`.
- Generated production build, cleaned up build artifacts, and expanded `.gitignore` to keep dist and tsbuildinfo files out of version control.

Keep this file updated as features evolve so new contributors understand the project charter, technical stack, and outstanding priorities at a glance.
