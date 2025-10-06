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
      {/* Animated background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40 animate-pulse-slow" />
      
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[2000px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nasa-red to-orange-600 shadow-lg">
              <span className="text-2xl">🛰️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WeatherWise Planner</h1>
              <p className="text-xs text-blue-200">NASA MERRA-2 Climate Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden rounded-lg bg-white/5 px-4 py-2 backdrop-blur md:block">
              <p className="text-xs text-blue-200">Location</p>
              <p className="text-sm font-semibold text-white">
                {locationName || `${lat?.toFixed(2)}°, ${lon?.toFixed(2)}°`}
              </p>
            </div>
            <div className="hidden rounded-lg bg-white/5 px-4 py-2 backdrop-blur md:block">
              <p className="text-xs text-blue-200">Date</p>
              <p className="text-sm font-semibold text-white">
                {new Date(dateOfYear).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <ExportButton data={data} />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-[2000px] px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* LEFT SIDEBAR - Controls */}
          <div className="space-y-6 lg:col-span-4">
            
            {/* AI Assistant - FEATURED */}
            <div className="group relative overflow-hidden rounded-3xl border border-nasa-red/30 bg-gradient-to-br from-nasa-red/20 to-orange-500/20 p-1 shadow-2xl backdrop-blur-xl transition-all hover:scale-[1.02]">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-nasa-red/20 blur-3xl" />
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
              />
            </div>

            {/* Interactive Map */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                  <span className="text-lg">📍</span>
                </div>
                <h2 className="text-xl font-bold text-white drop-shadow-lg">Select Location</h2>
              </div>
              <MapSelector lat={lat} lon={lon} onChange={handleMapChange} />
            </div>

            {/* Date & Risk Selector */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                  <span className="text-lg">📅</span>
                </div>
                <h2 className="text-xl font-bold text-white drop-shadow-lg">Date & Risks</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white drop-shadow">
                    Target Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-white shadow-sm backdrop-blur transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                    value={formatDateForInput(dateOfYear)}
                    onChange={(event) => setDateOfYear(parseDateOfYear(event.target.value))}
                  />
                  <p className="mt-2 text-xs text-blue-200">±3 days analyzed for accuracy</p>
                </div>

                <ConditionToggles selected={conditions} onChange={setConditions} />
              </div>
            </div>
          </div>

          {/* CENTER - Main Content */}
          <div className="space-y-6 lg:col-span-8">
            
            {/* Hero Section - Satellite & Risk Dashboard */}
            <div className="grid gap-6 lg:grid-cols-2">
              
              {/* Satellite Viewer */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-1 shadow-2xl backdrop-blur-xl">
                <div className="rounded-[22px] bg-slate-900/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl">🛰️</span>
                    <h2 className="text-lg font-bold text-white drop-shadow-lg">Live Satellite View</h2>
                  </div>
                  <SatelliteSnapshot lat={lat} lon={lon} dateOfYear={dateOfYear} />
                </div>
              </div>

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 backdrop-blur-xl transition-all hover:scale-105">
                  <div className="mb-2 text-3xl">✅</div>
                  <p className="text-xs text-emerald-200">Data Source</p>
                  <p className="text-lg font-bold text-white">NASA MERRA-2</p>
                  <p className="text-xs text-emerald-300">1980-2023</p>
                </div>
                
                <div className="group rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 backdrop-blur-xl transition-all hover:scale-105">
                  <div className="mb-2 text-3xl">📊</div>
                  <p className="text-xs text-blue-200">Monitoring</p>
                  <p className="text-lg font-bold text-white">{conditions.length} Risks</p>
                  <p className="text-xs text-blue-300">Active tracking</p>
                </div>
                
                <div className="group rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4 backdrop-blur-xl transition-all hover:scale-105">
                  <div className="mb-2 text-3xl">🌍</div>
                  <p className="text-xs text-purple-200">Coverage</p>
                  <p className="text-lg font-bold text-white">Global</p>
                  <p className="text-xs text-purple-300">220+ countries</p>
                </div>
                
                <div className="group rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4 backdrop-blur-xl transition-all hover:scale-105">
                  <div className="mb-2 text-3xl">⚡</div>
                  <p className="text-xs text-orange-200">AI Speed</p>
                  <p className="text-lg font-bold text-white">&lt;1 sec</p>
                  <p className="text-xs text-orange-300">Groq powered</p>
                </div>
              </div>
            </div>

            {/* Risk Analysis Dashboard */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-nasa-red to-orange-600 text-white shadow-lg">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">Risk Analysis</h2>
                    <p className="text-sm text-blue-200">Historical probability assessment</p>
                  </div>
                </div>
              </div>
              <ResultsPanel isLoading={isLoading} error={error} data={data} summaries={summaries} />
            </div>

            {/* Historical Trends Chart */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg">
                  <span className="text-lg">📈</span>
                </div>
                <h2 className="text-xl font-bold text-white drop-shadow-lg">Historical Trends</h2>
              </div>
              <ChartDisplay data={data} activeCondition={activeCondition} onActiveConditionChange={setActiveCondition} />
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
          <p className="text-sm text-white/80">
            🛰️ Powered by NASA MERRA-2 (1980-2023) • AI: Groq Llama 3.3 70B • Built for NASA Space Apps 2025
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
