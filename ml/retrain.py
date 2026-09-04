#!/usr/bin/env python3
"""Scheduled retrain: fit a versioned challenger on the accumulated corpus.

Does not overwrite the serving champion (`src/data/generated/model.json`).
Promotion is a separate Node step (`npm run model:promote`) that applies the
champion/challenger MAE + calibration gate.
"""

from __future__ import annotations

import json
import os
import shutil
import sys
from pathlib import Path

from train import MODEL_PATH, ROOT, fit_and_export

CHALLENGER_PATH = ROOT / "src" / "data" / "generated" / "challenger.json"
MODELS_DIR = ROOT / "src" / "data" / "generated" / "models"
REGISTRY_DIR = ROOT / "ml" / "registry"


def bump_patch(version: str) -> str:
    parts = version.split(".")
    if len(parts) != 3 or not all(part.isdigit() for part in parts):
        return "1.0.1"
    return f"{parts[0]}.{parts[1]}.{int(parts[2]) + 1}"


def champion_version() -> str:
    if not MODEL_PATH.exists():
        return "1.0.0"
    payload = json.loads(MODEL_PATH.read_text(encoding="utf-8"))
    version = payload.get("version")
    return version if isinstance(version, str) and version else "1.0.0"


def main() -> int:
    version = os.environ.get("RETRAIN_VERSION") or bump_patch(champion_version())
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    REGISTRY_DIR.mkdir(parents=True, exist_ok=True)
    dest = MODELS_DIR / f"{version}.json"
    artifact = fit_and_export(dest, version, write_parity=False)
    shutil.copyfile(dest, CHALLENGER_PATH)
    sidecar = {
        "version": version,
        "artifactPath": str(dest.relative_to(ROOT)).replace("\\", "/"),
        "metrics": artifact["metrics"],
        "rowCount": artifact["rowCount"],
        "provenance": artifact["provenance"],
        "trainedAt": artifact["trainedAt"],
    }
    (REGISTRY_DIR / f"{version}.json").write_text(json.dumps(sidecar, indent=2), encoding="utf-8")
    metrics = artifact["metrics"]
    print(
        f"wrote challenger {version} rows={artifact['rowCount']} "
        f"mae={metrics['maeMin']:.3f} p80={metrics['p80Coverage']:.3f} "
        f"path={CHALLENGER_PATH}"
    )
    print("promote with: npm run model:promote")
    return 0


if __name__ == "__main__":
    sys.exit(main())
