import { useEffect, useState, useRef } from "react";
import { useAiInsights } from "../hooks/useAiInsights";
import { WeatherQueryResponse, WeatherSummary, WeatherConditionKey } from "../types/weather";
import { parseUserIntent } from "../services/intentParser";
import { getCoordinates } from "../services/geocoder";

interface AiChatPanelProps {
  data?: WeatherQueryResponse;
  summaries: WeatherSummary[];
  isQueryLoading: boolean;
  lat: number | null;
  lon: number | null;
  locationName?: string;
  dateOfYear: string;
  // NEW: Callback props for updating app state
  onLocationChange?: (lat: number, lon: number, name: string) => void;
  onDateChange?: (date: string) => void;
  onConditionsChange?: (conditions: WeatherConditionKey[]) => void;
  onAiInsightChange?: (insight: string) => void; // NEW: Track AI insights for export
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export const AiChatPanel = ({ 
  data, 
  summaries, 
  lat,
  lon,
  locationName,
  dateOfYear,
  onLocationChange,
  onDateChange,
  onConditionsChange,
  onAiInsightChange
}: AiChatPanelProps) => {
  const { insight, isLoading, error, generateInsight, reset } = useAiInsights();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isParsingIntent, setIsParsingIntent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      
      // Notify parent component of new AI insight for export
      if (onAiInsightChange) {
        onAiInsightChange(insight);
      }
      
      reset();
    }
  }, [insight, messages, reset, onAiInsightChange]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: trimmed,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      // PHASE 1: Parse user intent (Llama 3.1 8B Instant - Fast!)
      setIsParsingIntent(true);
      const intent = await parseUserIntent(trimmed);
      setIsParsingIntent(false);

      console.log("🔍 Parsed intent:", intent);

      // PHASE 2: Update app state based on intent
      if (intent.query_type === "weather_query") {
        // Update location if detected
        if (intent.location && onLocationChange) {
          const coords = await getCoordinates(intent.location);
          if (coords) {
            onLocationChange(coords.lat, coords.lon, coords.name);
            
            // Add system message about location change
            setMessages(prev => [...prev, {
              role: "system",
              content: `📍 Location updated to **${coords.name}**`,
              timestamp: new Date()
            }]);
          }
        }

        // Update date if detected
        if (intent.dateStart && onDateChange) {
          onDateChange(intent.dateStart);
          
          setMessages(prev => [...prev, {
            role: "system",
            content: `📅 Date updated to **${new Date(intent.dateStart!).toLocaleDateString()}**`,
            timestamp: new Date()
          }]);
        }

        // Update conditions if detected
        if (intent.conditions && intent.conditions.length > 0 && onConditionsChange) {
          // Map user-friendly condition names to WeatherConditionKey
          const conditionMap: Record<string, WeatherConditionKey> = {
            extremeHeat: "very_hot",
            heat: "very_hot",
            hot: "very_hot",
            cold: "very_cold",
            frost: "very_cold",
            rain: "very_wet",
            wet: "very_wet",
            heavyRain: "very_wet",
            flooding: "very_wet",
            wind: "very_windy",
            strongWind: "very_windy",
            windy: "very_windy",
            uncomfortable: "very_uncomfortable",
          };
          
          const mappedConditions = intent.conditions
            .map(c => conditionMap[c.toLowerCase()])
            .filter(Boolean) as WeatherConditionKey[];
          
          if (mappedConditions.length > 0) {
            onConditionsChange(mappedConditions);
            
            setMessages(prev => [...prev, {
              role: "system",
              content: `🌡️ Monitoring: **${mappedConditions.join(', ')}**`,
              timestamp: new Date()
            }]);
          }
        }

        // Wait for data to update after state changes
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // PHASE 3: Generate AI response (use existing hook - Llama 3.3 70B)
      if (!data) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Please select a location on the map first, then I can help you analyze the weather data!",
          timestamp: new Date()
        }]);
        return;
      }

      await generateInsight({
        query: data.query,
        results: data.results,
        metadata: data.metadata,
        summaries,
        userPrompt: trimmed
      });

    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again!",
        timestamp: new Date()
      }]);
    }
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
      <div className="border-b-2 border-nasa-blue bg-gradient-to-r from-nasa-blue to-blue-800 px-6 py-4">
        <div className="flex items-center justify-between">
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
        
        {/* Current Location & Date Bar */}
        {(lat !== null && lon !== null) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📍</span>
              <span className="text-xs font-semibold text-white">
                {locationName || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`}
              </span>
            </div>
            <div className="h-4 w-px bg-white/30" />
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📅</span>
              <span className="text-xs text-blue-200">{dateOfYear}</span>
            </div>
            <div className="ml-auto text-xs text-blue-300">
              ← Select location on map
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-6" style={{ maxHeight: "500px" }}>
        {messages.length === 0 && !data ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-white/10 p-6 backdrop-blur">
              <span className="text-6xl">🗺️</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-white drop-shadow-lg">
                Select a location on the map to start
              </p>
              <p className="mt-2 text-sm text-blue-100">
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
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-nasa-red to-orange-600 text-white"
                      : msg.role === "assistant"
                      ? "border-2 border-white/20 bg-white/95 text-slate-800 backdrop-blur"
                      : "border-2 border-blue-300 bg-gradient-to-br from-blue-100 to-white text-blue-900"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-nasa-blue">
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
            {isParsingIntent && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-100 to-white px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2 text-sm text-purple-700 font-semibold">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-purple-600"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-purple-600" style={{ animationDelay: "0.1s" }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-purple-600" style={{ animationDelay: "0.2s" }}></div>
                    <span className="ml-2">🔍 Parsing your request...</span>
                  </div>
                </div>
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl border-2 border-white/20 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
                  <div className="flex items-center gap-2 text-sm text-nasa-blue font-semibold">
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
        <div className="border-t border-white/20 bg-white/5 px-6 py-3 backdrop-blur">
          <p className="mb-2 text-xs font-semibold text-white/90">💡 Suggested questions:</p>
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
      <div className="border-t-2 border-white/20 bg-white/5 p-4 backdrop-blur">
        {error && (
          <div className="mb-3 rounded-lg bg-red-500/10 border border-red-300 px-3 py-2 text-sm text-red-200">
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
            className="flex-1 rounded-xl border-2 border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-nasa-blue focus:outline-none focus:ring-2 focus:ring-nasa-blue/20 disabled:bg-white/50"
          />
          <button
            onClick={handleSend}
            disabled={!data || !input.trim() || isLoading}
            className="rounded-xl bg-gradient-to-r from-nasa-red to-orange-600 px-6 py-3 font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
        <p className="mt-2 text-xs text-white/70">
          Press <kbd className="rounded bg-white/20 px-1 text-white">Enter</kbd> to send • Powered by Groq AI (sub-second responses)
        </p>
      </div>
    </div>
  );
};
