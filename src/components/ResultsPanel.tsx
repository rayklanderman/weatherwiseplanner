import clsx from "clsx";
import { WeatherQueryResponse, WeatherSummary, WeatherConditionKey } from "../types/weather";
import { conditionDisplay } from "../constants/conditions";
import { RiskGauge } from "./RiskGauge";

interface ResultsPanelProps {
  isLoading: boolean;
  error?: string;
  data?: WeatherQueryResponse;
  summaries: WeatherSummary[];
}

const probabilityPalette = (probability: number) => {
  if (probability >= 50) {
    return {
      badge: "bg-rose-500",
      stroke: "stroke-rose-500"
    };
  }
  if (probability >= 25) {
    return {
      badge: "bg-amber-400",
      stroke: "stroke-amber-400"
    };
  }
  if (probability >= 10) {
    return {
      badge: "bg-emerald-400",
      stroke: "stroke-emerald-400"
    };
  }
  return {
    badge: "bg-slate-300",
    stroke: "stroke-slate-300"
  };
};

export const ResultsPanel = ({ isLoading, error, data, summaries }: ResultsPanelProps) => {
  if (isLoading) {
    return (
      <section className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/80 p-6 text-center shadow-lg ring-1 ring-slate-200/60 backdrop-blur">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="mt-4 text-sm text-slate-600">Crunching historical patterns…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-rose-200/70 bg-rose-50/80 p-6 shadow-lg ring-1 ring-rose-200/60 backdrop-blur">
        <h2 className="text-lg font-semibold text-rose-700">We hit a snag</h2>
        <p className="mt-2 text-sm text-rose-600">{error}</p>
        <p className="mt-4 text-xs text-rose-500">Try adjusting your location or reloading.</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-2xl border border-white/60 bg-white/80 p-6 text-center shadow-lg ring-1 ring-slate-200/60 backdrop-blur">
        <h2 className="text-lg font-semibold text-slate-800">Select a location to begin</h2>
        <p className="mt-2 text-sm text-slate-600">
          Drop a pin on the map, choose a date, and pick the weather risks you care about. We’ll show the
          NASA-derived odds instantly.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Risk Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(data.results) as Array<[
          WeatherConditionKey,
          (typeof data.results)[WeatherConditionKey]
        ]>).map(([condition, result]) => {
          if (!result || result.probability_percent == null) return null;
          const meta = conditionDisplay(condition);
          const palette = probabilityPalette(result.probability_percent);
          return (
            <div
              key={condition}
              className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/5 p-4 shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-white/40"
            >
              {/* Icon & Title */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-lg shadow-md",
                      meta.softBg,
                      meta.text
                    )}
                  >
                    {meta.icon}
                  </span>
                  <h3 className="text-sm font-bold text-white drop-shadow">{meta.label}</h3>
                </div>
                <RiskGauge
                  value={result.probability_percent}
                  strokeClass={palette.stroke}
                  label={meta.label}
                />
              </div>

              {/* Probability */}
              <div className="mb-2">
                <span
                  className={clsx(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white drop-shadow",
                    palette.badge
                  )}
                >
                  {result.probability_percent}% chance
                </span>
              </div>

              {/* Details (compact) */}
              <div className="space-y-1 text-xs text-white/80">
                {result.threshold && (
                  <p>Threshold: {result.threshold.value} {result.threshold.unit}</p>
                )}
                {result.trend && (
                  <p className="flex items-center gap-1 text-blue-200">
                    <span>📈</span>
                    <span className="truncate">{result.trend}</span>
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className={clsx("h-full transition-all duration-500", palette.badge)}
                  style={{ width: `${result.probability_percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Plain Language Summary - Appears AFTER risk cards */}
      {summaries.length > 0 && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">💬</span>
            <h3 className="text-sm font-semibold text-white drop-shadow">Plain Language Summary</h3>
          </div>
          <div className="space-y-2">
            {summaries.map((summary) => (
              <div key={summary.label} className="rounded-lg bg-white/5 p-3">
                <p className="mb-1 text-sm font-semibold text-white">{summary.label}</p>
                <p className="text-xs text-blue-100">{summary.friendlyMessage}</p>
                {summary.trend && (
                  <p className="mt-1 text-xs text-emerald-300">
                    <span className="font-medium">Trend:</span> {summary.trend}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
