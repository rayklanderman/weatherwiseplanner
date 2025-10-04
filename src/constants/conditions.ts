import { WeatherConditionKey } from "../types/weather";
import { conditionLabel } from "../services/probabilityCalculator";

export interface ConditionMeta {
  icon: string;
  gradient: string;
  softBg: string;
  border: string;
  text: string;
}

export const CONDITION_META: Record<WeatherConditionKey, ConditionMeta> = {
  very_hot: {
    icon: "☀️",
    gradient: "from-amber-100 via-amber-50 to-orange-100",
    softBg: "bg-amber-50/70",
    border: "border-amber-200/70",
    text: "text-amber-800"
  },
  very_cold: {
    icon: "❄️",
    gradient: "from-sky-100 via-slate-50 to-slate-100",
    softBg: "bg-sky-50/70",
    border: "border-sky-200/70",
    text: "text-sky-800"
  },
  very_wet: {
    icon: "🌧️",
    gradient: "from-sky-100 via-cyan-50 to-emerald-100",
    softBg: "bg-cyan-50/70",
    border: "border-cyan-200/70",
    text: "text-cyan-800"
  },
  very_windy: {
    icon: "🌬️",
    gradient: "from-slate-100 via-slate-50 to-indigo-100",
    softBg: "bg-indigo-50/70",
    border: "border-indigo-200/70",
    text: "text-indigo-800"
  },
  very_uncomfortable: {
    icon: "🥵",
    gradient: "from-rose-100 via-amber-50 to-orange-100",
    softBg: "bg-rose-50/70",
    border: "border-rose-200/70",
    text: "text-rose-800"
  }
};

export const conditionDisplay = (key: WeatherConditionKey) => ({
  label: conditionLabel(key),
  ...CONDITION_META[key]
});
