import { useCallback, useState } from "react";
import {
  PlannerInsightPayload,
  generatePlannerInsight
} from "../services/aiInsightsService";

interface UseAiInsightsResult {
  insight?: string;
  isLoading: boolean;
  error?: string;
  generateInsight: (payload: PlannerInsightPayload) => Promise<void>;
  reset: () => void;
}

export const useAiInsights = (): UseAiInsightsResult => {
  const [insight, setInsight] = useState<string>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const generateInsight = useCallback(async (payload: PlannerInsightPayload) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await generatePlannerInsight(payload);
      setInsight(response.insight.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error calling insights API.");
      setInsight(undefined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setInsight(undefined);
    setError(undefined);
    setIsLoading(false);
  }, []);

  return {
    insight,
    isLoading,
    error,
    generateInsight,
    reset
  };
};
