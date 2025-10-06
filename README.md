# WeatherWise Planner

**Transform NASA's 20+ years of Earth observation data into actionable climate insights for your planning needs.** Whether you're a farmer planning crops, a traveler choosing vacation dates, or an event organizer assessing weather risks, WeatherWise Planner provides historical weather patterns and AI-powered recommendations for any location on Earth.

Drop a pin anywhere on the globe, select your target date, and instantly discover historical probabilities for extreme heat, cold snaps, heavy rainfall, high winds, and dangerous heat index conditions. Our AI assistant, powered by Groq's Llama 3.3 70B, delivers sub-second insights tailored to farming, travel, outdoor events, and more.

## ✨ Features

### 🗺️ **Interactive Global Map**
- Click anywhere worldwide to analyze climate patterns
- Automatic reverse geocoding shows city/town names
- Real-time location updates with visual feedback

### 📅 **Flexible Date Selection**
- Pick any day of the year for seasonal analysis
- ±3 day window for robust historical statistics
- Perfect for planning trips, planting seasons, or events months ahead

### ⚠️ **5 Critical Weather Conditions**
- 🌡️ **Extreme Heat Days** — Daily max ≥ 32.2°C (90°F)
- ❄️ **Frost/Freeze Days** — Daily min ≤ 0°C (32°F)
- 🌧️ **Heavy Rain Days** — Precipitation ≥ 10mm/day
- 💨 **High Wind Days** — Wind speed ≥ 8 m/s (~18 mph)
- 🥵 **Dangerous Heat Index** — Heat index ≥ 35°C (95°F)

### 🤖 **AI Climate Assistant (Groq-Powered)**
- **Sub-second responses** using Llama 3.3 70B Versatile
- **Location-aware insights** — Always mentions city/town in responses
- **Historical analysis** — "How has weather been over the last 10 years?"
- **Persistent suggestions** — Guided questions for farming, travel, events
- **Dynamic follow-ups** — Contextual next questions based on your interests
- **Multi-use case support** — Agriculture, tourism, event planning, safety

### 📊 **Data Visualization**
- Probability percentages with trend indicators
- Interactive histograms showing historical value distributions
- Color-coded risk gauges for quick assessment
- Plain-language summaries for non-experts

### 🛰️ **NASA Satellite Imagery**
- GIBS (Global Imagery Browse Services) integration
- MODIS true-color snapshots for visual context
- Automatic date formatting for imagery API

### � **Export Capabilities**
- CSV exports with full metadata
- JSON exports for programmatic use
- Includes AI insights in export data
- Perfect for offline analysis or reports

### 📱 **Progressive Web App (PWA)**
- Installable on mobile and desktop
- Offline data caching with service workers
- Works like a native app
- 10MB cache limit for large dependencies (Plotly.js)

### 🌐 **Production Ready**
- **Frontend:** Vercel deployment with custom domain (weatherwise.earth)
- **Backend:** Render.com with FastAPI + MERRA-2 data processing
- **CORS configured** for Vercel preview deployments
- **Reverse geocoding** via OpenStreetMap Nominatim API

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript + Vite | Fast, type-safe UI development |
| **State Management** | React Hooks (useState, useEffect, useCallback) | Efficient local state |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **Mapping** | Leaflet + React-Leaflet | Interactive global map |
| **Charts** | Plotly.js | Interactive histograms |
| **AI Integration** | Groq API (Llama 3.3 70B Versatile) | Sub-second AI responses |
| **Geocoding** | OpenStreetMap Nominatim | Free reverse geocoding |
| **Backend** | FastAPI (Python 3.11+) | High-performance API server |
| **Data Processing** | xarray + netCDF4 + NumPy + Pandas | NASA MERRA-2 data analysis |
| **NASA Data** | MERRA-2 via GES DISC | 20+ years of reanalysis data |
| **Satellite Imagery** | NASA GIBS (MODIS) | True-color Earth snapshots |
| **PWA** | Vite PWA Plugin + Workbox | Offline capability |
| **Deployment** | Vercel (Frontend) + Render (Backend) | Production hosting |
| **Domain** | weatherwise.earth / www.weatherwise.earth | Custom domain |

## 🎯 Use Cases

### 👨‍🌾 **Agriculture & Farming**
- Analyze historical frost patterns for planting schedules
- Assess rainfall reliability for crop selection
- Identify extreme heat risks for livestock management
- Plan irrigation based on precipitation trends

### ✈️ **Travel & Tourism**
- Choose optimal travel months based on weather history
- Avoid extreme weather periods for outdoor activities
- Plan beach vacations with heat and rain probabilities
- Assess climate suitability for specific destinations

### 🎪 **Event Planning**
- Evaluate weather risks for outdoor weddings, festivals, concerts
- Historical data for seasonal event timing decisions
- Rain probability for venue selection (indoor vs outdoor)
- Wind patterns for sailing regattas or air shows

### 🏗️ **Construction & Logistics**
- Weather windows for outdoor construction projects
- Extreme cold/heat impacts on concrete curing
- Heavy rain probabilities for earthwork scheduling
- Wind patterns for crane operations safety

## 🌍 Global Coverage

- **220+ countries** supported via OpenStreetMap geocoding
- **Worldwide MERRA-2 coverage** at 0.5° × 0.625° resolution
- **City-level reverse geocoding** for user-friendly location names
- **Any date of year** analysis with historical trends

## 📚 NASA Data Sources

This project utilizes the following NASA Earth Science data:

1. **MERRA-2 (Modern-Era Retrospective analysis for Research and Applications, Version 2)**
   - Provider: NASA GES DISC (Goddard Earth Sciences Data and Information Services Center)
   - Variables: T2M_MAX, T2M_MIN, PRECTOT, WS10M, T2M
   - Time Range: 2000-2023 (20+ years of reanalysis)
   - Resolution: 0.5° latitude × 0.625° longitude
   - URL: https://disc.gsfc.nasa.gov/

2. **GIBS (Global Imagery Browse Services)**
   - Provider: NASA EOSDIS (Earth Observing System Data and Information System)
   - Product: MODIS Terra True Color
   - Purpose: Visual context satellite imagery
   - URL: https://gibs.earthdata.nasa.gov/

3. **OpenStreetMap Nominatim**
   - Free geocoding and reverse geocoding service
   - Used for city/town name resolution
   - Worldwide coverage

## 🚀 Getting Started

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

> 💡 **AI insights require a Groq API key.** Create a `.env` or `.env.local` file in the project root with:
> ```
> GROQ_API_KEY=your_key_here
> ```
> Get a free API key at [console.groq.com](https://console.groq.com/). Restart the backend after adding the key.

### 5. Configure environment variables

Create a `config.json` in the project root (or use the existing one):

```json
{
  "projectName": "WeatherWise Planner",
  "ui": {
    "defaultConditions": ["very_hot", "very_cold", "very_wet", "very_windy", "very_uncomfortable"],
    "defaultDate": "2024-07-15"
  },
  "data": {
    "demoMode": false,
    "attribution": "Data provided by NASA EOSDIS via GES DISC",
    "sourceUrl": "https://disc.gsfc.nasa.gov/"
  }
}
```

Set `demoMode: true` to use bundled mock data, or `false` to query the backend with real MERRA-2 data.

### 6. Swap in real NASA data (optional)

1. [Create a free NASA Earthdata account](https://urs.earthdata.nasa.gov/users/new) and configure your `~/.netrc` for authenticated OPeNDAP access.
2. Download a subset of [MERRA-2](https://disc.gsfc.nasa.gov/) reanalysis (recommended: `MERRA2_100.tavg1_2d_slv_Nx`) as NetCDF.
3. Place the NetCDF under `public/sample_data/merra2_sample_<location>_<years>.nc` **or** set environment variable:

    ```bash
    # Backend .env file
    WEATHERWISE_DATASET="/path/to/merra2_data.nc"
    WEATHERWISE_FORCE_MOCK=0
    WEATHERWISE_WINDOW_DAYS=3
    ```

4. Restart the backend. The API now computes probabilities from the MERRA-2 variables (`T2M_MAX`, `T2M_MIN`, `PRECTOT`, `WS10M`, `T2M`).
5. Reload the frontend; the CSV/JSON exports reflect the live dataset instead of the static mock payload.

## 📦 Project Structure

```
Weatherwise Planner/
├── config.json                    # App configuration (demo mode, defaults)
├── manifest.json                  # PWA manifest
├── sw.js                          # Service worker for offline capability
├── index.html
├── package.json
├── vite.config.ts                 # Vite + PWA plugin configuration
├── tailwind.config.js
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   ├── mock-data/mockResponse.json
│   └── sample_data/merra2_sample_denver_2018_2023.nc
├── src/
│   ├── App.tsx                    # Main app component
│   ├── main.tsx
│   ├── components/
│   │   ├── AiChatPanel.tsx       # AI assistant with persistent suggestions
│   │   ├── MapSelector.tsx       # Leaflet interactive map
│   │   ├── ResultsPanel.tsx      # Probability display
│   │   ├── ChartDisplay.tsx      # Plotly histograms
│   │   ├── SatelliteSnapshot.tsx # NASA GIBS imagery
│   │   ├── ExportButton.tsx      # CSV/JSON export
│   │   └── ...
│   ├── hooks/
│   │   ├── useWeatherQuery.ts    # Main data fetching hook
│   │   ├── useAiInsights.ts      # Groq AI integration
│   │   └── useGeolocation.ts     # Browser geolocation
│   ├── services/
│   │   ├── nasaDataService.ts    # Backend API calls
│   │   ├── aiInsightsService.ts  # AI prompt generation
│   │   ├── geocoder.ts           # Reverse geocoding (OSM Nominatim)
│   │   ├── probabilityCalculator.ts
│   │   └── exportHandler.ts
│   ├── types/
│   │   └── weather.ts            # TypeScript interfaces
│   └── utils/
│       └── unitConverter.ts
└── backend/
    ├── main.py                    # FastAPI server with CORS
    ├── data_fetcher.py            # MERRA-2 NetCDF processing
    ├── groq_insights.py           # Groq API integration (Llama 3.3 70B)
    ├── requirements.txt
    └── .env                       # GROQ_API_KEY, WEATHERWISE_DATASET
```

## 🎨 Key Features Deep Dive

### AI Assistant Capabilities

The AI chat panel powered by Groq's Llama 3.3 70B provides:

- **Persistent contextual suggestions** — Questions remain visible to guide users
- **Dynamic question sets** — Initial questions for first-time users, follow-ups after engagement
- **Location-aware responses** — AI always mentions city/town names
- **Historical trend analysis** — "How has weather been over last 10 years?" answered with data
- **Multi-use case support** — Farming, travel, events, construction, safety planning
- **Sub-second inference** — Groq's infrastructure delivers responses in <1 second
- **One-click interactions** — Suggestions auto-send, no typing needed

Example initial suggestions:
- "How has the weather been over the last 10 years (2014-2024)?"
- "What are the main climate risks for this location?"
- "Is this location suitable for farming activities?"

Example follow-up suggestions:
- "What's the best time of year to visit for holidays?"
- "How reliable is rainfall for agriculture here?"
- "What crops would thrive in this climate?"

### Reverse Geocoding

When users click on the map:
1. Latitude/longitude captured
2. OpenStreetMap Nominatim API called
3. City/town name resolved automatically
4. Location update notification shows: "📍 Location Updated: **Tulsa**"
5. AI responses reference the city name: "For Tulsa, Oklahoma..."

### Progressive Web App

- **Installable** on any device (mobile, tablet, desktop)
- **Offline caching** with Workbox strategies
- **10MB cache limit** to accommodate Plotly.js bundle
- **Network-first for API calls**, cache-first for NASA imagery
- **Automatic updates** with service worker

## 🌐 Production Deployment

### Frontend (Vercel)
- **URL:** https://weatherwise.earth (also www.weatherwise.earth)
- **Auto-deployment** on git push to main branch
- **Environment variables:** VITE_API_URL for backend connection
- **Build command:** `yarn build`
- **Output:** `dist/` directory

### Backend (Render.com)
- **URL:** https://weatherwiseplanner-backend.onrender.com
- **Auto-deployment** on git push (manual deploy also available)
- **Environment variables:** GROQ_API_KEY, WEATHERWISE_DATASET
- **Free tier:** Spins down after 15 min inactivity (30-60s cold start)
- **CORS configured** for Vercel domains + preview deployments

## 📄 NASA Attribution

> Data provided by NASA Earth Observing System Data and Information System (EOSDIS) via GES DISC.

Include this credit in any deployment or presentation.

For step-by-step MERRA-2 setup, see [`docs/real-data.md`](docs/real-data.md).

## 🚧 Future Enhancements

- 🔌 **Live MERRA-2 OPeNDAP integration** — Direct NASA data queries without local NetCDF files
- 📊 **Extended historical analysis** — 30+ year trends (1980-present)
- 🌡️ **Additional weather variables** — Humidity, solar radiation, snow depth
- 🗺️ **Multi-location comparison** — Compare climate patterns across cities
- � **Native mobile apps** — iOS/Android with enhanced offline capabilities
- 🤖 **Enhanced AI** — Multi-turn conversations, follow-up questions, personalized recommendations
- 📈 **Climate change indicators** — Trend analysis showing warming/cooling patterns
- 🌐 **Multi-language support** — Internationalization for global users

## 🏆 NASA Space Apps Challenge 2024

This project was created for the NASA Space Apps Challenge, addressing the challenge of making NASA Earth observation data accessible and actionable for everyday planning decisions.

**Challenge Category:** Data Visualization & User Experience  
**NASA Data Used:** MERRA-2, GIBS/MODIS  
**Key Innovation:** AI-powered historical climate insights with sub-second responses  
**Impact:** Helps farmers, travelers, and planners make informed decisions based on decades of NASA data

## 📜 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open issues or pull requests on GitHub.

## 📧 Contact

For questions or feedback about WeatherWise Planner, please open an issue on GitHub.

---

**Built with ❤️ using NASA Earth Science data**
- 🧠 **Custom activity profiles** — let users set thresholds (e.g., trail runners vs. families) and adjust risk labels.
- 💬 **Scenario storytelling** — add AI-powered explanations (“Expect muggy afternoons: pack cooling towels”).
- ☁️ **Seasonal overlays** — compare multiple dates on the histogram for shoulder-season planning.
- 📶 **Offline-ready PWA** — allow park rangers to preload insights before heading into low-connectivity zones.

## Real-world scenarios

- 🌽 **Farmer (Nakuru, Kenya)** — “April 10–20 has an 85% historical likelihood of days above 15 °C, making the window suitable for maize planting.”
- 💒 **Event planner (Miami, FL)** — “July 20 shows a 70% historical likelihood of heat index ≥95 °F, so consider indoor or evening venues.”
- 🥾 **Backpacker (Rocky Mountains)** — “October 5 has only a 5% historical chance of snow but a 40% likelihood of high winds—pack wind protection.”

## Testing & quality

- `yarn lint` — ESLint + TypeScript checks.
- `yarn typecheck` — strict type coverage.
- `yarn build` — production bundle.
- Backend unit tests can be added under `backend/tests/` (not included yet).

## License

This project is provided for hackathon/demo purposes.
