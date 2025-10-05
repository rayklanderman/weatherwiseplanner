import Groq from "groq-sdk";
import { z } from "zod";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // For client-side usage
});

// Schema for parsed user intent
const IntentSchema = z.object({
  location: z.string().optional(),
  dateStart: z.string().optional(), // YYYY-MM-DD
  dateEnd: z.string().optional(), // YYYY-MM-DD
  conditions: z.array(z.string()).optional(),
  query_type: z.enum(["weather_query", "general_chat", "clarification"]),
});

export type ParsedIntent = z.infer<typeof IntentSchema>;

/**
 * Parse user message to extract location, date, and weather conditions
 * Uses Llama 3.1 8B for fast intent parsing
 */
export async function parseUserIntent(userMessage: string): Promise<ParsedIntent> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Fast model for intent parsing
      messages: [
        {
          role: "system",
          content: `You are an intent parser for a weather application. Extract structured data from user queries.

Extract:
1. location: City, state, or place name (e.g., "Delaware", "Boston", "New York")
2. dateStart: Start date in YYYY-MM-DD format
3. dateEnd: End date for ranges (e.g., "last 10 years")
4. conditions: Weather conditions mentioned (extremeHeat, heavyRain, strongWind, frost, drought, flooding)
5. query_type: Type of query (weather_query, general_chat, clarification)

Examples:
- "Weather in Delaware for last 10 years" → {location: "Delaware", dateStart: "2015-01-01", dateEnd: "2025-01-01", query_type: "weather_query"}
- "Show me Boston on July 4th 2024" → {location: "Boston", dateStart: "2024-07-04", query_type: "weather_query"}
- "Extreme heat risk in Arizona" → {location: "Arizona", conditions: ["extremeHeat"], query_type: "weather_query"}
- "What is this app about?" → {query_type: "general_chat"}

Return ONLY valid JSON matching this schema. No markdown, no code blocks.`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.1, // Low temperature for consistent parsing
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from Groq");
    }

    // Parse and validate with Zod
    const parsed = JSON.parse(content);
    return IntentSchema.parse(parsed);
  } catch (error) {
    console.error("Intent parsing failed:", error);
    // Return default intent for general chat
    return {
      query_type: "general_chat",
    };
  }
}

/**
 * Convert relative date ranges to absolute dates
 * Uses Mixtral for complex date reasoning
 */
export async function parseDateRange(dateExpression: string): Promise<{ start: string; end: string }> {
  try {
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768", // Good at structured reasoning
      messages: [
        {
          role: "system",
          content: `Convert relative date expressions to absolute dates. Today is ${new Date().toISOString().split("T")[0]}.

Return JSON with {start: "YYYY-MM-DD", end: "YYYY-MM-DD"}

Examples:
- "last 10 years" → {start: "2015-01-01", end: "2025-01-01"}
- "past 5 years" → {start: "2020-01-01", end: "2025-01-01"}
- "July 4th 2024" → {start: "2024-07-04", end: "2024-07-04"}
- "summer 2023" → {start: "2023-06-21", end: "2023-09-22"}
- "this year" → {start: "2025-01-01", end: "2025-12-31"}

Return ONLY valid JSON. No markdown.`,
        },
        {
          role: "user",
          content: dateExpression,
        },
      ],
      temperature: 0.1,
      max_tokens: 100,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from Groq");
    }

    const parsed = JSON.parse(content);
    return {
      start: parsed.start || new Date().toISOString().split("T")[0],
      end: parsed.end || new Date().toISOString().split("T")[0],
    };
  } catch (error) {
    console.error("Date parsing failed:", error);
    const today = new Date().toISOString().split("T")[0];
    return { start: today, end: today };
  }
}
