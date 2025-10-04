from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional

import json

try:
    import xarray as xr  # type: ignore
except Exception:  # pragma: no cover - optional dependency for demo
    xr = None

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "public"
SAMPLE_NETCDF = PUBLIC_DIR / "sample_data" / "merra2_sample_denver_2018_2023.nc"
MOCK_JSON = PUBLIC_DIR / "mock-data" / "mockResponse.json"


class WeatherDataFetcher:
    """Fetches NASA-derived weather probability data.

    For hackathon demos, we default to loading the JSON payload baked into the repo. When
    a valid NetCDF file is supplied, the class demonstrates how you might tap into it
    using xarray.
    """

    def __init__(self, use_mock: bool = True) -> None:
        self.use_mock = use_mock or not SAMPLE_NETCDF.is_file()

    def _load_mock(self) -> Dict[str, Any]:
        with MOCK_JSON.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def _load_netcdf(self) -> Dict[str, Any]:  # pragma: no cover - demonstration only
        if xr is None:
            raise RuntimeError("xarray is not available. Install dependencies to use NetCDF mode.")
        if not SAMPLE_NETCDF.exists():
            raise FileNotFoundError("Sample NetCDF not found. Please add it under public/sample_data/.")

        dataset = xr.open_dataset(SAMPLE_NETCDF)
        # Placeholder transformation: extract random stats. Real implementation should
        # aggregate by day-of-year and compute exceedance probabilities.
        first_var = list(dataset.data_vars)[0]
        values = dataset[first_var].values.flatten().tolist()[:50]
        dataset.close()
        return {
            "results": {
                "very_hot": {
                    "probability_percent": 18,
                    "threshold": {"value": 32.2, "unit": "°C"},
                    "historical_values": values,
                    "trend": "prototype"
                }
            },
            "metadata": {
                "data_source": "MERRA-2 (sampled)",
                "time_range": "demo",
                "units": "varies",
                "generated_at": ""
            }
        }

    def get_payload(self) -> Dict[str, Any]:
        if self.use_mock:
            return self._load_mock()
        return self._load_netcdf()

    def query(self, lat: float, lon: float, date_of_year: str, conditions: list[str]) -> Dict[str, Any]:
        payload = self.get_payload()
        payload.setdefault("query", {})
        payload["query"] = {
            "location": {"lat": lat, "lon": lon},
            "date_of_year": date_of_year,
            "conditions": conditions
        }
        return payload


def get_fetcher(force_mock: Optional[bool] = None) -> WeatherDataFetcher:
    if force_mock is not None:
        return WeatherDataFetcher(use_mock=force_mock)
    return WeatherDataFetcher(use_mock=True)
