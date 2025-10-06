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
  const buttonLabel = hasGenerated ? "🔄 Ask AI Again" : "🤖 Get AI Insights NOW!";

  return (
    <section className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-6">
        {/* Header with BIG button */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl">🤖</span>
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">AI Weather Assistant</h2>
              <p className="text-sm text-blue-100 drop-shadow">
                ⚡ Instant insights in under 1 second • Powered by Groq AI
              </p>
            </div>
          </div>
          
          {/* HUGE GENERATE BUTTON */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={disabled}
            className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-nasa-red to-orange-600 px-8 py-6 text-2xl font-bold text-white shadow-xl transition hover:scale-105 hover:shadow-2xl disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-700 disabled:hover:scale-100"
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
        <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
          <p className="mb-2 font-semibold text-white drop-shadow">💡 Ask questions like:</p>
          <ul className="space-y-1 text-sm text-blue-100">
            <li>• "What are the weather patterns for this date?"</li>
            <li>• "Is this a good time for outdoor events?"</li>
            <li>• "What risks should I prepare for?"</li>
            <li>• "How does this compare to typical conditions?"</li>
          </ul>
        </div>

        {/* Optional custom prompt */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-white drop-shadow hover:text-blue-200">
            ➕ Add custom question (optional)
          </summary>
          <textarea
            value={userPrompt}
            onChange={(event) => setUserPrompt(event.target.value)}
            placeholder="e.g., 'I'm planning an outdoor event. What are the weather risks I should prepare for?'"
            rows={3}
            className="mt-2 w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/50 shadow-sm backdrop-blur focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:bg-white/5"
            disabled={!data}
          />
        </details>

        {error && (
          <div className="rounded-lg bg-red-500/20 p-4 backdrop-blur">
            <p className="font-semibold text-white drop-shadow">⚠️ Error:</p>
            <p className="text-sm text-red-100">{error}</p>
          </div>
        )}

        {/* AI Response Box */}
        <div className="min-h-[200px] rounded-2xl border-2 border-white/20 bg-white/5 p-6 shadow-inner backdrop-blur">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/20" />
              <div className="h-4 w-4/6 animate-pulse rounded-full bg-white/20" />
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/20" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/20" />
            </div>
          ) : insight ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white drop-shadow-lg">� AI Insights:</h3>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-lg border-2 border-green-400 bg-green-500/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500/30 backdrop-blur"
                >
                  {copied ? "✅ Copied!" : "📋 Copy Insights"}
                </button>
              </div>
              <div className="space-y-3 text-base leading-relaxed text-white drop-shadow">
                {insight.split(/\n+/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="text-6xl opacity-20">🤖</span>
              <p className="text-lg font-medium text-white drop-shadow">
                {data
                  ? "Click the button above to get AI insights!"
                  : "📍 First, select a location and date on the map above"}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-white/5 p-3 text-xs text-white/80 backdrop-blur">
          <strong className="text-white">How it works:</strong> Our AI analyzes the NASA weather data above and gives you personalized insights in plain language. 
          Responses are based on 40+ years of historical patterns, not forecasts.
        </div>
      </div>
    </section>
  );
};
