import { useMemo } from "react";
import clsx from "clsx";
import {
  WeatherConditionKey,
  WeatherConditionResult,
  WeatherQueryResponse,
  WeatherSummary
} from "../types/weather";
import { CONDITION_META } from "../constants/conditions";
import { conditionLabel } from "../services/probabilityCalculator";

interface InsightsStripProps {
  data?: WeatherQueryResponse;
  summaries: WeatherSummary[];
  isLoading: boolean;
}

type InsightCard = {
  key: string;
  title: string;
  value?: string;
  description?: string;
  icon: string;
  accent: string;
  highlight?: boolean;
  skeleton?: boolean;
};

const baseCards: InsightCard[] = [
  {
    key: "choose-location",
    title: "Choose a location",
    value: "Drop a pin",
    description: "We’ll analyze ±3 days of NASA climate data",
    icon: "🗺️",
    accent: "from-slate-100 via-white to-slate-50"
  },
  {
    key: "select-risks",
    title: "Select risks",
    value: "Heat, rain, wind…",
    description: "Toggle the stressors that matter for your plans",
    icon: "🎯",
    accent: "from-brand/10 via-sky-50 to-brand/5"
  },
  {
    key: "view-outlook",
    title: "Review outlook",
    value: "Plain-language summary",
    description: "We surface the most actionable climate signals",
    icon: "📈",
    accent: "from-emerald-50 via-white to-slate-50"
  }
];

export const InsightsStrip = ({ data, summaries, isLoading }: InsightsStripProps) => {
  const cards = useMemo<InsightCard[]>(() => {
    if (isLoading) {
      return baseCards.map((card) => ({ ...card, skeleton: true }));
    }

    if (!data) {
      return baseCards;
    }

    const validResults: Array<[WeatherConditionKey, WeatherConditionResult]> = [];
    for (const key of Object.keys(data.results) as WeatherConditionKey[]) {
      const result = data.results[key];
      if (result) {
        validResults.push([key, result]);
      }
    }

    if (validResults.length === 0) {
      return baseCards;
    }

    const sorted = [...validResults].sort(
      (a, b) => b[1].probability_percent - a[1].probability_percent
    );
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];
    const primarySummary = summaries[0];

    const cardsFromData: InsightCard[] = [];

    if (highest) {
      const meta = CONDITION_META[highest[0]];
      cardsFromData.push({
        key: "highest-risk",
        title: "Highest risk",
        value: `${highest[1].probability_percent}% chance`,
        description: conditionLabel(highest[0]),
        icon: meta.icon,
        accent: meta.gradient,
        highlight: true
      });
    }

    if (lowest) {
      const meta = CONDITION_META[lowest[0]];
      cardsFromData.push({
        key: "lowest-risk",
        title: "Most stable",
        value: conditionLabel(lowest[0]),
        description: `${lowest[1].probability_percent}% probability`,
        icon: meta.icon,
        accent: meta.gradient
      });
    }

    cardsFromData.push(
      primarySummary
        ? {
            key: "summary",
            title: primarySummary.label,
            value: primarySummary.friendlyMessage,
            description: primarySummary.trend ?? "Climate signal detected",
            icon: "🛰️",
            accent: "from-brand/10 via-slate-50 to-brand/5"
          }
        : {
            key: "coverage",
            title: "Data coverage",
            value: data.metadata.time_range,
            description: data.metadata.data_source,
            icon: "🛰️",
            accent: "from-brand/10 via-slate-50 to-brand/5"
          }
    );

    return cardsFromData;
  }, [data, summaries, isLoading]);

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Key insights">
      {cards.map((card) => (
        <article
          key={card.key}
          className={clsx(
            "group relative overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-4 shadow-sm ring-1 ring-inset ring-slate-200/50 backdrop-blur transition",
            card.highlight ? "hover:-translate-y-1 hover:shadow-lg" : "hover:-translate-y-0.5 hover:shadow-md"
          )}
        >
          <div
            aria-hidden
            className={clsx(
              "pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br opacity-40 transition group-hover:opacity-70",
              card.accent
            )}
          />
          <div className="relative flex items-start gap-3">
            <span
              className={clsx(
                "flex h-10 w-10 items-center justify-center rounded-full text-xl shadow-inner",
                card.skeleton ? "bg-slate-100/70 text-slate-300" : "bg-white/70 text-slate-700"
              )}
            >
              {card.icon}
            </span>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-800">{card.title}</h3>
              {card.skeleton ? (
                <div className="space-y-2">
                  <div className="h-3 w-32 rounded-full bg-slate-100 animate-pulse-slow" />
                  <div className="h-2 w-24 rounded-full bg-slate-100 animate-pulse-slow" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-900">{card.value}</p>
                  <p className="text-xs text-slate-600">{card.description}</p>
                </>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};
