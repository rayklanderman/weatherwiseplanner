import { useEffect, useMemo } from "react";
import Plot from "react-plotly.js";
import type { Layout } from "plotly.js";
import { WeatherConditionKey, WeatherQueryResponse } from "../types/weather";
import { conditionLabel } from "../services/probabilityCalculator";

interface ChartDisplayProps {
  data?: WeatherQueryResponse;
  activeCondition: WeatherConditionKey | null;
  onActiveConditionChange: (condition: WeatherConditionKey | null) => void;
}

type ConditionEntry = [
  WeatherConditionKey,
  NonNullable<WeatherQueryResponse["results"][WeatherConditionKey]>
];

const buildHistogram = (conditionKey: WeatherConditionKey, response: WeatherQueryResponse) => {
  const result = response.results[conditionKey];
  if (!result) return null;

  return {
    data: [
      {
        type: "histogram" as const,
        x: result.historical_values,
        marker: { color: "#0B7285" }
      }
    ],
    layout: {
      title: `${conditionLabel(conditionKey)} historical distribution`,
      margin: { t: 48, l: 40, r: 10, b: 36 },
      paper_bgcolor: "rgba(255,255,255,0.95)",
      plot_bgcolor: "rgba(255,255,255,0.95)",
      font: { family: "Inter, sans-serif" }
    }
  };
};

export const ChartDisplay = ({ data, activeCondition, onActiveConditionChange }: ChartDisplayProps) => {
  const availableConditions = useMemo<ConditionEntry[]>(() => {
    if (!data) {
      return [];
    }

    return Object.entries(data.results).filter(([, value]) => Boolean(value)) as ConditionEntry[];
  }, [data]);

  const currentCondition = useMemo(() => {
    if (!data) {
      return null;
    }

    if (activeCondition && data.results[activeCondition]) {
      return activeCondition;
    }

    return availableConditions[0]?.[0] ?? null;
  }, [activeCondition, availableConditions, data]);

  useEffect(() => {
    if (data && !activeCondition && currentCondition) {
      onActiveConditionChange(currentCondition);
    }
  }, [activeCondition, currentCondition, data, onActiveConditionChange]);

  const histogram = useMemo(() => {
    if (!data || !currentCondition) {
      return null;
    }

    return buildHistogram(currentCondition, data);
  }, [currentCondition, data]);

  if (!data || !currentCondition || !histogram) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">History at a glance</h3>
          <p className="text-sm text-slate-500">
            Compare past readings for each selected weather risk and spot long-term shifts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableConditions.map((entry: ConditionEntry) => {
            const [condition, result] = entry;
            return (
              <button
                key={condition}
                type="button"
                onClick={() => onActiveConditionChange(condition)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  condition === currentCondition
                    ? "border-brand bg-brand text-white shadow"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand-light"
                }`}
              >
                {conditionLabel(condition)}
                {result?.threshold && (
                  <span className="ml-1 text-xs text-brand-light/90">
                    · ≥{result.threshold.value} {result.threshold.unit}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>
      <div className="mt-6">
        <Plot
          data={histogram.data}
          layout={histogram.layout as Partial<Layout>}
          style={{ width: "100%", height: 360 }}
          useResizeHandler
        />
      </div>
    </section>
  );
};
