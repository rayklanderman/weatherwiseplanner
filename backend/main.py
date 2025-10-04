from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict, field_validator

from .data_fetcher import get_fetcher
from .ai_insights import TogetherClientError, call_together_api

ROOT = Path(__file__).resolve().parents[1]


class Location(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    name: Optional[str] = None


class WeatherQuery(BaseModel):
    location: Location
    date_of_year: str
    conditions: List[str]

    @field_validator("date_of_year")
    @classmethod
    def validate_date(cls, value: str) -> str:
        try:
            datetime.strptime(value, "%m-%d")
        except ValueError as exc:  # pragma: no cover - validation
            raise ValueError("date_of_year must be formatted as MM-DD") from exc
        return value


class WeatherConditionThreshold(BaseModel):
    value: float
    unit: str


class WeatherConditionResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")
    probability_percent: Optional[float] = None
    threshold: Optional[WeatherConditionThreshold] = None
    trend: Optional[str] = None
    historical_values: Optional[List[float]] = Field(default=None, alias="historical_values")


class WeatherMetadata(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")
    data_source: Optional[str] = None
    time_range: Optional[str] = None
    units: Optional[str] = None
    generated_at: Optional[str] = None


class WeatherSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")
    label: str
    probability: Optional[float] = None
    friendly_message: Optional[str] = Field(default=None, alias="friendlyMessage")
    trend: Optional[str] = None


class InsightRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")
    query: WeatherQuery
    results: Dict[str, Optional[WeatherConditionResult]]
    metadata: WeatherMetadata
    summaries: Optional[List[WeatherSummary]] = None
    user_prompt: Optional[str] = Field(default=None, alias="userPrompt")


app = FastAPI(title="WeatherWise Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "WeatherWise Planner backend is running."}


@app.post("/query")
async def query_weather(payload: WeatherQuery) -> dict:
    if not payload.conditions:
        raise HTTPException(status_code=400, detail="Select at least one weather condition.")

    fetcher = get_fetcher(force_mock=True)
    response = fetcher.query(
        lat=payload.location.lat,
        lon=payload.location.lon,
        date_of_year=payload.date_of_year,
        conditions=payload.conditions
    )
    response.setdefault("metadata", {})
    metadata = response["metadata"]
    metadata.setdefault("generated_at", datetime.utcnow().isoformat() + "Z")
    metadata.setdefault(
        "data_source",
        "MERRA-2 (NASA GES DISC) — demo sample"
    )
    metadata.setdefault("time_range", "2000-01-01 to 2023-12-31")
    metadata.setdefault("units", "SI with conversions applied")
    return response


@app.post("/insights")
async def generate_ai_insight(payload: InsightRequest) -> dict[str, str]:
    try:
        insight = call_together_api(
            payload.model_dump(by_alias=True),
            user_prompt=payload.user_prompt
        )
    except TogetherClientError as exc:  # pragma: no cover - external service
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "insight": insight
    }
