# WeatherWise Planner

WeatherWise Planner turns decades of NASA Earth observation records into forward-looking insights so you can plan outdoor experiences months ahead. Drop a pin anywhere on the globe, pick the day you care about, and instantly see how often extreme heat, cold snaps, heavy rain, high winds, or muggy conditions have struck historically.

## Features

- 🗺️ **Interactive Leaflet map** — drop a pin to set the location.
- 📅 **Day-of-year selector** — focus on the date that matters for your trip.
- ⚠️ **Risk toggles** — focus on extreme heat, hard freezes, heavy rain, high winds, and muggy heat hazards.
- 📊 **Probability dashboard** — NASA-derived odds plus plain-language summaries.
- 🧭 **Planner tips** — actionable recommendations tied to the highest historical risks.
- 🛰️ **NASA imagery overlay** — optional MODIS true-color snapshot via GIBS for visual context.
- 📈 **Histogram view** — explore the distribution for each weather risk.
- 🤖 **AI planner briefing** — Together-powered summary tailored to logistics and mitigations.
- 📥 **CSV / JSON export** — take the analysis offline with metadata included.
- 📱 **Responsive UI** — tuned for mobile-first hackathon demos.

## Tech stack

| Layer     | Choices |
|-----------|---------|
| Frontend  | React + TypeScript (Vite), Tailwind CSS, Zustand state, Leaflet map, Plotly charts |
| Backend   | FastAPI (Python 3.11+), optional xarray / netCDF4 for NASA OPeNDAP |
| Data demo | Bundled mock JSON or replaceable MERRA-2 NetCDF sample |

## Getting started

### 1. Install prerequisites

- Node.js 18+
- Python 3.11+

### 2. Install frontend dependencies

```powershell
yarn install
```

### 3. Run the frontend dev server

```powershell
yarn dev
```

Visit <http://localhost:5173>.

### 4. (Optional) Run the FastAPI backend with mock data

Create a virtual environment, then install requirements:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload
```

The frontend proxies `/api/*` to `http://localhost:8000` during development.

### 5. Swap in real NASA data (stretch goal)

1. Download a subset of the [MERRA-2](https://disc.gsfc.nasa.gov/) dataset as NetCDF and place it under `public/sample_data/merra2_sample_denver_2018_2023.nc`.
2. Update `backend/data_fetcher.py` to flip `use_mock=False` or detect your dataset.
3. Extend the transformation logic to compute exceedance probabilities via xarray (see TODOs below).

## Project structure

```
Weatherwise Planner/
├── config.json
├── index.html
├── package.json
├── public/
│   ├── favicon.svg
│   ├── mock-data/mockResponse.json
│   └── sample_data/merra2_sample_denver_2018_2023.nc (placeholder)
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── types/
│   └── main.tsx
└── backend/
    ├── main.py
    ├── data_fetcher.py
    └── requirements.txt
```

## NASA attribution

> Data provided by NASA Earth Observing System Data and Information System (EOSDIS) via GES DISC.

Include this credit in any deployment or presentation.

## Roadmap & realistic improvements

- 🔌 **Live MERRA-2 integration** — authenticate with NASA Earthdata, call OPeNDAP using xarray, and persist a cache per lat/lon/day.
- 🧠 **Custom activity profiles** — let users set thresholds (e.g., trail runners vs. families) and adjust risk labels.
- 💬 **Scenario storytelling** — add AI-powered explanations (“Expect muggy afternoons: pack cooling towels”).
- ☁️ **Seasonal overlays** — compare multiple dates on the histogram for shoulder-season planning.
- 📶 **Offline-ready PWA** — allow park rangers to preload insights before heading into low-connectivity zones.

## Testing & quality

- `yarn lint` — ESLint + TypeScript checks.
- `yarn typecheck` — strict type coverage.
- `yarn build` — production bundle.
- Backend unit tests can be added under `backend/tests/` (not included yet).

## License

This project is provided for hackathon/demo purposes.
