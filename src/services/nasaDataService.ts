import config from "../../config.json";
import { WeatherConditionKey, WeatherQueryInput, WeatherQueryResponse } from "../types/weather";

const API_BASE = config.api.baseUrl ?? "/api";

const buildQueryPayload = (
  lat: number,
  lon: number,
  dateOfYear: string,
  conditions: WeatherConditionKey[],
  locationName?: string
): WeatherQueryInput => ({
  location: { lat, lon, name: locationName },
  date_of_year: dateOfYear,
  conditions
});

export const queryWeatherRisk = async (
  lat: number,
  lon: number,
  dateOfYear: string,
  conditions: WeatherConditionKey[],
  locationName?: string
): Promise<WeatherQueryResponse> => {
  const payload = buildQueryPayload(lat, lon, dateOfYear, conditions, locationName);
  const response = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Weather risk query failed (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as WeatherQueryResponse;
};

export const loadDemoResponse = async (): Promise<WeatherQueryResponse> => {
  const response = await fetch("/mock-data/mockResponse.json");
  if (!response.ok) {
    throw new Error("Unable to load demo data");
  }
  return (await response.json()) as WeatherQueryResponse;
};
