import { useEffect, useMemo, useState } from "react";
import { useAiInsights } from "../hooks/useAiInsights";
import { WeatherQueryResponse, WeatherSummary } from "../types/weather";

interface AiInsightPanelProps {
  data?: WeatherQueryResponse;
  summaries: WeatherSummary[];
  isQueryLoading: boolean;
}

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
    if (!insight || typeof navigator === "undefined" || !navigator.clipboard) {
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
  const buttonLabel = hasGenerated ? "🔄 Ask AI Again" : "🤖 Get AI Farming Advice NOW!";

  return (
    <section className="rounded-2xl border-4 border-pink-400 bg-gradient-to-br from-pink-50 via-white to-rose-50 p-8 shadow-2xl">
      <div className="flex flex-col gap-6">
        {/* Header with BIG button */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl">🤖</span>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">AI Farming Assistant</h2>
              <p className="text-sm text-slate-700">
                ⚡ Instant advice in under 1 second • Powered by Groq AI
              </p>
            </div>
          </div>
          
          {/* HUGE GENERATE BUTTON */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={disabled}
            className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-6 text-2xl font-bold text-white shadow-xl transition hover:scale-105 hover:shadow-2xl disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-400 disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>AI is thinking...</span>
              </>
            ) : (
              <>
                <span>{buttonLabel}</span>
                {!disabled && <span className="text-3xl">→</span>}
              </>
            )}
          </button>
        </div>

        {/* Example questions */}
        <div className="rounded-xl bg-blue-50 p-4">
          <p className="mb-2 font-semibold text-blue-900">💡 Ask questions like:</p>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• "Is this good weather for potato farming?"</li>
            <li>• "What crops should I plant on this date?"</li>
            <li>• "Will there be enough rain for maize?"</li>
            <li>• "Should I worry about frost damage?"</li>
          </ul>
        </div>

        {/* Optional custom prompt */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-brand">
            ➕ Add custom question (optional)
          </summary>
          <textarea
            value={userPrompt}
            onChange={(event) => setUserPrompt(event.target.value)}
            placeholder="e.g., 'I want to plant potatoes. Is the weather suitable? What risks should I prepare for?'"
            rows={3}
            className="mt-2 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-slate-100"
            disabled={!data}
          />
        </details>

        {error && (
          <div className="rounded-lg bg-red-50 p-4">
            <p className="font-semibold text-red-900">⚠️ Error:</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* AI Response Box */}
        <div className="min-h-[200px] rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-inner">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-4/6 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
            </div>
          ) : insight ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">🌾 AI Recommendations:</h3>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-lg border-2 border-green-600 bg-green-50 px-4 py-2 text-sm font-semibold text-green-900 transition hover:bg-green-100"
                >
                  {copied ? "✅ Copied!" : "📋 Copy Advice"}
                </button>
              </div>
              <div className="space-y-3 text-base leading-relaxed text-slate-800">
                {insight.split(/\n+/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="text-6xl opacity-20">🤖</span>
              <p className="text-lg font-medium text-slate-600">
                {data
                  ? "Click the button above to get instant farming advice!"
                  : "📍 First, select a location and date on the map above"}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
          <strong>How it works:</strong> Our AI analyzes the NASA weather data above and gives you personalized farming recommendations in plain language. 
          Responses are based on 40+ years of historical patterns, not forecasts.
        </div>
      </div>
    </section>
  );
};
