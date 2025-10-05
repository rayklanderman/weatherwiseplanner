import { useEffect, useMemo, useState, useRef } from "react";
import { useAiInsights } from "../hooks/useAiInsights";
import { WeatherQueryResponse, WeatherSummary } from "../types/weather";

interface AiChatPanelProps {
  data?: WeatherQueryResponse;
  summaries: WeatherSummary[];
  isQueryLoading: boolean;
  lat: number | null;
  lon: number | null;
  locationName?: string;
  dateOfYear: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export const AiChatPanel = ({ 
  data, 
  summaries, 
  isQueryLoading,
  lat,
  lon,
  locationName,
  dateOfYear
}: AiChatPanelProps) => {
  const { insight, isLoading, error, generateInsight, reset } = useAiInsights();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dataSignature = useMemo(() => {
    if (!data) return "none";
    return JSON.stringify({
      query: data.query,
      results: data.results,
      metadata: data.metadata
    });
  }, [data]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Welcome message when data loads
  useEffect(() => {
    if (data && messages.length === 0) {
      const location = locationName || `${lat?.toFixed(2)}°, ${lon?.toFixed(2)}°`;
      setMessages([
        {
          role: "system",
          content: `🛰️ NASA Data Loaded for **${location}** on **${dateOfYear}**\n\nI'm your AI assistant powered by Groq. Ask me anything about the weather patterns, risks, or planning advice!`,
          timestamp: new Date()
        }
      ]);
    }
  }, [data, lat, lon, locationName, dateOfYear, messages.length]);

  // Handle AI response
  useEffect(() => {
    if (insight && messages[messages.length - 1]?.role !== "assistant") {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: insight,
        timestamp: new Date()
      }]);
      reset();
    }
  }, [insight, messages, reset]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !data || isLoading) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: trimmed,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Generate AI response
    await generateInsight({
      query: data.query,
      results: data.results,
      metadata: data.metadata,
      summaries,
      userPrompt: trimmed
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (confirm("Clear all chat messages?")) {
      setMessages([]);
      reset();
    }
  };

  const handleShareChat = () => {
    const chatText = messages
      .map(m => `[${m.role.toUpperCase()}]: ${m.content}`)
      .join('\n\n');
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(chatText);
      alert("✅ Chat copied to clipboard!");
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = chatText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert("✅ Chat copied to clipboard!");
    }
  };

  const suggestedQuestions = [
    "What are the main weather risks for this location?",
    "Is this suitable for outdoor events?",
    "Should I be concerned about extreme temperatures?",
    "What's the probability of heavy rainfall?",
  ];

  const handleSuggestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border-2 border-nasa-blue bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-nasa-blue bg-gradient-to-r from-nasa-blue to-blue-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold text-white">AI Weather Assistant</h3>
            <p className="text-xs text-blue-200">Powered by Groq AI + NASA Data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <>
              <button
                onClick={handleShareChat}
                className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/30"
                title="Copy chat to clipboard"
              >
                📋 Share
              </button>
              <button
                onClick={handleClearChat}
                className="rounded-lg bg-nasa-red/80 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-nasa-red"
                title="Clear all messages"
              >
                🗑️ Clear
              </button>
            </>
          )}
          <div className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
            ⚡ Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-6" style={{ maxHeight: "500px" }}>
        {messages.length === 0 && !data ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-blue-100 p-6">
              <span className="text-6xl">🗺️</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Select a location on the map to start
              </p>
              <p className="mt-2 text-sm text-gray-500">
                I'll analyze NASA satellite data and answer your questions about weather patterns, risks, and planning.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-nasa-red text-white"
                      : msg.role === "assistant"
                      ? "border-2 border-gray-200 bg-white text-gray-800"
                      : "border-2 border-blue-200 bg-blue-50 text-blue-900"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <span className="text-base">🤖</span> AI Assistant
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content.split("**").map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </div>
                  <div className="mt-2 text-xs opacity-60">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl border-2 border-gray-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-nasa-blue"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-nasa-blue" style={{ animationDelay: "0.1s" }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-nasa-blue" style={{ animationDelay: "0.2s" }}></div>
                    <span className="ml-2">AI is analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Suggested Questions */}
      {data && messages.length <= 1 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
          <p className="mb-2 text-xs font-semibold text-gray-600">💡 Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestion(q)}
                className="rounded-full border border-nasa-blue bg-white px-3 py-1 text-xs text-nasa-blue transition hover:bg-nasa-blue hover:text-white"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t-2 border-gray-200 bg-gray-50 p-4">
        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={data ? "Ask anything about the weather data..." : "Select a location first..."}
            disabled={!data || isLoading}
            className="flex-1 rounded-xl border-2 border-gray-300 px-4 py-3 text-sm focus:border-nasa-blue focus:outline-none focus:ring-2 focus:ring-nasa-blue/20 disabled:bg-gray-100"
          />
          <button
            onClick={handleSend}
            disabled={!data || !input.trim() || isLoading}
            className="rounded-xl bg-nasa-red px-6 py-3 font-bold text-white transition hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Press <kbd className="rounded bg-gray-200 px-1">Enter</kbd> to send • Powered by Groq AI (sub-second responses)
        </p>
      </div>
    </div>
  );
};
