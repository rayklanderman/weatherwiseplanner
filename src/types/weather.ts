export type WeatherConditionKey =
  | "very_hot"
  | "very_cold"
  | "very_wet"
  | "very_windy"
  | "very_uncomfortable";

export interface WeatherThreshold {
  value: number;
  unit: string;
}

export interface WeatherConditionResult {
  probability_percent: number;
  threshold: WeatherThreshold;
  historical_values: number[];
  trend: string;
}

export interface WeatherQueryInput {
  location: {
    lat: number;
    lon: number;
    name?: string;
  };
  date_of_year: string; // MM-DD
  conditions: WeatherConditionKey[];
}

export interface WeatherQueryResponse {
  query: WeatherQueryInput;
  results: Partial<Record<WeatherConditionKey, WeatherConditionResult>>;
  metadata: {
    data_source: string;
    time_range: string;
    units: string;
    generated_at: string;
  };
}

export interface WeatherSummary {
  label: string;
  probability: number;
  friendlyMessage: string;
  trend?: string;
}
