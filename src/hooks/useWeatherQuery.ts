import { useCallback, useEffect, useMemo, useState } from "react";
import config from "../../config.json";
import { loadDemoResponse, queryWeatherRisk } from "../services/nasaDataService";
import { buildSummaries } from "../services/probabilityCalculator";
import { WeatherConditionKey, WeatherQueryResponse, WeatherSummary } from "../types/weather";

interface UseWeatherQueryParams {
  lat: number | null;
  lon: number | null;
  dateOfYear: string;
  selectedConditions: WeatherConditionKey[];
  locationName?: string;
}

interface UseWeatherQueryResult {
  isLoading: boolean;
  data?: WeatherQueryResponse;
  summaries: WeatherSummary[];
  error?: string;
  refetch: () => Promise<void>;
}

export const useWeatherQuery = ({
  lat,
  lon,
  dateOfYear,
  selectedConditions,
  locationName
}: UseWeatherQueryParams): UseWeatherQueryResult => {
  const [data, setData] = useState<WeatherQueryResponse>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const envDemoMode = typeof import.meta.env.VITE_WEATHERWISE_DEMO_MODE !== "undefined"
    ? import.meta.env.VITE_WEATHERWISE_DEMO_MODE === "true"
    : undefined;

  const demoMode = envDemoMode ?? config.data.demoMode;

  const fetchData = useCallback(async () => {
    if (lat == null || lon == null || selectedConditions.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const response = demoMode
        ? await loadDemoResponse()
        : await queryWeatherRisk(lat, lon, dateOfYear, selectedConditions, locationName);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [dateOfYear, demoMode, lat, lon, locationName, selectedConditions]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const summaries = useMemo(() => buildSummaries(data), [data]);

  return {
    isLoading,
    data,
    summaries,
    error,
    refetch: fetchData
  };
};
