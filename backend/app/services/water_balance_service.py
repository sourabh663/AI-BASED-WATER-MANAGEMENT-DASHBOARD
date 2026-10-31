import logging
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from app.services.analytics_service import analytics_service
from app.ml.pipeline import ml_pipeline

logger = logging.getLogger(__name__)

class WaterBalanceService:
    def get_water_balance(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        zone: Optional[str] = None,
        sector: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculates municipal water balance across supply allocation, actual consumption,
        and predicted demand. Clearly distinguishes surplus reserves from deficits.
        """
        df = analytics_service.get_data().copy()
        filtered = analytics_service.filter_dataframe(df, start_date, end_date, zone, sector)

        if filtered.empty:
            filtered = df

        total_supply = float(filtered["Water_Supply_MLD"].sum())
        total_consumption = float(filtered["Water_Consumption_MLD"].sum())
        total_predicted = float(filtered["Next_Day_Demand_MLD"].sum())

        net_gap = round(total_supply - total_consumption, 2)
        net_gap_pct = round((net_gap / total_supply) * 100, 2) if total_supply > 0 else 0.0

        if net_gap < 0:
            overall_status = "DEFICIT"
        elif net_gap < (0.05 * total_supply):
            overall_status = "TIGHT_BUFFER"
        else:
            overall_status = "SURPLUS"

        # Zone-wise breakdown
        zone_grp = filtered.groupby("Zone").agg({
            "Water_Supply_MLD": "sum",
            "Water_Consumption_MLD": "sum",
            "Next_Day_Demand_MLD": "sum",
            "Population": "mean"
        }).reset_index()

        zone_items = []
        surplus_count = 0
        deficit_count = 0

        for _, row in zone_grp.iterrows():
            z_name = str(row["Zone"])
            sup = float(row["Water_Supply_MLD"])
            cons = float(row["Water_Consumption_MLD"])
            pred = float(row["Next_Day_Demand_MLD"])
            pop = int(row["Population"])

            gap = round(sup - cons, 2)
            gap_pred = round(sup - pred, 2)
            util = round((cons / sup) * 100, 1) if sup > 0 else 100.0

            if gap < 0:
                b_status = "DEFICIT"
                deficit_count += 1
            elif util > 95:
                b_status = "TIGHT_BUFFER"
                surplus_count += 1
            else:
                b_status = "SURPLUS"
                surplus_count += 1

            zone_items.append({
                "zone": z_name,
                "water_supply_mld": round(sup, 2),
                "actual_consumption_mld": round(cons, 2),
                "predicted_demand_mld": round(pred, 2),
                "gap_mld": gap,
                "gap_predicted_mld": gap_pred,
                "utilization_rate": util,
                "balance_status": b_status,
                "population": pop
            })

        # Sector-wise breakdown
        sector_grp = filtered.groupby("Sector").agg({
            "Water_Supply_MLD": "sum",
            "Water_Consumption_MLD": "sum"
        }).reset_index()

        sector_items = []
        for _, row in sector_grp.iterrows():
            s_name = str(row["Sector"])
            sup = float(row["Water_Supply_MLD"])
            cons = float(row["Water_Consumption_MLD"])
            gap = round(sup - cons, 2)
            share = round((cons / total_consumption) * 100, 2) if total_consumption > 0 else 0.0

            sector_items.append({
                "sector": s_name,
                "water_supply_mld": round(sup, 2),
                "actual_consumption_mld": round(cons, 2),
                "gap_mld": gap,
                "percentage_share": share
            })

        # Daily balance trend
        daily_grp = filtered.groupby("Date").agg({
            "Water_Supply_MLD": "sum",
            "Water_Consumption_MLD": "sum",
            "Next_Day_Demand_MLD": "sum"
        }).reset_index()

        daily_trend = []
        for _, row in daily_grp.iterrows():
            sup = float(row["Water_Supply_MLD"])
            cons = float(row["Water_Consumption_MLD"])
            pred = float(row["Next_Day_Demand_MLD"])
            gap = round(sup - cons, 2)
            daily_trend.append({
                "date": row["Date"].strftime("%Y-%m-%d"),
                "supply": round(sup, 1),
                "consumption": round(cons, 1),
                "predicted_demand": round(pred, 1),
                "net_gap": gap,
                "is_deficit": gap < 0
            })

        # Downsample if more than 90 points for UI performance
        if len(daily_trend) > 90:
            step = len(daily_trend) // 90
            daily_trend = daily_trend[::step]

        explanation = (
            "Water balance represents the arithmetic difference between allocated municipal water supply and recorded consumption. "
            "A positive balance indicates available distribution headroom, while a negative balance highlights an operational supply deficit. "
            "Important: Supply-demand variances reflect allocation adjustments, reserve buffering, or unmetered municipal draw, and are not labeled as physical pipeline leakage."
        )

        return {
            "total_water_supply_mld": round(total_supply, 2),
            "total_water_consumption_mld": round(total_consumption, 2),
            "total_predicted_demand_mld": round(total_predicted, 2),
            "net_gap_mld": net_gap,
            "net_gap_percentage": net_gap_pct,
            "overall_status": overall_status,
            "explanation": explanation,
            "zones": zone_items,
            "sectors": sector_items,
            "daily_balance_trend": daily_trend,
            "surplus_zones_count": surplus_count,
            "deficit_zones_count": deficit_count
        }

water_balance_service = WaterBalanceService()
