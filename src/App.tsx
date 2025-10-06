import { useCallback, useEffect, useState } from "react";
import { MapSelector } from "./components/MapSelector";
import { ConditionToggles } from "./components/ConditionToggles";
import { ResultsPanel } from "./components/ResultsPanel";
import { ChartDisplay } from "./components/ChartDisplay";
import { ExportButton } from "./components/ExportButton";
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
    <div className="relative min-h-screen bg-gradient-to-br from-nasa-blue via-slate-900 to-black">
      {/* NASA Space Background Effect */}
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
      
      <div className="relative mx-auto max-w-[1920px] px-4 py-8 sm:px-6 lg:px-12">
        {/* Premium NASA Header */}
        <header className="mb-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-nasa-blue/90 via-nasa-blue/80 to-transparent p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-nasa-red to-orange-600 shadow-lg">
                  <span className="text-3xl">🛰️</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">WeatherWise Planner</h1>
                  <p className="text-lg text-blue-200">Powered by NASA MERRA-2 Satellite Data</p>
                </div>
              </div>
              <p className="max-w-2xl text-white/90">
                Make data-driven decisions using 40+ years of validated climate intelligence. Perfect for farmers, event planners, and outdoor enthusiasts.
              </p>
            </div>
            <ExportButton data={data} />
          </div>
          
          {/* Quick Stats Bar */}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-200">Location</p>
              <p className="text-lg font-bold text-white">
                {locationName || `${lat?.toFixed(2)}°, ${lon?.toFixed(2)}°`}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-200">Date</p>
              <p className="text-lg font-bold text-white">
                {new Date(dateOfYear).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-200">Data Source</p>
              <p className="text-lg font-bold text-white">NASA MERRA-2</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-blue-200">Monitoring</p>
              <p className="text-lg font-bold text-white">{conditions.length} Risks</p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* Left Column - Inputs & Map */}
          <div className="space-y-8">
            {/* AI Assistant - PROMINENT PLACEMENT AT TOP */}
            <div className="rounded-3xl border border-nasa-red/30 bg-gradient-to-br from-nasa-red/10 to-orange-500/10 p-1 shadow-2xl">
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

            {/* Step 1: Map */}
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-nasa-blue to-blue-600 text-lg font-bold text-white shadow-lg">1</span>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">Choose Location</h2>
              </div>
              <MapSelector lat={lat} lon={lon} onChange={handleMapChange} />
            </div>

            {/* Step 2: Date & Conditions */}
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-nasa-blue to-blue-600 text-lg font-bold text-white shadow-lg">2</span>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">Select Date & Weather Risks</h2>
              </div>
              
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Date Picker */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-white drop-shadow">
                    📅 Target Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-base font-medium text-white shadow-sm transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur"
                    value={formatDateForInput(dateOfYear)}
                    onChange={(event) => setDateOfYear(parseDateOfYear(event.target.value))}
                  />
                  <p className="text-xs text-blue-200">
                    💡 We analyze ±3 days around this date for robust statistics
                  </p>
                </div>

                {/* Conditions */}
                <ConditionToggles selected={conditions} onChange={setConditions} />
              </div>
            </div>

            {/* Charts */}
            <div className="rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-nasa-blue to-blue-600 text-lg font-bold text-white shadow-lg">3</span>
                <h2 className="text-2xl font-bold text-nasa-blue">Historical Trends</h2>
              </div>
              <ChartDisplay data={data} activeCondition={activeCondition} onActiveConditionChange={setActiveCondition} />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-8">
            <div className="sticky top-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-nasa-red to-orange-600 text-lg font-bold text-white shadow-lg">4</span>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">Risk Analysis</h2>
              </div>
              <ResultsPanel isLoading={isLoading} error={error} data={data} summaries={summaries} />
            </div>
          </div>
        </div>

        <footer className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
          <p className="text-sm text-white/80">
            🛰️ Data: NASA MERRA-2 (1980-2023) • AI: Groq Llama 3.3 70B • Built for NASA Space Apps 2025
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
