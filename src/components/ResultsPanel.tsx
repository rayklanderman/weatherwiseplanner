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
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Historical outlook</h2>
            <p className="text-sm text-slate-500">
              {data.query.location.name ?? "Selected location"} · {data.query.date_of_year}
            </p>
          </div>
          <div className="text-xs text-slate-500 text-right space-y-1">
            <p>{data.metadata.data_source}</p>
            <p>{data.metadata.time_range}</p>
            {data.metadata.dataset_name && <p>Dataset: {data.metadata.dataset_name}</p>}
            {typeof data.metadata.window_days !== "undefined" && (
              <p>Window ±{data.metadata.window_days} days</p>
            )}
            {typeof data.metadata.samples !== "undefined" && <p>{data.metadata.samples} samples</p>}
            {data.metadata.grid_point && (
              <p>
                Grid cell {data.metadata.grid_point.lat.toFixed(2)}, {" "}
                {data.metadata.grid_point.lon.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
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
                className="group relative overflow-hidden rounded-2xl border border-slate-100/60 bg-white/80 p-5 shadow-sm ring-1 ring-inset ring-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div
                  aria-hidden
                  className={clsx(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-80",
                    meta.gradient
                  )}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={clsx(
                        "flex h-10 w-10 items-center justify-center rounded-full text-xl shadow-inner",
                        meta.softBg,
                        meta.text
                      )}
                      aria-hidden
                    >
                      {meta.icon}
                    </span>
                    <dt className="text-base font-semibold text-slate-800">{meta.label}</dt>
                  </div>
                  <RiskGauge
                    value={result.probability_percent}
                    strokeClass={palette.stroke}
                    label={meta.label}
                  />
                </div>
                <dd className="relative mt-3 space-y-3 text-sm text-slate-600">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white",
                      palette.badge
                    )}
                  >
                    {result.probability_percent}% historical likelihood
                  </span>
                  {result.threshold && (
                    <p>
                      Threshold: <strong>{result.threshold.value}</strong> {result.threshold.unit}
                    </p>
                  )}
                  {result.trend && <p className="font-medium text-brand-dark">Trend: {result.trend}</p>}
                  {result.description && (
                    <p className="text-xs text-slate-500">{result.description}</p>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {summaries.length > 0 && (
        <div className="rounded-2xl border border-brand/30 bg-brand/5 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-brand-dark">Plain-language summary</h3>
          <ul className="mt-4 space-y-2 text-sm text-brand-dark/90">
            {summaries.map((summary) => (
              <li key={summary.label} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-brand" aria-hidden />
                <div>
                  <p className="font-medium">{summary.label}</p>
                  <p className="text-sm">{summary.friendlyMessage}</p>
                  {summary.trend && <p className="text-xs text-brand-dark/70">Trend: {summary.trend}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
