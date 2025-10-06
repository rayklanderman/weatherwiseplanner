"""
Groq API integration for farmer-friendly weather insights.

This module replaces Together AI with Groq for faster inference and better demo performance.
Groq provides sub-second responses which is critical for farmer user experience.
"""

from __future__ import annotations

import os
from typing import Any, Dict, Iterable, List, Optional

try:
    from groq import Groq, GroqError
except ImportError:
    # Graceful fallback if groq not installed
    Groq = None  # type: ignore
    GroqError = Exception  # type: ignore

DEFAULT_MODEL = "llama-3.3-70b-versatile"
DEFAULT_TIMEOUT = 30.0

# Farmer-friendly label mapping
FARMER_LABELS = {
    "very_hot": "Extreme Heat Days",
    "very_cold": "Frost/Freeze Days",
    "very_wet": "Heavy Rain Days",
    "very_windy": "High Wind Days",
    "very_uncomfortable": "Dangerous Heat Index Days"
}


class GroqClientError(RuntimeError):
    """Raised when the Groq API call fails."""


def _format_condition_lines(results: Dict[str, Any]) -> str:
    """Format weather conditions in farmer-friendly language."""
    lines: List[str] = []
    
    for key, data in results.items():
        if not data:
            continue
            
        probability = data.get("probability_percent")
        threshold = data.get("threshold", {})
        trend = data.get("trend")
        
        label = FARMER_LABELS.get(key, key.replace("_", " ").title())
        
        if probability is not None:
            line_parts = [f"- **{label}**: {probability}% of days historically"]
        else:
            line_parts = [f"- **{label}**"]
        
        if threshold:
            value = threshold.get("value")
            unit = threshold.get("unit")
            if value is not None and unit:
                line_parts.append(f"(when {unit} reaches {value})")
                
        if trend:
            line_parts.append(f"Trend: {trend}")
            
        lines.append(" ".join(line_parts))
        
    return "\n".join(lines)


def _format_summaries(summaries: Optional[Iterable[Dict[str, Any]]]) -> str:
    """Format weather summaries for readability."""
    if not summaries:
        return "None provided"
        
    formatted: List[str] = []
    for summary in summaries:
        label = summary.get("label", "Weather condition")
        message = summary.get("friendlyMessage") or summary.get("friendly_message")
        trend = summary.get("trend")
        
        pieces = [f"* {label}: {message}" if message else f"* {label}"]
        if trend:
            pieces.append(f"(Trend: {trend})")
            
        formatted.append(" ".join(pieces))
        
    return "\n".join(formatted)


def _get_seasonal_context(date_of_year: str) -> str:
    """Add seasonal context for better farming advice."""
    try:
        month = int(date_of_year.split("-")[0])
        
        # Northern hemisphere seasons
        seasons = {
            12: "winter", 1: "winter", 2: "winter",
            3: "spring", 4: "spring", 5: "spring",
            6: "summer", 7: "summer", 8: "summer",
            9: "fall", 10: "fall", 11: "fall"
        }
        
        season = seasons.get(month, "")
        return f" (typically {season} season)" if season else ""
        
    except (ValueError, IndexError):
        return ""


def build_farmer_prompt(payload: Dict[str, Any], user_prompt: Optional[str]) -> str:
    """
    Build farmer-friendly prompt for Groq API.
    
    Focuses on practical agricultural advice rather than technical meteorology.
    Uses plain language that non-experts can understand.
    """
    query = payload.get("query", {})
    metadata = payload.get("metadata", {})
    location = query.get("location", {})
    date_of_year = query.get("date_of_year", "Unknown date")
    
    lat = location.get("lat")
    lon = location.get("lon")
    location_label = (
        location.get("name") or 
        f"{lat:.2f}°N, {lon:.2f}°E" if lat and lon else "Unknown location"
    )

    header = (
        "You are an agricultural and travel planning assistant helping people make informed decisions using NASA satellite weather data. "
        "When asked about historical weather (e.g., 'last 10 years', '2014-2024'), clearly describe the weather PATTERNS and TRENDS from the data. "
        "Provide practical, easy-to-understand advice (3-4 sentences) in plain language. "
        "ALWAYS mention the specific location name (city/town) in your response. "
        "Focus on actionable insights: What should people DO or EXPECT based on these historical patterns? "
        "Avoid technical jargon. Address farming, travel, outdoor events, or holiday planning as appropriate. "
        "End with a subtle suggestion for a follow-up question if relevant (e.g., 'Would you like to know about seasonal variations?' or 'Curious about best travel months?'). "
        "Remember: This is historical data showing what typically happens, not a forecast."
    )

    conditions_block = _format_condition_lines(payload.get("results", {}))
    summaries_block = _format_summaries(payload.get("summaries"))
    time_range = metadata.get("time_range", "Unknown range")
    data_source = metadata.get("data_source", "NASA satellite observations")
    seasonal_context = _get_seasonal_context(date_of_year)

    custom_section = (
        f"\n\n**User's specific question:** {user_prompt}" 
        if user_prompt else ""
    )

    return (
        f"{header}\n\n"
        f"**Location:** {location_label}\n"
        f"**Time of Year:** Around {date_of_year}{seasonal_context}\n"
        f"**Historical Period Analyzed:** {time_range}\n"
        f"**Data Source:** {data_source}\n\n"
        f"**Historical Weather Patterns:**\n"
        f"{conditions_block or 'No specific weather risks identified.'}\n\n"
        f"**Quick Summary:**\n{summaries_block}\n"
        f"{custom_section}\n\n"
        "Provide actionable advice based on these historical patterns. "
        "Always start your response by mentioning the location name. "
        "If asked about a time period (e.g., 'last 10 years'), describe the trends clearly. "
        "Be specific about recommendations for farming, travel, events, or safety precautions. "
        "Optionally end with a friendly follow-up question suggestion in parentheses."
    )


def call_groq_api(
    payload: Dict[str, Any],
    *,
    user_prompt: Optional[str] = None,
    model: Optional[str] = None,
    timeout: float = DEFAULT_TIMEOUT
) -> str:
    """
    Call Groq API for farmer-friendly weather insights.
    
    Args:
        payload: Weather query payload with results and metadata
        user_prompt: Optional custom prompt from the user
        model: Groq model to use (default: llama-3.1-70b-versatile)
        timeout: Request timeout in seconds
        
    Returns:
        AI-generated farming advice as a string
        
    Raises:
        GroqClientError: If the API call fails or API key is missing
    """
    if Groq is None:
        raise GroqClientError(
            "Groq library not installed. Run: pip install groq"
        )
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise GroqClientError(
            "GROQ_API_KEY is not configured. Please add it to your .env.local file.\n"
            "Get a free API key at: https://console.groq.com/"
        )

    prompt = build_farmer_prompt(payload, user_prompt)
    selected_model = model or os.getenv("GROQ_MODEL", DEFAULT_MODEL)

    try:
        client = Groq(api_key=api_key, timeout=timeout)
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a friendly agricultural advisor helping farmers understand "
                        "NASA weather data. Use simple language, avoid jargon, focus on practical actions. "
                        "Think like you're talking to someone who knows farming, not meteorology."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=selected_model,
            temperature=0.5,  # Balanced creativity and consistency
            max_tokens=300,   # ~2-3 sentences of advice
            top_p=0.9         # Nucleus sampling for quality
        )

        content = chat_completion.choices[0].message.content
        if not content:
            raise GroqClientError("Groq API returned empty content.")

        return content.strip()

    except GroqError as e:
        raise GroqClientError(f"Groq API error: {str(e)}") from e
    except Exception as e:
        raise GroqClientError(f"Unexpected error calling Groq: {str(e)}") from e
