import { useCallback, useEffect, useState } from "react";
import { MapSelector } from "./components/MapSelector";
import { ConditionToggles } from "./components/ConditionToggles";
import { ResultsPanel } from "./components/ResultsPanel";
import { ChartDisplay } from "./components/ChartDisplay";
import { ExportButton } from "./components/ExportButton";
import { SatelliteSnapshot } from "./components/SatelliteSnapshot";
import { useWeatherQuery } from "./hooks/useWeatherQuery";
import { useGeolocation } from "./hooks/useGeolocation";
import { AiChatPanel } from "./components/AiChatPanel";
import config from "../config.json";
import { WeatherConditionKey } from "./types/weather";

const defaultDate = config.ui.defaultDate;
const defaultConditions = config.ui.defaultConditions as WeatherConditionKey[];

// Date utilities - stores and retrieves year+month+day
const formatDateForInput = (dateOfYear: string): string => {
  // dateOfYear format: "MM-DD" or "YYYY-MM-DD"
  const parts = dateOfYear.split("-");
  if (parts.length === 3) {
    // Already has year
    return dateOfYear;
  }
  // Default to current year if no year specified
  const currentYear = new Date().getFullYear();
  const [month, day] = parts;
  return `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const parseDateOfYear = (value: string): string => {
  // Always store full date including year
  return value;
};

function App() {
  const geo = useGeolocation();
  const [lat, setLat] = useState<number | null>(39.7392);
  const [lon, setLon] = useState<number | null>(-104.9903);
  const [locationName, setLocationName] = useState<string | undefined>();
  const [dateOfYear, setDateOfYear] = useState(() => {
    // Convert MM-DD to YYYY-MM-DD on first load
    return formatDateForInput(defaultDate);
  });
  const [conditions, setConditions] = useState<WeatherConditionKey[]>(defaultConditions);
  const [activeCondition, setActiveCondition] = useState<WeatherConditionKey | null>(null);
  const [aiInsights, setAiInsights] = useState<string | undefined>(); // NEW: Track AI insights for export

  useEffect(() => {
    if (geo.lat != null && geo.lon != null) {
      setLat((prev: number | null) => (prev !== null ? prev : geo.lat));
      setLon((prev: number | null) => (prev !== null ? prev : geo.lon));
      setLocationName("Your location");
    }
  }, [geo.lat, geo.lon]);

  const handleMapChange = useCallback((nextLat: number, nextLon: number) => {
    setLat(nextLat);
    setLon(nextLon);
    setLocationName(undefined);
  }, []);

  const { data, error, isLoading, summaries } = useWeatherQuery({
    lat,
    lon,
    dateOfYear,
    selectedConditions: conditions,
    locationName
  });

  useEffect(() => {
    if (!activeCondition && data) {
      const firstCondition = (Object.keys(data.results) as WeatherConditionKey[]).find(
        (key) => data.results[key]
      );
      if (firstCondition) {
        setActiveCondition(firstCondition);
      }
    }
  }, [activeCondition, data]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 animate-pulse-slow" />
      
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-nasa-red to-orange-600 shadow-lg">
              <span className="text-xl">🛰️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white sm:text-xl">WeatherWise</h1>
              <p className="hidden text-xs text-blue-200 sm:block">NASA MERRA-2</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden rounded-lg bg-white/5 px-3 py-1.5 backdrop-blur lg:block">
              <p className="text-xs text-blue-200">📍 {locationName || `${lat?.toFixed(1)}°, ${lon?.toFixed(1)}°`}</p>
            </div>
            <ExportButton data={data} aiInsights={aiInsights} />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        
        {/* HERO: AI Assistant - MOST PROMINENT */}
        <div className="mb-6">
          <div className="overflow-hidden rounded-2xl border border-nasa-red/40 bg-gradient-to-br from-nasa-red/20 via-orange-600/20 to-pink-600/20 p-0.5 shadow-2xl backdrop-blur-xl">
            <div className="rounded-[15px] bg-slate-900/80 p-4 sm:p-6">
              <AiChatPanel 
                data={data} 
                summaries={summaries} 
                isQueryLoading={isLoading} 
                lat={lat} 
                lon={lon} 
                locationName={locationName} 
                dateOfYear={dateOfYear}
                onLocationChange={(newLat, newLon, newName) => {
                  setLat(newLat);
                  setLon(newLon);
                  setLocationName(newName);
                }}
                onDateChange={(newDate) => {
                  setDateOfYear(newDate);
                }}
                onConditionsChange={(newConditions) => {
                  setConditions(newConditions);
                }}
                onAiInsightChange={(insight) => {
                  setAiInsights(insight); // Track AI insights for export
                }}
              />
            </div>
          </div>
        </div>

        {/* 3-Column Grid: Map | Satellite | Controls */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Map Selector */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-lg">📍</div>
              <h2 className="text-lg font-bold text-white">Location</h2>
            </div>
            <MapSelector lat={lat} lon={lon} onChange={handleMapChange} />
          </div>

          {/* Satellite Viewer */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-lg">🛰️</div>
              <h2 className="text-lg font-bold text-white">Satellite</h2>
            </div>
            <SatelliteSnapshot lat={lat} lon={lon} dateOfYear={dateOfYear} />
          </div>

          {/* Date & Conditions */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:col-span-2 lg:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/20 text-lg">⚙️</div>
              <h2 className="text-lg font-bold text-white">Settings</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/80">Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur transition focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
                  min="2018-01-01"
                  max="2024-12-31"
                  value={formatDateForInput(dateOfYear)}
                  onChange={(event) => setDateOfYear(parseDateOfYear(event.target.value))}
                />
                <p className="mt-1 text-xs text-blue-200">Data available: 2018-2024</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/80">Risk Monitoring</label>
                <ConditionToggles selected={conditions} onChange={setConditions} />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Analysis - COMPACT CARDS */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-nasa-red to-orange-600 text-white shadow-lg">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Risk Analysis</h2>
              <p className="text-xs text-blue-200">Historical probability assessment</p>
            </div>
          </div>
          <ResultsPanel isLoading={isLoading} error={error} data={data} summaries={summaries} />
        </div>

        {/* Bottom Row: Data Quality & Historical Trends */}
        <div className="grid gap-4 lg:grid-cols-2">
          
          {/* NASA Data Quality & Attribution */}
          {data && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nasa-red/20 text-lg">�️</div>
                <h2 className="text-lg font-bold text-white">Data Quality</h2>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="mb-1 text-xs font-semibold text-nasa-red">Data Source</p>
                  <p className="text-sm text-white">NASA MERRA-2 Reanalysis</p>
                  <p className="text-xs text-blue-200/70">Modern-Era Retrospective analysis for Research and Applications, Version 2</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="mb-1 text-xs font-semibold text-nasa-red">Analysis Period</p>
                  <p className="text-sm text-white">{dateOfYear} ± 3 days</p>
                  <p className="text-xs text-blue-200/70">Historical data: 1980-2024</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="mb-1 text-xs font-semibold text-nasa-red">Resolution</p>
                  <p className="text-sm text-white">0.5° × 0.625° (≈50km)</p>
                  <p className="text-xs text-blue-200/70">Hourly temporal resolution</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="mb-1 text-xs font-semibold text-nasa-red">Attribution</p>
                  <p className="text-xs text-blue-200">Global Modeling and Assimilation Office (GMAO)</p>
                  <p className="text-xs text-blue-200/70">NASA Goddard Space Flight Center</p>
                </div>
              </div>
            </div>
          )}

          {/* Historical Trends Chart */}
          <div className={`rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl ${summaries.length === 0 ? 'lg:col-span-2' : ''}`}>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-lg">📈</div>
              <h2 className="text-lg font-bold text-white">Historical Trends</h2>
            </div>
            <ChartDisplay data={data} activeCondition={activeCondition} onActiveConditionChange={setActiveCondition} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl">
          <p className="text-xs text-white/60 sm:text-sm">
            🛰️ NASA MERRA-2 (1980-2023) • AI: Groq Llama 3.3 70B • NASA Space Apps 2025
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
