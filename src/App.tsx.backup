import { useCallback, useEffect, useMemo, useState } from "react";
import { MapSelector } from "./components/MapSelector";
import { ConditionToggles } from "./components/ConditionToggles";
import { ResultsPanel } from "./components/ResultsPanel";
import { ChartDisplay } from "./components/ChartDisplay";
import { ExportButton } from "./components/ExportButton";
import { useWeatherQuery } from "./hooks/useWeatherQuery";
import { useGeolocation } from "./hooks/useGeolocation";
import { InsightsStrip } from "./components/InsightsStrip";
import { PlannerTips } from "./components/PlannerTips";
import { SatelliteSnapshot } from "./components/SatelliteSnapshot";
import { AiInsightPanel } from "./components/AiInsightPanel";
import config from "../config.json";
import { WeatherConditionKey } from "./types/weather";

const defaultDate = config.ui.defaultDate;
const defaultConditions = config.ui.defaultConditions as WeatherConditionKey[];

const formatDateForInput = (dateOfYear: string): string => {
  const [month, day] = dateOfYear.split("-");
  return `2024-${month}-${day}`;
};

const parseDateOfYear = (value: string): string => {
  const [, month, day] = value.split("-");
  return `${month}-${day}`;
};

function App() {
  const geo = useGeolocation();
  const [lat, setLat] = useState<number | null>(39.7392);
  const [lon, setLon] = useState<number | null>(-104.9903);
  const [locationName, setLocationName] = useState<string | undefined>();
  const [dateOfYear, setDateOfYear] = useState(defaultDate);
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

  const conditionChips = useMemo(() => [...conditions].sort(), [conditions]);

  return (
    <div className="relative min-h-screen bg-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center" aria-hidden>
        <div className="h-[420px] w-[120%] max-w-5xl -translate-y-1/3 rounded-full bg-[radial-gradient(circle_at_top,rgba(79,195,214,0.45),rgba(11,114,133,0)_65%)] opacity-60 blur-3xl animate-pulse-slow" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
  <header className="relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl ring-1 ring-slate-200/60 backdrop-blur">
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-brand/20 via-sky-100/40 to-transparent blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-12 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-100/50 via-sky-50 to-transparent blur-3xl" />
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">WeatherWise Planner</h1>
              <p className="text-sm text-slate-600">
                Plan outdoor adventures months ahead using NASA’s historical climate intelligence.
              </p>
            </div>
            <ExportButton data={data} />
          </div>
          <div className="relative flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-slate-900/5 px-3 py-1 font-medium text-slate-700 ring-1 ring-slate-200/60">
              Date: {dateOfYear}
            </span>
            {conditionChips.map((condition) => (
              <span
                key={condition}
                className="rounded-full bg-brand/10 px-3 py-1 font-medium text-brand-dark ring-1 ring-brand/20"
              >
                {condition.replace(/_/g, " ")}
              </span>
            ))}
          </div>
          <InsightsStrip data={data} summaries={summaries} isLoading={isLoading} />
          <p className="text-xs text-slate-500">
            Data provided by NASA Earth Observing System Data and Information System (EOSDIS) via GES DISC.
          </p>
        </header>

  <PlannerTips data={data} summaries={summaries} isLoading={isLoading} />

  <AiInsightPanel data={data} summaries={summaries} isQueryLoading={isLoading} />

        <main className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-8">
            <MapSelector lat={lat} lon={lon} onChange={handleMapChange} />

            <SatelliteSnapshot lat={lat} lon={lon} dateOfYear={dateOfYear} />

            <section className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg ring-1 ring-slate-200/60 backdrop-blur">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-800">Choose a date</h2>
                  <p className="text-sm text-slate-500">
                    Select the day of year you want to explore. We’ll crunch ±3 days around it for robust stats.
                  </p>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200/70 bg-white px-4 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light"
                    value={formatDateForInput(dateOfYear)}
                    onChange={(event) => setDateOfYear(parseDateOfYear(event.target.value))}
                  />
                </div>

                <ConditionToggles selected={conditions} onChange={setConditions} />
              </div>
            </section>

            <ChartDisplay data={data} activeCondition={activeCondition} onActiveConditionChange={setActiveCondition} />
          </div>

          <ResultsPanel isLoading={isLoading} error={error} data={data} summaries={summaries} />
        </main>

        <footer className="pb-8 text-center text-xs text-slate-500">
          Built for hackathon demos. Upgrade ideas: connect live to MERRA-2 via OPeNDAP, add seasonal comparisons, and
          personalize thresholds for different activity types.
        </footer>
      </div>
    </div>
  );
}

export default App;
