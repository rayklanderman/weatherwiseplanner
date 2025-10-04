import { useEffect, useMemo, useState } from "react";
import { useAiInsights } from "../hooks/useAiInsights";
import { WeatherQueryResponse, WeatherSummary } from "../types/weather";

interface AiInsightPanelProps {
  data?: WeatherQueryResponse;
  summaries: WeatherSummary[];
  isQueryLoading: boolean;
}

const DEFAULT_PROMPT = "Focus on schedule adjustments, resource planning, and risk mitigation for event operations.";

const fallbackInsightMessage =
  "Generate an AI briefing once you have climate probabilities. The assistant will summarize NASA-based risks and action items.";

export const AiInsightPanel = ({ data, summaries, isQueryLoading }: AiInsightPanelProps) => {
  const { insight, isLoading, error, generateInsight, reset } = useAiInsights();
  const [userPrompt, setUserPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const dataSignature = useMemo(() => {
    if (!data) {
      return "none";
    }
    return JSON.stringify({
      query: data.query,
      results: data.results,
      metadata: data.metadata
    });
  }, [data]);

  useEffect(() => {
    reset();
    setUserPrompt("");
    setHasGenerated(false);
    setCopied(false);
  }, [dataSignature, reset]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleGenerate = async () => {
    if (!data || isLoading) {
      return;
    }

    await generateInsight({
      query: data.query,
      results: data.results,
      metadata: data.metadata,
      summaries,
      userPrompt: userPrompt.trim() ? userPrompt.trim() : undefined
    });
    setHasGenerated(true);
  };

  const handleCopy = async () => {
    if (!insight) {
      return;
    }

    try {
      await navigator.clipboard.writeText(insight);
      setCopied(true);
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _err
    ) {
      setCopied(false);
    }
  };

  const disabled = !data || isQueryLoading || isLoading;
  const buttonLabel = hasGenerated ? "Regenerate briefing" : "Generate AI briefing";

  return (
    <section className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg ring-1 ring-slate-200/60 backdrop-blur">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-800">AI planner briefing</h2>
            <p className="text-sm text-slate-600">
              Tap into Together AI for a 2-3 sentence narrative grounded in NASA climate probabilities. Adjust the
              optional prompt to tailor the advice.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={disabled}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isLoading ? "Generating..." : buttonLabel}
            </button>
            {insight && (
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-xl border border-brand/30 px-3 py-2 text-sm font-semibold text-brand-dark transition hover:bg-brand/10"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Custom prompt (optional)
          <textarea
            value={userPrompt}
            onChange={(event) => setUserPrompt(event.target.value)}
            placeholder={DEFAULT_PROMPT}
            rows={3}
            className="w-full rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light disabled:bg-slate-100"
            disabled={!data}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-3 w-5/6 animate-pulse-slow rounded-full bg-slate-200" />
              <div className="h-3 w-4/6 animate-pulse-slow rounded-full bg-slate-200" />
              <div className="h-3 w-2/3 animate-pulse-slow rounded-full bg-slate-200" />
            </div>
          ) : insight ? (
            <div className="space-y-2">
              {insight.split(/\n+/).map((paragraph, index) => (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="leading-relaxed text-slate-600">
              {data ? fallbackInsightMessage : "Pick a location and date, then generate NASA-based probabilities to unlock the AI briefing."}
            </p>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Requires a Together API key stored in your local <code>.env.local</code>. Responses reference historical trends rather
          than deterministic forecasts.
        </p>
      </div>
    </section>
  );
};
