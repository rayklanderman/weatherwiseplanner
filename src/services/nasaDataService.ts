import { API_BASE_URL } from "../config/api";
import { WeatherConditionKey, WeatherQueryInput, WeatherQueryResponse } from "../types/weather";

const buildQueryPayload = (
  lat: number,
  lon: number,
  dateOfYear: string,
  conditions: WeatherConditionKey[],
  locationName?: string
): WeatherQueryInput => {
  // Convert YYYY-MM-DD to MM-DD for backend compatibility
  const parts = dateOfYear.split("-");
  const formattedDate = parts.length === 3 ? `${parts[1]}-${parts[2]}` : dateOfYear;
  
  return {
    location: { lat, lon, name: locationName },
    date_of_year: formattedDate,
    conditions
  };
};

export const queryWeatherRisk = async (
  lat: number,
  lon: number,
  dateOfYear: string,
  conditions: WeatherConditionKey[],
  locationName?: string
): Promise<WeatherQueryResponse> => {
  const payload = buildQueryPayload(lat, lon, dateOfYear, conditions, locationName);
  const response = await fetch(`${API_BASE_URL}/query`, {
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
