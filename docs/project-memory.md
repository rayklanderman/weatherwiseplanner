# WeatherWise Planner – Project Memory

## Mission Snapshot

- **Core Purpose:** WeatherWise Planner empowers everyday users—farmers, hikers, event planners, and travelers—to make smarter decisions by revealing the historical likelihood of extreme weather conditions for any location and day of the year, using decades of NASA Earth observation data.
- **Problem Solved:** Most weather apps only forecast 7–14 days ahead. WeatherWise answers: "Is July 15 in this region usually dangerously hot? Is this valley too cold in April for crops?" enabling users to choose optimal locations and times months in advance.
- **Target Users:** Farmers assessing land suitability, outdoor event organizers, hikers and campers, seasonal travelers, and climate-aware citizens seeking historical weather patterns.
- **Value Proposition:** Transform NASA's vast climate archive into actionable insights through simple, intuitive interfaces that require no meteorological expertise.
- **Data Source Strategy:** NASA MERRA-2 climatology accessed via GES DISC OPeNDAP, with bundled NetCDF samples and mock JSON for reliable demos.
- **Live Data Toggle:** Frontend `VITE_WEATHERWISE_DEMO_MODE=false` plus backend `WEATHERWISE_DATASET`, `WEATHERWISE_WINDOW_DAYS`, and fallback flags enable switching between static demos and real-world reanalysis.
- **UX Philosophy:** Simplicity first—laypersons should understand the app in under 10 seconds with centralized inputs, plain language, and mobile-responsive design.

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
  - `services/aiInsightsService` posts planner context to the FastAPI `/insights` endpoint for Together-powered narratives.
    - `docs/real-data.md` walks through configuring real NASA OPeNDAP/NetCDF inputs.
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
- **AI Integration:** Together API integration for generating contextual planning advice based on historical weather odds.
- **Real-world Scenarios:**
  - **Farmer use case:** "April 10–20 in Nakuru has 85% historical likelihood of temps >15°C—suitable for maize planting."
  - **Event planner use case:** "July 20 in Miami shows 70% historical likelihood of heat index ≥95°F—consider indoor venues."
  - **Hiker use case:** "October 5 in the Rockies has 5% chance of snow but 40% likelihood of high winds—pack wind protection."

## Technical Objectives
- **Threshold Analysis:** Compute historical exceedance probabilities for:
  - Very Hot: ≥32.2°C (90°F)
  - Very Cold: ≤0°C (32°F)
  - Very Wet: ≥10mm rain/day
  - Very Windy: ≥8 m/s (≈18 mph)
  - Very Uncomfortable: Heat index proxy ≥35°C (≈95°F)
- **Temporal Windows:** ±3-day sliding windows around target dates for robust statistics
- **Trend Detection:** Compare early vs. late periods in dataset to identify climate shifts
- **Accessibility:** Color-blind friendly palettes, screen reader compatibility, large touch targets
- **Performance:** Sub-second response times with caching strategies for repeated queries

## Dependency Inventory
### Frontend (package.json)
**Runtime:** `react`, `react-dom`, `react-leaflet`, `leaflet`, `plotly.js`, `react-plotly.js`, `@headlessui/react`, `@heroicons/react`, `clsx`, `zustand`, `date-fns`.

**Dev Tooling:** `typescript`, `vite`, `@vitejs/plugin-react-swc`, `tailwindcss@4`, `@tailwindcss/forms`, `@tailwindcss/postcss`, `postcss`, `autoprefixer`, `prettier`, `eslint@9` + plugins (`@typescript-eslint/*`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-config-prettier`), `@types/*` packages, `typescript-eslint` meta package.

### Backend (backend/requirements.txt)
`fastapi`, `uvicorn`, `pydantic`, `xarray`, `netCDF4`, `pandas`, `numpy`.

## Development Workflow
- **Install:** `yarn install` (frontend) and `pip install -r backend/requirements.txt` inside a Python venv when backend is needed.
- **Run dev server:** `yarn dev` (Vite on 5173; use `--host` to expose) and optionally `uvicorn backend.main:app --reload` on 8000.
- **Python runtime:** Use Python 3.11 for backend work; the pinned wheels for `pydantic-core` and `netCDF4` are not yet published for 3.13.
- **Quality Gates:** `yarn lint`, `yarn typecheck`, `yarn build` (currently succeeds with a warning about large Plotly bundles).
- **Formatting:** `yarn format` (Prettier).
- **Exports:** CSV/JSON downloads incorporate metadata such as date, lat/lon, and NASA attribution.
  - Real-data runs now include dataset name, grid cell coordinates, and window sizing.
  - Risk summaries display circular gauges to visualize historical likelihood at a glance.

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
- Wired the frontend AI planner briefing to the Together-backed `/insights` API with configurable prompts and copy-to-clipboard helper.
- Added environment-driven pipeline for real NASA data (MERRA-2) including documentation and runtime toggles for demo vs live datasets.
- Harmonized risk thresholds with product spec (0 °C freeze, 8 m/s wind, 35 °C heat-index proxy) and refreshed demo data accordingly.
- Documented Together AI integration requirements and smoke-tested the mock data fetcher; outstanding work is to wire graceful fallbacks when `TOGETHER_API_KEY` is absent.

## Immediate Next Steps
- Create a `.venv` pinned to Python 3.11, install `backend/requirements.txt`, and add a short README snippet covering the recommended interpreter.
- Inject `TOGETHER_API_KEY` (and optional `TOGETHER_MODEL`) via local env files; add backend health check or UI messaging when the key is missing.
- Consider adding a place-name search bar (Mapbox, Photon, or Nominatim) alongside the Leaflet pin for faster navigation.

Keep this file updated as features evolve so new contributors understand the project charter, technical stack, and outstanding priorities at a glance.
