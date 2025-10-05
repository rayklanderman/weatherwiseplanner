from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np
import pandas as pd

try:
    import xarray as xr  # type: ignore
except Exception:  # pragma: no cover - optional dependency for demo
    xr = None

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "public"
SAMPLE_NETCDF = PUBLIC_DIR / "sample_data" / "merra2_sample_denver_2018_2023.nc"
MOCK_JSON = PUBLIC_DIR / "mock-data" / "mockResponse.json"

LOGGER = logging.getLogger(__name__)

CONDITION_SETTINGS = {
    "very_hot": {
        "variable": "T2M_MAX",
        "threshold": 32.2,
        "unit": "°C",
        "comparison": ">=",
        "description": "Daily max temperature ≥ 32.2°C"
    },
    "very_cold": {
        "variable": "T2M_MIN",
        "threshold": 0.0,
        "unit": "°C",
        "comparison": "<=",
        "description": "Daily min temperature ≤ 0°C (32°F freezing threshold)"
    },
    "very_wet": {
        "variable": "PRECTOT",
        "threshold": 10.0,
        "unit": "mm/day",
        "comparison": ">=",
        "description": "Precipitation ≥ 10 mm/day"
    },
    "very_windy": {
        "variable": "WS10M",
        "threshold": 8.0,
        "unit": "m/s",
        "comparison": ">=",
        "description": "Wind speed ≥ 8 m/s (≈18 mph)"
    },
    "very_uncomfortable": {
        "variable": "T2M",
        "threshold": 35.0,
        "unit": "°C heat index (proxy)",
        "comparison": ">=",
        "description": "Heat index proxy ≥ 35°C (≈95°F)"
    }
}

VARIABLE_TRANSFORMS = {
    "T2M_MAX": lambda values: values - 273.15,
    "T2M_MIN": lambda values: values - 273.15,
    "T2M": lambda values: values - 273.15
}


def _apply_transform(variable: str, values: np.ndarray) -> np.ndarray:
    transform = VARIABLE_TRANSFORMS.get(variable)
    if transform is None:
        return values
    return transform(values)


def _compute_probability(values: np.ndarray, threshold: float, comparison: str) -> Optional[float]:
    finite = values[np.isfinite(values)]
    if finite.size == 0:
        return None
    if comparison == ">=":
        hits = finite >= threshold
    else:
        hits = finite <= threshold
    return float(np.mean(hits) * 100.0)


def _compute_trend(values: np.ndarray) -> Optional[str]:
    finite = values[np.isfinite(values)]
    if finite.size < 12:
        return None
    midpoint = finite.size // 2
    early_mean = float(np.mean(finite[:midpoint]))
    late_mean = float(np.mean(finite[midpoint:]))
    if not np.isfinite(early_mean) or not np.isfinite(late_mean):
        return None
    if abs(early_mean) < 1e-6:
        delta = late_mean - early_mean
        return f"Δ {delta:.1f}"
    percent_change = (late_mean - early_mean) / abs(early_mean) * 100.0
    direction = "increasing" if percent_change > 0 else "declining"
    return f"{direction} {abs(percent_change):.1f}%"


def _dataset_time_range(dataset: xr.Dataset) -> str:
    if "time" not in dataset:
        return "Unavailable"
    time_values = dataset["time"].values
    try:
        time_index = pd.to_datetime(time_values)
        start = time_index.min()
        end = time_index.max()
        if pd.isna(start) or pd.isna(end):
            raise ValueError
        return f"{start.strftime('%Y-%m-%d')} to {end.strftime('%Y-%m-%d')}"
    except Exception:  # pragma: no cover - depends on dataset calendar
        try:
            start = str(time_values[0])
            end = str(time_values[-1])
            return f"{start} to {end}"
        except Exception:
            return "Unavailable"



class WeatherDataFetcher:
    """Fetches NASA-derived weather probability data.

    For hackathon demos, we default to loading the JSON payload baked into the repo. When
    a valid NetCDF file or OPeNDAP URL is supplied, the class aggregates daily climate
    statistics to build probabilities for the requested conditions.
    """

    def __init__(
        self,
        *,
        dataset_uri: Optional[str],
        force_mock: Optional[bool],
        window_days: int,
        allow_mock_fallback: bool = True
    ) -> None:
        self.dataset_uri = dataset_uri
        self.force_mock = force_mock
        self.window_days = max(0, window_days)
        self.allow_mock_fallback = allow_mock_fallback
        self._dataset: Optional[xr.Dataset] = None

    def _load_mock(self) -> Dict[str, Any]:
        with MOCK_JSON.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def _ensure_dataset(self) -> xr.Dataset:
        if xr is None:  # pragma: no cover - optional dependency
            raise RuntimeError("xarray is not available. Install dependencies to use NetCDF mode.")

        if self._dataset is not None:
            return self._dataset

        candidate_uri = self.dataset_uri or (str(SAMPLE_NETCDF) if SAMPLE_NETCDF.exists() else None)
        if not candidate_uri:
            raise FileNotFoundError(
                "No dataset configured. Provide WEATHERWISE_DATASET or add the sample NetCDF under public/sample_data/."
            )

        self._dataset = xr.open_dataset(candidate_uri)  # type: ignore[assignment]
        return self._dataset

    def _window_dataset(
        self,
        dataset: xr.Dataset,
        lat: float,
        lon: float,
        date_of_year: str
    ) -> tuple[xr.Dataset, float, float, int]:
        selection = dataset.sel(lat=lat, lon=lon, method="nearest")

        if "time" not in selection.dims:
            raise ValueError("Dataset must include a 'time' dimension for temporal aggregation.")

        time_index_raw = selection.indexes["time"]  # type: ignore[index]
        if hasattr(time_index_raw, "dayofyear"):
            doy_array = np.asarray(time_index_raw.dayofyear)
        else:
            time_index = pd.DatetimeIndex(time_index_raw)
            doy_array = np.asarray(time_index.dayofyear)
        month, day = map(int, date_of_year.split("-"))
        target = datetime(2001, month, day)
        target_doy = target.timetuple().tm_yday

        diff = np.minimum(np.abs(doy_array - target_doy), 366 - np.abs(doy_array - target_doy))
        mask = diff <= self.window_days

        mask_array = xr.DataArray(mask, coords={"time": selection["time"]}, dims=["time"])
        windowed = selection.where(mask_array, drop=True)

        time_size = int(windowed.sizes.get("time", 0))
        if time_size == 0:
            raise ValueError("No records found for the requested date window.")
        resolved_lat = float(selection["lat"].values) if "lat" in selection.coords else float(lat)
        resolved_lon = float(selection["lon"].values) if "lon" in selection.coords else float(lon)
        return windowed, resolved_lat, resolved_lon, time_size

    def _build_from_dataset(
        self,
        lat: float,
        lon: float,
        date_of_year: str,
        conditions: list[str]
    ) -> Dict[str, Any]:
        if xr is None:
            raise RuntimeError("xarray is not available. Install dependencies to use NetCDF mode.")
        dataset = self._ensure_dataset()
        windowed, resolved_lat, resolved_lon, sample_count = self._window_dataset(
            dataset,
            lat,
            lon,
            date_of_year
        )

        results: Dict[str, Any] = {}

        for condition in conditions:
            settings = CONDITION_SETTINGS.get(condition)
            if not settings:
                continue
            variable = settings["variable"]
            if variable not in windowed:
                LOGGER.debug("Dataset missing variable %s required for %s", variable, condition)
                continue

            values = windowed[variable].values  # type: ignore[assignment]
            values = np.asarray(values, dtype=float).flatten()
            values = _apply_transform(variable, values)

            probability = _compute_probability(values, settings["threshold"], settings["comparison"])
            if probability is None:
                continue

            historical_sample = values[np.isfinite(values)]
            rounded_sample = np.round(historical_sample, 1)
            historical_list = rounded_sample.tolist()[:120]
            trend = _compute_trend(historical_sample) or "stable"

            results[condition] = {
                "probability_percent": round(probability, 1),
                "threshold": {
                    "value": settings["threshold"],
                    "unit": settings["unit"]
                },
                "historical_values": historical_list,
                "trend": trend,
                "description": settings["description"]
            }

        dataset_label: Optional[str] = None
        if self.dataset_uri:
            dataset_label = os.path.basename(self.dataset_uri) if not self.dataset_uri.startswith("http") else self.dataset_uri

        metadata = {
            "data_source": os.getenv("WEATHERWISE_DATA_SOURCE", "MERRA-2 (NASA GES DISC)"),
            "time_range": _dataset_time_range(dataset),
            "units": "Air temperature converted from Kelvin to °C, precipitation mm/day, wind m/s",
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "window_days": self.window_days,
            "samples": sample_count,
            "grid_point": {
                "lat": resolved_lat,
                "lon": resolved_lon
            }
        }
        if dataset_label:
            metadata["dataset_name"] = dataset_label

        return {"results": results, "metadata": metadata}

    def get_payload(self) -> Dict[str, Any]:
        if self.force_mock is True:
            return self._load_mock()

        try:
            dataset = self._ensure_dataset()
            metadata = {
                "data_source": os.getenv("WEATHERWISE_DATA_SOURCE", "MERRA-2 (NASA GES DISC)"),
                "time_range": _dataset_time_range(dataset),
                "units": "Air temperature converted from Kelvin to °C, precipitation mm/day, wind m/s",
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "window_days": self.window_days
            }
            if self.dataset_uri:
                metadata["dataset_name"] = (
                    os.path.basename(self.dataset_uri)
                    if not self.dataset_uri.startswith("http")
                    else self.dataset_uri
                )
            return {"results": {}, "metadata": metadata}
        except Exception as exc:
            if self.force_mock is False or not self.allow_mock_fallback:
                raise
            LOGGER.warning("Falling back to mock dataset: %s", exc)
            return self._load_mock()

    def query(self, lat: float, lon: float, date_of_year: str, conditions: list[str]) -> Dict[str, Any]:
        if self.force_mock is True:
            payload = self._load_mock()
        else:
            try:
                payload = self._build_from_dataset(lat, lon, date_of_year, conditions)
            except Exception as exc:
                if self.force_mock is False or not self.allow_mock_fallback:
                    raise
                LOGGER.warning("Falling back to mock dataset for query: %s", exc)
                payload = self._load_mock()

        payload.setdefault("query", {})
        payload["query"] = {
            "location": {"lat": lat, "lon": lon},
            "date_of_year": date_of_year,
            "conditions": conditions
        }
        return payload


def get_fetcher(force_mock: Optional[bool] = None) -> WeatherDataFetcher:
    if force_mock is None:
        env_force = os.getenv("WEATHERWISE_FORCE_MOCK")
        if env_force is not None:
            force_mock = env_force.lower() in {"1", "true", "yes"}

    dataset_uri = os.getenv("WEATHERWISE_DATASET")
    window_days = int(os.getenv("WEATHERWISE_WINDOW_DAYS", "3"))
    allow_mock_fallback = os.getenv("WEATHERWISE_ALLOW_MOCK_FALLBACK", "1").lower() not in {"0", "false", "no"}

    return WeatherDataFetcher(
        dataset_uri=dataset_uri,
        force_mock=force_mock,
        window_days=window_days,
        allow_mock_fallback=allow_mock_fallback
    )
