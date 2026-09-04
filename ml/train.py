#!/usr/bin/env python3
"""Train sectional quantile GBTs and export src/data/generated/model.json."""

from __future__ import annotations

import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor

from features import FEATURE_ORDER, FEATURE_VERSION, at_for_section, build_features_from_raw_run, ordered_values

ROOT = Path(__file__).resolve().parents[1]
RAW_PATH = ROOT / "ml" / "data" / "raw-runs.jsonl"
MODEL_PATH = ROOT / "src" / "data" / "generated" / "model.json"
PARITY_PATH = ROOT / "src" / "lib" / "model" / "__fixtures__" / "parity.json"
SKEW_RAW = ROOT / "src" / "lib" / "features" / "__fixtures__" / "skew-raw.json"
PYTHON_VECTORS = ROOT / "src" / "lib" / "features" / "__fixtures__" / "python-vectors.json"

QUANTILES = {"p10": 0.1, "p50": 0.5, "p80": 0.8, "p90": 0.9}


def load_rows() -> list[dict]:
    if not RAW_PATH.exists():
        raise SystemExit(f"missing {RAW_PATH}; run node scripts/generate-training-data.mjs")
    rows: list[dict] = []
    with RAW_PATH.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            run = json.loads(line)
            provenance = run.get("provenance") or "synthetic"
            for halt_index in range(len(run["halts"]) - 1):
                at = at_for_section(run, halt_index)
                vector = build_features_from_raw_run(run, halt_index, at)
                y = float(run["halts"][halt_index + 1]["delayMin"]) - float(run["halts"][halt_index]["delayMin"])
                if not math.isfinite(y):
                    continue
                rows.append(
                    {
                        "trainNo": run["trainNo"],
                        "runDate": run["runDate"],
                        "provenance": provenance,
                        "haltIndex": halt_index,
                        "y": y,
                        "vector": vector,
                    }
                )
    return rows


def export_tree(tree, scale: float) -> dict:
    left = tree.children_left
    right = tree.children_right
    feature = tree.feature
    threshold = tree.threshold
    value = tree.value

    def rec(index: int) -> dict:
        if left[index] == -1:
            return {"kind": "leaf", "value": float(value[index].ravel()[0] * scale)}
        return {
            "kind": "split",
            "featureIndex": int(feature[index]),
            "threshold": float(threshold[index]),
            "left": rec(int(left[index])),
            "right": rec(int(right[index])),
        }

    return rec(0)


def export_estimator(est: GradientBoostingRegressor) -> list[dict]:
    init = float(np.asarray(est.init_.predict(np.zeros((1, len(FEATURE_ORDER))))).ravel()[0])
    trees = [{"kind": "leaf", "value": init}]
    learning_rate = float(est.learning_rate)
    for staged in est.estimators_[:, 0]:
        trees.append(export_tree(staged.tree_, learning_rate))
    return trees


def eval_node(node: dict, values: list[float]) -> float:
    if node["kind"] == "leaf":
        return float(node["value"])
    feature = values[int(node["featureIndex"])]
    if feature is None or (isinstance(feature, float) and math.isnan(feature)):
        return eval_node(node["right"], values)
    if feature <= float(node["threshold"]):
        return eval_node(node["left"], values)
    return eval_node(node["right"], values)


def eval_ensemble(trees: list[dict], values: list[float]) -> float:
    return float(sum(eval_node(tree, values) for tree in trees))


def walk_forward_metrics(X: np.ndarray, y: np.ndarray, dates: np.ndarray) -> dict[str, float]:
    unique = np.array(sorted(set(dates.tolist())))
    if unique.size < 4:
        return {"maeMin": 0.0, "medaeMin": 0.0, "rmseMin": 0.0, "p80Coverage": 0.0}
    cutoff = unique[int(unique.size * 0.7)]
    train_mask = dates < cutoff
    val_mask = dates >= cutoff
    if train_mask.sum() < 50 or val_mask.sum() < 20:
        train_mask = np.ones(len(y), dtype=bool)
        val_mask = np.ones(len(y), dtype=bool)
    model = GradientBoostingRegressor(
        loss="quantile",
        alpha=0.5,
        n_estimators=32,
        max_depth=3,
        learning_rate=0.1,
        min_samples_leaf=20,
        random_state=42,
    )
    model.fit(X[train_mask], y[train_mask])
    pred = model.predict(X[val_mask])
    err = np.abs(y[val_mask] - pred)
    p80 = GradientBoostingRegressor(
        loss="quantile",
        alpha=0.8,
        n_estimators=32,
        max_depth=3,
        learning_rate=0.1,
        min_samples_leaf=20,
        random_state=42,
    )
    p80.fit(X[train_mask], y[train_mask])
    cover = float(np.mean(y[val_mask] <= p80.predict(X[val_mask])))
    return {
        "maeMin": float(np.mean(err)),
        "medaeMin": float(np.median(err)),
        "rmseMin": float(np.sqrt(np.mean((y[val_mask] - pred) ** 2))),
        "p80Coverage": cover,
    }


def fit_and_export(output_path: Path, version: str, *, write_parity: bool = True) -> dict:
    rows = load_rows()
    if len(rows) < 100:
        raise SystemExit(f"not enough training rows: {len(rows)}")
    X = np.array([ordered_values(row["vector"]) for row in rows], dtype=float)
    y = np.array([row["y"] for row in rows], dtype=float)
    dates = np.array([row["runDate"] for row in rows])
    metrics = walk_forward_metrics(X, y, dates)

    trees = {}
    estimators = {}
    for key, alpha in QUANTILES.items():
        est = GradientBoostingRegressor(
            loss="quantile",
            alpha=alpha,
            n_estimators=40,
            max_depth=3,
            learning_rate=0.1,
            min_samples_leaf=16,
            random_state=42,
        )
        est.fit(X, y)
        estimators[key] = est
        trees[key] = export_estimator(est)

    real = sum(1 for row in rows if row["provenance"] == "railradar")
    provenance = "mixed" if real and real < len(rows) else ("railradar" if real else "synthetic")
    artifact = {
        "version": version,
        "featureVersion": FEATURE_VERSION,
        "trainedAt": int(datetime.now(timezone.utc).timestamp() * 1000),
        "rowCount": len(rows),
        "provenance": provenance,
        "featureOrder": FEATURE_ORDER,
        "trees": trees,
        "metrics": metrics,
        "dataSplit": {
            "synthetic": len(rows) - real,
            "railradar": real,
        },
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(artifact), encoding="utf-8")

    if write_parity:
        rng = np.random.default_rng(7)
        pick = rng.choice(len(rows), size=min(100, len(rows)), replace=False)
        parity = []
        for index in pick:
            values = X[int(index)].tolist()
            scored = {key: eval_ensemble(trees[key], values) for key in QUANTILES}
            sklearn_scores = {key: float(estimators[key].predict([values])[0]) for key in QUANTILES}
            for key in QUANTILES:
                if abs(scored[key] - sklearn_scores[key]) > 1e-6:
                    raise SystemExit(f"export drift on {key}: {scored[key]} vs {sklearn_scores[key]}")
            parity.append({"values": values, "expected": scored})
        PARITY_PATH.parent.mkdir(parents=True, exist_ok=True)
        PARITY_PATH.write_text(json.dumps({"featureOrder": FEATURE_ORDER, "rows": parity}), encoding="utf-8")

        if SKEW_RAW.exists():
            raw_runs = json.loads(SKEW_RAW.read_text(encoding="utf-8"))
            python_vectors = []
            for run in raw_runs:
                halt_index = 0 if len(run["halts"]) > 1 else 0
                at = at_for_section(run, halt_index)
                python_vectors.append(
                    {
                        "trainNo": run["trainNo"],
                        "haltIndex": halt_index,
                        "at": at.isoformat(),
                        "vector": build_features_from_raw_run(run, halt_index, at),
                    }
                )
            PYTHON_VECTORS.write_text(json.dumps(python_vectors, indent=2), encoding="utf-8")

    return artifact


def main() -> int:
    artifact = fit_and_export(MODEL_PATH, "1.0.0", write_parity=True)
    metrics = artifact["metrics"]
    print(
        f"wrote {MODEL_PATH} rows={artifact['rowCount']} provenance={artifact['provenance']}"
        f" mae={metrics['maeMin']:.3f}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
