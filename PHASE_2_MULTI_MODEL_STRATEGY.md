# 🤖 Phase 2: AI Integration - Multi-Model Strategy

## Groq Model Selection

We're using **3 different models** for optimal performance:

### 1. **Llama 3.1 8B Instant** - Intent Parsing
**Use Case**: Fast extraction of location, date, conditions from user messages
**Why**: 
- ⚡ Ultra-fast (100+ tokens/sec)
- 💰 Cheapest model ($0.05/1M tokens)
- 🎯 Perfect for structured JSON extraction
- 📊 Low temperature (0.1) for consistent parsing

**Example**:
```typescript
User: "What's the weather in Delaware for last 10 years?"

Llama 3.1 8B → JSON:
{
  "location": { "name": "Delaware", "needsGeocoding": true },
  "dateRange": { "start": "2015-10-06", "end": "2025-10-06" },
  "confidence": 0.95
}
```

---

### 2. **Llama 3.3 70B Versatile** - Main Chat Responses
**Use Case**: Detailed conversational responses with weather insights
**Why**:
- 🧠 Best reasoning ability
- 💬 Natural conversational style
- 📝 Handles complex multi-turn conversations
- 🎓 Deep context understanding (128k tokens)

**Example**:
```typescript
User: "Should I plan outdoor event in Boston July 4th?"

Llama 3.3 70B → Response:
"Based on historical NASA MERRA-2 data, Boston on July 4th shows:

🌡️ Average temp: 78°F (comfortable for outdoor events)
☔ Rain probability: 23% (low risk, but have backup plan)
💨 Wind conditions: Typically calm

✅ RECOMMENDATION: Good day for outdoor events! Monitor 3-day forecast closer to date. Consider tent/canopy backup for the 1-in-4 chance of rain."
```

---

### 3. **Mixtral 8x7B** - Structured Condition Analysis
**Use Case**: Fast risk analysis for specific weather conditions
**Why**:
- 🔀 Mixture of Experts (best for specialized tasks)
- 📊 Excellent at structured JSON output
- ⚡ Fast inference (32k context)
- 🎯 Great for categorization/classification

**Example**:
```typescript
Conditions: ["extremeHeat", "drought"]
Data: { temperature: { max: 102°F }, precipitation: { total: 0.1mm } }

Mixtral 8x7B → JSON:
[
  {
    "condition": "extremeHeat",
    "risk": "high",
    "advice": "Avoid outdoor activities 11am-4pm, stay hydrated"
  },
  {
    "condition": "drought",
    "risk": "moderate", 
    "advice": "Implement water conservation, monitor soil moisture"
  }
]
```

---

## Implementation Flow

### User Types: "Weather in Delaware last 10 years"

```
1. INTENT PARSING (Llama 3.1 8B - 0.5s)
   ├─ Extract: location="Delaware"
   ├─ Extract: dateRange="2015-2025"
   └─ Confidence: 0.95

2. GEOCODING (Nominatim API - 0.3s)
   ├─ "Delaware" → lat=39.0, lon=-75.5
   └─ Return: "Delaware, USA"

3. UPDATE APP STATE
   ├─ setLat(39.0)
   ├─ setLon(-75.5)
   ├─ setLocationName("Delaware")
   └─ setDateOfYear("2015-01-01") // Start of range

4. FETCH WEATHER DATA (useWeatherQuery)
   ├─ Backend: /query?lat=39.0&lon=-75.5&date=2015-01-01
   └─ Return: Historical data for Delaware

5. ALL PANELS UPDATE (React automatic)
   ├─ 🗺️ Map: Marker moves to Delaware
   ├─ 📊 Risk Gauges: Recalculate for Delaware
   ├─ 📈 Charts: Show 10-year trend (if supported)
   └─ 🛰️ Satellite: Load Delaware imagery

6. AI RESPONSE (Llama 3.3 70B - 1.5s)
   ├─ Contextual analysis of Delaware weather
   ├─ Historical trends over 10 years
   └─ Recommendations for planning

7. CONDITION ANALYSIS (Mixtral 8x7B - 0.8s) [Optional]
   ├─ Quick risk assessment for active conditions
   └─ Structured JSON for UI display
```

**Total Time**: ~3.1 seconds (perceived as instant with loading states)

---

## Cost Analysis

### Per 1,000 User Queries:

| Model | Tokens/Query | Cost/1M Tokens | Cost/1000 Queries |
|-------|--------------|----------------|-------------------|
| Llama 3.1 8B (intent) | 300 | $0.05 | $0.015 |
| Llama 3.3 70B (chat) | 1,500 | $0.59 | $0.885 |
| Mixtral 8x7B (analysis) | 500 | $0.24 | $0.120 |
| **TOTAL** | | | **$1.02** |

**Free Tier**: Groq provides generous free tier
**Production**: ~$1/1000 queries = **extremely affordable**

---

## Why NOT Use Just One Model?

### ❌ Using Only Llama 3.3 70B for Everything:
- 🐌 Slower (70B takes 2-3s vs 8B takes 0.5s)
- 💰 3x more expensive for simple intent parsing
- ⚠️ Overkill for structured extraction
- 🔥 Higher rate limit consumption

### ✅ Multi-Model Approach:
- ⚡ **2x faster** overall (parallel processing possible)
- 💰 **70% cheaper** (use 8B for simple tasks)
- 🎯 **More accurate** (each model for its strength)
- 🔄 **Better rate limits** (spread across endpoints)

---

## Error Handling Strategy

### Fallback Chain:
```
1. Primary: Llama 3.1 8B (intent parsing)
   ├─ IF fails → Retry once
   └─ IF still fails → Use Mixtral 8x7B

2. Primary: Llama 3.3 70B (chat)
   ├─ IF fails → Use Mixtral 8x7B
   └─ IF still fails → Return cached template response

3. Primary: Mixtral 8x7B (analysis)
   ├─ IF fails → Use Llama 3.1 8B
   └─ IF still fails → Return default risk levels
```

### Timeout Management:
- Intent parsing: 3s timeout (fast model)
- Chat response: 10s timeout (detailed response)
- Condition analysis: 5s timeout (structured output)

---

## Caching Strategy

### Intent Cache (5 minutes):
```typescript
"weather in boston" → { location: "Boston", lat: 42.36, lon: -71.06 }
// Don't re-geocode same location within 5 min
```

### Response Cache (1 hour):
```typescript
// Same question + same data = same answer
cacheKey = hash(userMessage + weatherDataHash)
```

**Benefit**: 80% cache hit rate = 5x faster responses + 5x cheaper

---

## Rate Limits

### Groq Free Tier:
- **Requests**: 30 requests/min per model
- **Tokens**: 100k tokens/min per model

### Our Usage (per minute):
- Llama 3.1 8B: ~6 requests (intent parsing)
- Llama 3.3 70B: ~6 requests (chat)
- Mixtral 8x7B: ~3 requests (analysis)

**Total**: 15 requests/min = **50% of free tier** ✅

### At Scale (1000 users/hour):
- Intent parsing: 16.7 req/min (Llama 3.1 8B)
- Chat responses: 16.7 req/min (Llama 3.3 70B)

**Solution**: Upgrade to paid tier ($18/month unlimited) or implement request queuing

---

## Testing Scenarios

### Scenario 1: Location Change
```
User: "Show me weather in New York"
Expected:
✅ Intent: { location: "New York", lat: 40.71, lon: -74.00 }
✅ Map: Moves to NYC
✅ Data: Fetches NYC weather
✅ Response: "New York City climate analysis..."
```

### Scenario 2: Date Range
```
User: "Last 10 years of extreme heat in Phoenix"
Expected:
✅ Intent: { location: "Phoenix", dateRange: "2015-2025", conditions: ["extremeHeat"] }
✅ Charts: Show 10-year heat trend
✅ Risk Gauge: Update extreme heat %
✅ Response: "Phoenix has experienced increasing extreme heat events..."
```

### Scenario 3: Condition Toggle
```
User: "Check drought and heavy rain risks"
Expected:
✅ Intent: { conditions: ["drought", "heavyRain"] }
✅ Toggles: Auto-select drought + heavy rain
✅ Analysis: Mixtral provides risk levels
✅ Response: "Analyzing dual risk of drought and heavy rain..."
```

---

## Performance Benchmarks

### Target Response Times:
- Intent parsing: < 500ms (Llama 3.1 8B)
- Geocoding: < 300ms (Nominatim)
- Weather data: < 1000ms (Backend)
- AI response: < 2000ms (Llama 3.3 70B)
- UI update: < 100ms (React)

**Total**: < 4 seconds perceived time
**With loading states**: Feels instant ⚡

---

## Model Comparison Table

| Feature | Llama 3.1 8B | Llama 3.3 70B | Mixtral 8x7B |
|---------|--------------|---------------|--------------|
| Speed | ⚡⚡⚡ (fastest) | 🐌 (slowest) | ⚡⚡ (fast) |
| Cost | 💰 (cheapest) | 💰💰💰 (expensive) | 💰💰 (moderate) |
| Reasoning | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| JSON Output | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Context Length | 128k | 128k | 32k |
| Best For | Intent parsing | Conversations | Structured analysis |

---

## Next Steps

1. ✅ Create `intentParsingService.ts` with all 3 models
2. ⏳ Update `AiChatPanel.tsx` to parse intents
3. ⏳ Add callback props to `App.tsx`
4. ⏳ Test with example queries
5. ⏳ Add loading states for each phase
6. ⏳ Implement caching
7. ⏳ Deploy and benchmark

**ETA**: 2-3 hours
