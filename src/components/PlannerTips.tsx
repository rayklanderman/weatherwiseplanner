import clsx from "clsx";
import {
  WeatherConditionKey,
  WeatherQueryResponse,
  WeatherSummary
} from "../types/weather";
import { CONDITION_META } from "../constants/conditions";
import { conditionLabel } from "../services/probabilityCalculator";

interface PlannerTipsProps {
  data?: WeatherQueryResponse;
  summaries: WeatherSummary[];
  isLoading: boolean;
}

type Tip = {
  key: string;
  title: string;
  body: string;
  icon?: string;
  accent?: string;
};

const probabilityFor = (
  data: WeatherQueryResponse | undefined,
  condition: WeatherConditionKey
): number | undefined => data?.results[condition]?.probability_percent;

const buildConditionTip = (
  condition: WeatherConditionKey,
  probability: number
): Tip | null => {
  const meta = CONDITION_META[condition];
  const label = conditionLabel(condition);

  if (probability >= 40) {
    const guidance: Record<WeatherConditionKey, string> = {
      very_hot: "Shift headline activities to cooler hours and expand hydration support.",
      very_cold: "Secure heating, cover plumbing, and brief vendors on freeze protocols.",
      very_wet: "Book covered staging, reinforce drainage routes, and alert crews to slick surfaces.",
      very_windy: "Anchor signage, avoid tall staging, and prep wind-rated canopies.",
      very_uncomfortable: "Increase shaded lounges, add fans/misters, and lighten dress expectations."
    };
    return {
      key: `${condition}-high`,
      title: `${label} is the top risk`,
      body: guidance[condition],
      icon: meta.icon,
      accent: meta.gradient
    };
  }

  if (probability >= 20) {
    const guidance: Record<WeatherConditionKey, string> = {
      very_hot: "Plan hydration checkpoints and message guests about sun protection.",
      very_cold: "Schedule warm-up shelters and monitor overnight icing.",
      very_wet: "Stage ponchos and flexible indoor options for passing showers.",
      very_windy: "Swap delicate décor for wind-resilient fixtures.",
      very_uncomfortable: "Add airflow and break areas to keep guests comfortable."
    };
    return {
      key: `${condition}-medium`,
      title: `${label} is a recurring factor`,
      body: guidance[condition],
      icon: meta.icon,
      accent: meta.gradient
    };
  }

  if (probability >= 5) {
    const guidance: Record<WeatherConditionKey, string> = {
      very_hot: "Keep contingency shade on standby—heat spikes still occur.",
      very_cold: "Monitor overnight lows in case of surprise chills.",
      very_wet: "Have towels and drying stations ready just in case.",
      very_windy: "Brief crew on securing loose items if gusts pick up.",
      very_uncomfortable: "Prepare cooling towels for high humidity moments."
    };
    return {
      key: `${condition}-low`,
      title: `${label} occasionally appears`,
      body: guidance[condition],
      icon: meta.icon,
      accent: meta.gradient
    };
  }

  return null;
};

export const PlannerTips = ({ data, summaries, isLoading }: PlannerTipsProps) => {
  if (isLoading) {
    return (
      <section className="grid gap-3 sm:grid-cols-2" aria-label="Planner preparation tips">
        {[0, 1].map((index) => (
          <article
            key={index}
            className="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm ring-1 ring-inset ring-slate-200/50 backdrop-blur"
          >
            <div className="space-y-2">
              <div className="h-3 w-32 rounded-full bg-slate-100 animate-pulse-slow" />
              <div className="h-3 w-48 rounded-full bg-slate-100 animate-pulse-slow" />
              <div className="h-3 w-40 rounded-full bg-slate-100 animate-pulse-slow" />
            </div>
          </article>
        ))}
      </section>
    );
  }

  if (!data) {
    return (
      <section
        className="rounded-2xl border border-white/60 bg-white/70 p-5 text-sm text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200/60 backdrop-blur"
        aria-label="Planner preparation tips"
      >
        Drop a pin and pick your date to unlock planner guidance powered by decades of NASA climate records.
      </section>
    );
  }

  const tips: Tip[] = [];

  const orderedConditions: WeatherConditionKey[] = [
    "very_wet",
    "very_hot",
    "very_uncomfortable",
    "very_windy",
    "very_cold"
  ];

  for (const condition of orderedConditions) {
    const probability = probabilityFor(data, condition);
    if (probability == null) continue;
    const tip = buildConditionTip(condition, probability);
    if (tip) {
      tips.push(tip);
    }
  }

  if (summaries.length > 0) {
    const leading = summaries[0];
    tips.unshift({
      key: "summary-lead",
      title: leading.label,
      body: leading.friendlyMessage,
      icon: "🛰️",
      accent: "from-brand/10 via-sky-50 to-brand/5"
    });
  }

  tips.push({
    key: "metadata",
    title: "Climate baseline",
    body: `Analysis spans ${data.metadata.time_range}. Cite ${data.metadata.data_source} when sharing.`,
    icon: "📚",
    accent: "from-slate-100 via-white to-slate-50"
  });

  return (
    <section className="grid gap-3 sm:grid-cols-2" aria-label="Planner preparation tips">
      {tips.map((tip) => (
        <article
          key={tip.key}
          className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm ring-1 ring-inset ring-slate-200/60 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
        >
          {tip.accent && (
            <span
              aria-hidden
              className={clsx(
                "pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br opacity-40",
                tip.accent
              )}
            />
          )}
          <div className="relative flex items-start gap-3">
            {tip.icon && (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-lg shadow-inner" aria-hidden>
                {tip.icon}
              </span>
            )}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-800">{tip.title}</h3>
              <p className="text-sm text-slate-600">{tip.body}</p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};
