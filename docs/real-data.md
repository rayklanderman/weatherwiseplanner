# Using Real NASA Data

Ready to move past the demo JSON? Follow this recipe to pull authentic reanalysis statistics into WeatherWise Planner.

## 1. Collect NASA credentials
- Sign up for a free account at <https://urs.earthdata.nasa.gov>.
- Create or update your `~/.netrc` so `xarray` can authenticate when it opens an OPeNDAP URL:

```text
machine urs.earthdata.nasa.gov
  login YOUR_USERNAME
  password YOUR_PASSWORD
machine opendap.nccs.nasa.gov
  login YOUR_USERNAME
  password YOUR_PASSWORD
```

> TIP: On Windows, store the file at `%USERPROFILE%\.netrc` and ensure permissions are restricted to the current user.

## 2. Choose a dataset
- Recommended product: **MERRA-2** collection `MERRA2_100.tavg1_2d_slv_Nx` (hourly 2D surface diagnostics).
- Download options:
  - Use [GES DISC File Service](https://disc.gsfc.nasa.gov/datasets/M2T1NXSLV_5.12.4/summary) to request a custom subset in NetCDF format.
  - Or capture the OPeNDAP URL (ends with `.nc?`) for direct access without downloading the full file.

Store the NetCDF locally (e.g., `D:/data/merra2_subset.nc`) or keep the secure HTTP link handy for the next step.

## 3. Configure backend environment
Create `backend/.env` or export variables before launching FastAPI:

```powershell
$env:WEATHERWISE_DATASET = "D:/data/merra2_subset.nc"   # or https://opendap.../file.nc
$env:WEATHERWISE_FORCE_MOCK = "0"                        # insist on using the real dataset
$env:WEATHERWISE_WINDOW_DAYS = "3"                       # sliding window +/- days around the target date
```

Optional tweaks:
- `WEATHERWISE_ALLOW_MOCK_FALLBACK=0` — fail hard instead of silently reverting to the demo payload.
- `WEATHERWISE_DATA_SOURCE="MERRA-2 (custom subset)"` — change the label surfaced to users.

Start the backend:

```powershell
python -m uvicorn backend.main:app --reload
```

## 4. Switch the frontend out of demo mode
Create a root-level `.env` for Vite (or `.env.local`):

```text
VITE_WEATHERWISE_DEMO_MODE=false
```

Restart `yarn dev`. Subsequent queries now hit `/api/query`, which streams real statistics from the dataset.

## 5. How the computation works
- The backend selects the grid cell nearest to your lat/lon.
- It builds a +/- `WEATHERWISE_WINDOW_DAYS` window around the chosen calendar day, across all years in the file.
- For each condition, it evaluates the relevant variable:
  - `T2M_MAX` for **very_hot** (>= 32.2 °C / 90 °F).
  - `T2M_MIN` for **very_cold** (<= 0 °C / 32 °F).
  - `PRECTOT` for **very_wet** (>= 10 mm/day).
  - `WS10M` for **very_windy** (>= 8 m/s ≈ 18 mph).
  - `T2M` for **very_uncomfortable** (>= 35 °C ≈ 95 °F; proxy for heat-index spikes).
- It converts Kelvin to Celsius where needed, computes exceedance probabilities, and estimates a trend by comparing the first and second halves of the time series.

CSV/JSON exports, charts, and the AI planner briefing immediately reflect the real dataset.

## 6. Troubleshooting
- **Dataset missing variables**: ensure your subset includes the fields listed above. Adjust `CONDITION_SETTINGS` in `backend/data_fetcher.py` if you use alternative variable names.
- **Authentication errors**: double-check `.netrc` permissions and credentials; NASA sometimes requires renewing EULA acceptance via the dataset page.
- **Performance**: Consider pre-downloading a regional subset to reduce transfer time. You can also raise `WEATHERWISE_WINDOW_DAYS` for smoother probabilities or lower it for sharper signals.

With these steps, WeatherWise Planner evolves from a static demo into a living climate intelligence tool powered by NASA's archive.
