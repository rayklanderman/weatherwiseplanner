import config from "../../config.json";
import { WeatherQueryResponse, WeatherSummary } from "../types/weather";

const API_BASE = config.api.baseUrl ?? "/api";

export interface PlannerInsightPayload {
  query: WeatherQueryResponse["query"];
  results: WeatherQueryResponse["results"];
  metadata: WeatherQueryResponse["metadata"];
  summaries?: WeatherSummary[];
  userPrompt?: string;
}

export interface PlannerInsightResponse {
  insight: string;
}

export const generatePlannerInsight = async (
  payload: PlannerInsightPayload
): Promise<PlannerInsightResponse> => {
  const response = await fetch(`${API_BASE}/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Insight generation failed (${response.status}): ${message}`);
  }

  const data = (await response.json()) as PlannerInsightResponse;

  if (!data?.insight) {
    throw new Error("Insight generation returned no content.");
  }

  return data;
};
