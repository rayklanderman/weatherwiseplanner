from __future__ import annotations

import os
from typing import Any, Dict, Iterable, List, Optional

import httpx

TOGETHER_BASE_URL = "https://api.together.xyz/v1/chat/completions"
DEFAULT_MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct"
DEFAULT_TIMEOUT = 40.0


class TogetherClientError(RuntimeError):
    """Raised when the Together API call fails."""


def _format_condition_lines(results: Dict[str, Any]) -> str:
    lines: List[str] = []
    for key, data in results.items():
        if not data:
            continue
        probability = data.get("probability_percent")
        threshold = data.get("threshold", {})
        trend = data.get("trend")
        line_parts: List[str] = [f"- {key}: {probability}% chance"] if probability is not None else [f"- {key}"]
        if threshold:
            value = threshold.get("value")
            unit = threshold.get("unit")
            if value is not None and unit:
                line_parts.append(f"Threshold {value} {unit}")
        if trend:
            line_parts.append(f"Trend {trend}")
        lines.append("; ".join(line_parts))
    return "\n".join(lines)


def _format_summaries(summaries: Optional[Iterable[Dict[str, Any]]]) -> str:
    if not summaries:
        return "None provided"
    formatted: List[str] = []
    for summary in summaries:
        label = summary.get("label", "Unknown focus")
        message = summary.get("friendlyMessage") or summary.get("friendly_message")
        trend = summary.get("trend")
        pieces = [f"* {label}: {message}" if message else f"* {label}"]
        if trend:
            pieces.append(f"Trend {trend}")
        formatted.append("; ".join(pieces))
    return "\n".join(formatted)


def build_prompt(payload: Dict[str, Any], user_prompt: Optional[str]) -> str:
    query = payload.get("query", {})
    metadata = payload.get("metadata", {})
    location = query.get("location", {})
    date_of_year = query.get("date_of_year", "Unknown date")
    location_label = location.get("name") or f"lat {location.get('lat')}, lon {location.get('lon')}"

    header = (
        "You are a planning assistant using NASA-derived historical climate probabilities. "
        "Provide concise, actionable guidance (2-3 sentences) for an outdoor event planner. "
        "Do not make deterministic forecasts. Reference the data window and note that values come from historical records."
    )

    conditions_block = _format_condition_lines(payload.get("results", {}))
    summaries_block = _format_summaries(payload.get("summaries"))
    time_range = metadata.get("time_range", "Unknown range")
    data_source = metadata.get("data_source", "NASA datasets")

    custom_section = f"\nUser prompt: {user_prompt}" if user_prompt else ""

    return (
        f"{header}\n\n"
        f"Location: {location_label}\n"
        f"Date window: {date_of_year}\n"
        f"Historical period: {time_range}\n"
        f"Data source: {data_source}\n\n"
        f"Hazard probabilities:\n{conditions_block or 'No hazard probabilities provided.'}\n\n"
        f"Summaries:\n{summaries_block}\n"
        f"{custom_section}\n"
        "Respond with planning recommendations that acknowledge uncertainty."
    )


def call_together_api(
    payload: Dict[str, Any],
    *,
    user_prompt: Optional[str] = None,
    model: Optional[str] = None,
    timeout: float = DEFAULT_TIMEOUT
) -> str:
    api_key = os.getenv("TOGETHER_API_KEY")
    if not api_key:
        raise TogetherClientError("TOGETHER_API_KEY is not configured.")

    prompt = build_prompt(payload, user_prompt)
    request_body = {
        "model": model or os.getenv("TOGETHER_MODEL", DEFAULT_MODEL),
        "messages": [
            {"role": "system", "content": "You are an expert outdoor event planning advisor."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.4,
        "max_tokens": 220
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    with httpx.Client(timeout=timeout) as client:
        response = client.post(TOGETHER_BASE_URL, json=request_body, headers=headers)

    if response.status_code >= 400:
        raise TogetherClientError(
            f"Together API error {response.status_code}: {response.text}"
        )

    data = response.json()
    choices = data.get("choices")
    if not choices:
        raise TogetherClientError("Together API returned no choices.")

    content = choices[0].get("message", {}).get("content")
    if not content:
        raise TogetherClientError("Together API response missing content.")

    return content.strip()
```}អ៏'analyse to=functions.create_file code results? It's done. Need update main.py to import and create endpoint. We'll define request model similar to front-end data. We'll create new BaseModel's: maybe define `WeatherConditionResult` etc. For ease, design Pydantic model as `class InsightPayload(BaseModel): query: WeatherQuery; results: Dict[str, WeatherConditionData | None]; metadata: Optional[WeatherMetadata] default {} ; summaries: Optional[List[WeatherSummary]]; user_prompt: Optional[str]`. Need to define `WeatherConditionData`, `WeatherMetadata`, `WeatherSummary`. The `WeatherQuery` defined earlier includes `conditions` list? but the payload data maybe from actual backend? For this endpoint, the frontend will send the same query data that the backend returned. We'll design to match friendly names (like front-end type). We'll ensure field names align with front-end existing types: `probability_percent`, `threshold`, `trend`. We'll define nested classes with alias for camelCase? but front-end uses snake_case? In existing JSON in public mock? yes keys: `probability_percent`, `threshold`, `historical_values`, `trend`. We'll include optional `historical_values` not needed but we can include as optional list. We'll define `class WeatherConditionThreshold(BaseModel)`. For simplicity we can accept any extra fields by `model_config = ConfigDict(extra=