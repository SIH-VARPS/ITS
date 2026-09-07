"""Feature builder mirroring src/lib/features/sectionFeatures.ts (raw-run path)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

FEATURE_VERSION = "2"
FEATURE_ORDER = [
    "currentDelayMin",
    "delayTrendMin",
    "sectionMeanRunMin",
    "sectionP80RunMin",
    "hourOfDay",
    "dayOfWeek",
    "season",
    "dayOfJourney",
    "remainingKm",
    "remainingHalts",
    "downstreamOccupancy",
    "weatherCode",
    "precipitationMm",
    "visibilityKm",
    "windSpeedKmph",
    "dwellOverrunMin",
    "speedDeviationKmph",
]

IST = timezone(timedelta(hours=5, minutes=30))


def indian_season(month: int) -> int:
    if month in (12, 1, 2):
        return 1
    if month in (3, 4, 5):
        return 2
    if month in (6, 7, 8, 9):
        return 3
    return 4


def ist_parts(at: datetime) -> dict[str, int]:
    local = at.astimezone(IST)
    return {
        "year": local.year,
        "month": local.month,
        "day": local.day,
        "hour": local.hour,
        "dayOfWeek": (local.weekday() + 1) % 7,  # JS getUTCDay: 0=Sun
    }


def origin_instant(run_date: str, starts_at: float, extra_min: float) -> datetime:
    year, month, day = (int(part) for part in run_date.split("-"))
    midnight_utc = datetime(year, month, day, tzinfo=IST) - timedelta(minutes=0)
    return midnight_utc + timedelta(minutes=starts_at + extra_min)


def _finite(value: Any, fallback: float = 0.0) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return fallback
    return number if number == number else fallback  # noqa: PLR0124  NaN check


def halt_weather(run: dict[str, Any], halt_index: int) -> dict[str, float]:
    weather = run.get("weatherByHalt") or []
    raw = weather[halt_index] if halt_index < len(weather) else 0
    if isinstance(raw, dict):
        return {
            "weatherCode": max(0, int(round(_finite(raw.get("weatherCode"), 0)))),
            "precipitationMm": max(0.0, _finite(raw.get("precipitationMm"), 0)),
            "visibilityKm": max(0.0, _finite(raw.get("visibilityKm"), 0)),
            "windSpeedKmph": max(0.0, _finite(raw.get("windSpeedKmph"), 0)),
        }
    return {
        "weatherCode": max(0, int(round(_finite(raw, 0)))),
        "precipitationMm": 0.0,
        "visibilityKm": 0.0,
        "windSpeedKmph": 0.0,
    }


def build_features_from_raw_run(run: dict[str, Any], halt_index: int, at: datetime) -> dict[str, Any]:
    halts = run["halts"]
    frm = halts[halt_index]
    to = halts[halt_index + 1]
    dest = halts[-1]
    current_delay = float(frm.get("delayMin") or 0)
    lookback = min(3, halt_index)
    earlier = current_delay if lookback == 0 else float(halts[halt_index - lookback].get("delayMin") or 0)
    ist = ist_parts(at)
    occupancy = (run.get("occupancyBySection") or [0] * len(halts))
    occ = occupancy[halt_index] if halt_index < len(occupancy) else 0
    weather = halt_weather(run, halt_index)
    return {
        "trainNo": str(run["trainNo"]),
        "fromStationCode": str(frm["code"]),
        "toStationCode": str(to["code"]),
        "currentDelayMin": current_delay,
        "delayTrendMin": current_delay - earlier,
        "sectionMeanRunMin": float(frm.get("meanRunMin") or 1),
        "sectionP80RunMin": float(frm.get("p80RunMin") or 1),
        "hourOfDay": int(ist["hour"]),
        "dayOfWeek": int(ist["dayOfWeek"]),
        "season": indian_season(int(ist["month"])),
        "dayOfJourney": max(1, int(frm.get("dayOfJourney") or 1)),
        "trainClass": str(run.get("trainClass") or "Unknown"),
        "remainingKm": max(0.0, float(dest["km"]) - float(frm["km"])),
        "remainingHalts": max(0, len(halts) - 1 - halt_index),
        "downstreamOccupancy": max(0.0, float(occ or 0)),
        "weatherCode": weather["weatherCode"],
        "precipitationMm": weather["precipitationMm"],
        "visibilityKm": weather["visibilityKm"],
        "windSpeedKmph": weather["windSpeedKmph"],
        "dwellOverrunMin": 0.0,
        "speedDeviationKmph": 0.0,
    }


def ordered_values(vector: dict[str, Any]) -> list[float]:
    return [float(vector[name]) for name in FEATURE_ORDER]


def at_for_section(run: dict[str, Any], halt_index: int) -> datetime:
    halt = run["halts"][halt_index]
    extra = float(halt.get("dep") or 0) + float(halt.get("delayMin") or 0)
    return origin_instant(str(run["runDate"]), float(run.get("startsAt") or 0), extra)
