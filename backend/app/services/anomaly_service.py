import logging
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

from app.services.analytics_service import analytics_service

logger = logging.getLogger(__name__)

class AnomalyDetectionService:
    def __init__(self):
        self._cached_anomalies: Optional[Dict[str, Any]] = None

    def detect_anomalies(
        self,
        contamination: float = 0.03,
        zone: Optional[str] = None,
        sector: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Uses Isolation Forest and statistical Z-score deviation on the 9,075 municipal records
        to detect unusual spikes or drops in water consumption.
        """
        df = analytics_service.get_data().copy()
        filtered = analytics_service.filter_dataframe(df, start_date, end_date, zone, sector)

        if len(filtered) < 20:
            filtered = df

        # Prepare features for Isolation Forest
        feature_cols = [
            "Water_Consumption_MLD",
            "Water_Supply_MLD",
            "Previous_Day_Consumption_MLD",
            "Temperature_C",
            "Humidity_Percent"
        ]
        X = filtered[feature_cols].copy()

        # Fit Isolation Forest
        iso = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=42
        )
        iso_preds = iso.fit_predict(X) # -1 for anomaly, 1 for normal
        decision_scores = iso.decision_function(X) # lower score = more abnormal

        # Calculate group baseline (Zone + Sector average consumption)
        group_means = df.groupby(["Zone", "Sector"])["Water_Consumption_MLD"].transform("mean")
        group_stds = df.groupby(["Zone", "Sector"])["Water_Consumption_MLD"].transform("std").replace(0, 1.0)
        z_scores = np.abs((filtered["Water_Consumption_MLD"] - group_means) / group_stds)

        anomaly_indices = np.where(iso_preds == -1)[0]
        anomalies_list: List[Dict[str, Any]] = []

        for idx in anomaly_indices:
            row = filtered.iloc[idx]
            actual = float(row["Water_Consumption_MLD"])
            expected = float(row["Previous_Day_Consumption_MLD"])
            diff = actual - expected
            pct_diff = round((diff / expected) * 100, 1) if expected > 0 else 0.0
            
            raw_score = float(decision_scores[idx])
            # Normalize anomaly score from 0.0 to 1.0 (higher = more anomalous)
            norm_score = round(max(0.0, min(1.0, 0.5 - raw_score)), 3)

            z_val = float(z_scores.iloc[idx]) if idx < len(z_scores) else 2.0

            if z_val > 3.0 or abs(pct_diff) > 25.0:
                severity = "CRITICAL"
            elif z_val > 2.0 or abs(pct_diff) > 15.0:
                severity = "HIGH"
            else:
                severity = "ELEVATED"

            if diff > 0:
                exp = f"Consumption surged +{diff:.1f} MLD (+{pct_diff}%) above prior day baseline ({expected:.1f} MLD), representing an unusual peak load at {row['Temperature_C']}°C."
            else:
                exp = f"Consumption dropped {abs(diff):.1f} MLD ({pct_diff}%) below prior day baseline ({expected:.1f} MLD), deviating significantly from expected sectoral pattern."

            anomalies_list.append({
                "id": f"ANO-{row['Zone'].replace(' ', '')}-{row['Date'].strftime('%Y%m%d')}-{idx}",
                "date": row["Date"].strftime("%Y-%m-%d"),
                "zone": str(row["Zone"]),
                "sector": str(row["Sector"]),
                "actual_consumption_mld": round(actual, 2),
                "expected_consumption_mld": round(expected, 2),
                "deviation_mld": round(diff, 2),
                "percentage_deviation": pct_diff,
                "anomaly_score": norm_score,
                "severity": severity,
                "method": "Isolation Forest & Z-Score Residual",
                "explanation": exp
            })

        # Sort anomalies by severity and date
        severity_rank = {"CRITICAL": 0, "HIGH": 1, "ELEVATED": 2}
        anomalies_list.sort(key=lambda a: (severity_rank.get(a["severity"], 9), -abs(a["deviation_mld"])))

        crit_count = sum(1 for a in anomalies_list if a["severity"] == "CRITICAL")
        high_count = sum(1 for a in anomalies_list if a["severity"] == "HIGH")
        elev_count = sum(1 for a in anomalies_list if a["severity"] == "ELEVATED")

        zone_dist = {}
        for a in anomalies_list:
            zone_dist[a["zone"]] = zone_dist.get(a["zone"], 0) + 1

        sector_dist = {}
        for a in anomalies_list:
            sector_dist[a["sector"]] = sector_dist.get(a["sector"], 0) + 1

        return {
            "total_anomalies": len(anomalies_list),
            "critical_count": crit_count,
            "high_count": high_count,
            "elevated_count": elev_count,
            "contamination_rate": contamination,
            "anomalies": anomalies_list[:80], # top 80 for responsive UI
            "zone_distribution": zone_dist,
            "sector_distribution": sector_dist
        }

anomaly_service = AnomalyDetectionService()
