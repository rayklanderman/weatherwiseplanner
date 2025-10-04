import { WeatherConditionKey, WeatherQueryResponse, WeatherSummary } from "../types/weather";

const CONDITION_LABELS: Record<WeatherConditionKey, string> = {
  very_hot: "Extreme Heat",
  very_cold: "Hard Freeze",
  very_wet: "Heavy Rain",
  very_windy: "High Winds",
  very_uncomfortable: "Muggy Heat"
};

const SUMMARY_TEMPLATES = {
  high: (label: string, probability: number) =>
    `${probability}% odds of ${label.toLowerCase()} for this date window—build contingencies.`,
  medium: (label: string, probability: number) =>
    `${label} shows up about ${probability}% of the time across the record.`,
  low: (label: string, probability: number) =>
    `${label} is historically uncommon here (~${probability}%).`
};

export const buildSummaries = (response?: WeatherQueryResponse): WeatherSummary[] => {
  if (!response) return [];

  return (Object.entries(response.results) as [WeatherConditionKey, typeof response.results[keyof typeof response.results]][])
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => {
      if (!value) return null;
      const probability = value.probability_percent;
      const label = CONDITION_LABELS[key];
      const tier = probability >= 40 ? "high" : probability >= 15 ? "medium" : "low";
      const friendlyMessage = SUMMARY_TEMPLATES[tier](label, probability);
      return {
        label,
        probability,
        friendlyMessage,
        trend: value.trend
      } satisfies WeatherSummary;
    })
    .filter(Boolean) as WeatherSummary[];
};

export const conditionLabel = (condition: WeatherConditionKey): string => CONDITION_LABELS[condition];
