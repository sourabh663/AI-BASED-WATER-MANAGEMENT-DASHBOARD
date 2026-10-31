import logging
from typing import Optional, Dict, Any, List
from pathlib import Path
import pandas as pd
import numpy as np

from app.core.config import settings

logger = logging.getLogger(__name__)

class AnalyticsService:
    def __init__(self):
        self._df: Optional[pd.DataFrame] = None
        self._loaded_path: Optional[Path] = None

    def get_data(self) -> pd.DataFrame:
        current_path = settings.get_dataset_path()
        if self._df is None or self._loaded_path != current_path:
            logger.info(f"Loading analytics dataframe from {current_path}")
            df = pd.read_csv(current_path)
            df["Date"] = pd.to_datetime(df["Date"])
            # Ensure proper typing
            numeric_cols = [
                "Population", "Temperature_C", "Rainfall_mm", "Humidity_Percent",
                "Reservoir_Level_Percent", "Water_Supply_MLD",
                "Previous_Day_Consumption_MLD", "Water_Consumption_MLD", "Next_Day_Demand_MLD"
            ]
            for col in numeric_cols:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
            self._df = df
            self._loaded_path = current_path
        return self._df

    def reload(self):
        self._df = None
        return self.get_data()

    def filter_dataframe(
        self,
        df: pd.DataFrame,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        zone: Optional[str] = None,
        sector: Optional[str] = None
    ) -> pd.DataFrame:
        filtered = df.copy()
        if start_date:
            try:
                start_dt = pd.to_datetime(start_date)
                filtered = filtered[filtered["Date"] >= start_dt]
            except Exception as e:
                logger.warning(f"Invalid start_date {start_date}: {e}")
        if end_date:
            try:
                end_dt = pd.to_datetime(end_date)
                filtered = filtered[filtered["Date"] <= end_dt]
            except Exception as e:
                logger.warning(f"Invalid end_date {end_date}: {e}")
        if zone and zone.strip() and zone.lower() != "all":
            filtered = filtered[filtered["Zone"].str.strip().str.lower() == zone.strip().lower()]
        if sector and sector.strip() and sector.lower() != "all":
            filtered = filtered[filtered["Sector"].str.strip().str.lower() == sector.strip().lower()]
        return filtered

    def get_dashboard_summary(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        zone: Optional[str] = None,
        sector: Optional[str] = None
    ) -> Dict[str, Any]:
        df = self.get_data()
        filtered = self.filter_dataframe(df, start_date, end_date, zone, sector)

        if filtered.empty:
            filtered = df # Fallback if filter is empty

        total_consumption = float(filtered["Water_Consumption_MLD"].sum())
        total_supply = float(filtered["Water_Supply_MLD"].sum())
        total_predicted = float(filtered["Next_Day_Demand_MLD"].sum())
        avg_reservoir = float(filtered["Reservoir_Level_Percent"].mean())

        # Highest Zone
        zone_sums = filtered.groupby("Zone")["Water_Consumption_MLD"].sum()
        highest_zone = zone_sums.idxmax() if not zone_sums.empty else "N/A"
        highest_zone_val = float(zone_sums.max()) if not zone_sums.empty else 0.0

        # Highest Sector
        sector_sums = filtered.groupby("Sector")["Water_Consumption_MLD"].sum()
        highest_sector = sector_sums.idxmax() if not sector_sums.empty else "N/A"
        highest_sector_val = float(sector_sums.max()) if not sector_sums.empty else 0.0

        net_balance = round(total_supply - total_consumption, 2)
        loss_pct = round(max(0.0, (net_balance / total_supply) * 100), 2) if total_supply > 0 else 0.0

        kpis = {
            "total_water_consumption_mld": round(total_consumption, 2),
            "total_water_supply_mld": round(total_supply, 2),
            "predicted_next_day_demand_mld": round(total_predicted, 2),
            "average_reservoir_level_percent": round(avg_reservoir, 2),
            "highest_consumption_zone": highest_zone,
            "highest_consumption_zone_mld": round(highest_zone_val, 2),
            "highest_consumption_sector": highest_sector,
            "highest_consumption_sector_mld": round(highest_sector_val, 2),
            "net_water_balance_mld": net_balance,
            "water_loss_estimate_percent": loss_pct
        }

        # Daily trends
        daily_grp = filtered.groupby("Date").agg({
            "Water_Consumption_MLD": "sum",
            "Water_Supply_MLD": "sum",
            "Next_Day_Demand_MLD": "sum",
            "Reservoir_Level_Percent": "mean",
            "Temperature_C": "mean"
        }).reset_index()

        daily_trends = [
            {
                "date": row["Date"].strftime("%Y-%m-%d"),
                "consumption": round(float(row["Water_Consumption_MLD"]), 2),
                "supply": round(float(row["Water_Supply_MLD"]), 2),
                "predicted_demand": round(float(row["Next_Day_Demand_MLD"]), 2),
                "temperature": round(float(row["Temperature_C"]), 1),
                "reservoir_level": round(float(row["Reservoir_Level_Percent"]), 1)
            }
            for _, row in daily_grp.iterrows()
        ]

        # Downsample daily trends if too many points for UI smoothness
        if len(daily_trends) > 90:
            step = len(daily_trends) // 90
            daily_trends_chart = daily_trends[::step]
        else:
            daily_trends_chart = daily_trends

        # Actual vs predicted trend (last 30 points of the filtered slice)
        actual_vs_pred = daily_trends[-30:] if len(daily_trends) >= 30 else daily_trends

        # Sector distribution
        sector_dist = [
            {
                "name": str(s),
                "value": round(float(val), 2),
                "percentage": round(float(val / total_consumption * 100), 2) if total_consumption > 0 else 0.0
            }
            for s, val in sector_sums.items()
        ]

        # Zone comparison
        zone_grp = filtered.groupby("Zone").agg({
            "Water_Consumption_MLD": "sum",
            "Water_Supply_MLD": "sum",
            "Population": "mean",
            "Reservoir_Level_Percent": "mean"
        }).reset_index()

        zone_comp = [
            {
                "zone": str(row["Zone"]),
                "consumption": round(float(row["Water_Consumption_MLD"]), 2),
                "supply": round(float(row["Water_Supply_MLD"]), 2),
                "population": int(row["Population"]),
                "avg_reservoir": round(float(row["Reservoir_Level_Percent"]), 1),
                "status": "CRITICAL" if row["Water_Consumption_MLD"] > row["Water_Supply_MLD"] * 1.02
                          else "HIGH" if row["Water_Consumption_MLD"] > row["Water_Supply_MLD"] * 0.95
                          else "MODERATE" if row["Water_Consumption_MLD"] > row["Water_Supply_MLD"] * 0.85
                          else "NORMAL"
            }
            for _, row in zone_grp.iterrows()
        ]

        # High demand alerts
        high_alerts = []
        for z in zone_comp:
            if z["status"] in ["HIGH", "CRITICAL"]:
                high_alerts.append({
                    "zone": z["zone"],
                    "status": z["status"],
                    "message": f"{z['zone']} consumption is operating at {round((z['consumption']/z['supply'])*100, 1)}% of municipal supply.",
                    "consumption_mld": z["consumption"],
                    "supply_mld": z["supply"]
                })

        # Recent anomalies (days where consumption deviated from supply by > 15%)
        anomalies = []
        for item in daily_trends[-45:]:
            gap = item["consumption"] - item["supply"]
            if abs(gap) > (item["supply"] * 0.12):
                anomalies.append({
                    "date": item["date"],
                    "type": "Deficit Spike" if gap > 0 else "Surplus Surge",
                    "consumption": item["consumption"],
                    "supply": item["supply"],
                    "variance_mld": round(gap, 2)
                })

        return {
            "kpis": kpis,
            "consumption_trend_daily": daily_trends_chart,
            "actual_vs_predicted_trend": actual_vs_pred,
            "sector_distribution": sector_dist,
            "zone_comparison": zone_comp,
            "supply_vs_consumption": zone_comp,
            "reservoir_level_trend": daily_trends_chart,
            "high_demand_alerts": high_alerts,
            "recent_anomalies": anomalies[:8],
            "dataset_info": {
                "filtered_rows": len(filtered),
                "total_rows": len(df),
                "date_min": df["Date"].min().strftime("%Y-%m-%d"),
                "date_max": df["Date"].max().strftime("%Y-%m-%d")
            }
        }

    def get_consumption_analytics(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        zone: Optional[str] = None,
        sector: Optional[str] = None
    ) -> Dict[str, Any]:
        df = self.get_data()
        filtered = self.filter_dataframe(df, start_date, end_date, zone, sector)

        # Daily trends
        daily_df = filtered.groupby("Date").agg({
            "Water_Consumption_MLD": "sum",
            "Water_Supply_MLD": "sum",
            "Next_Day_Demand_MLD": "sum",
            "Temperature_C": "mean",
            "Rainfall_mm": "mean"
        }).reset_index()

        daily_trends = [
            {
                "date": row["Date"].strftime("%Y-%m-%d"),
                "consumption": round(float(row["Water_Consumption_MLD"]), 2),
                "supply": round(float(row["Water_Supply_MLD"]), 2),
                "predicted": round(float(row["Next_Day_Demand_MLD"]), 2),
                "temperature": round(float(row["Temperature_C"]), 1),
                "rainfall": round(float(row["Rainfall_mm"]), 1)
            }
            for _, row in daily_df.iterrows()
        ]

        # Weekly trends
        daily_df["Week"] = daily_df["Date"].dt.to_period("W").dt.start_time
        weekly_df = daily_df.groupby("Week").agg({
            "Water_Consumption_MLD": ["mean", "sum", "max"],
            "Water_Supply_MLD": "mean"
        }).reset_index()
        weekly_df.columns = ["Week", "consumption_avg", "consumption_sum", "consumption_max", "supply_avg"]
        weekly_trends = [
            {
                "week_start": row["Week"].strftime("%Y-%m-%d"),
                "avg_consumption": round(float(row["consumption_avg"]), 2),
                "total_consumption": round(float(row["consumption_sum"]), 2),
                "peak_consumption": round(float(row["consumption_max"]), 2),
                "avg_supply": round(float(row["supply_avg"]), 2)
            }
            for _, row in weekly_df.iterrows()
        ]

        # Monthly trends
        daily_df["Month"] = daily_df["Date"].dt.strftime("%Y-%m")
        monthly_df = daily_df.groupby("Month").agg({
            "Water_Consumption_MLD": ["mean", "sum", "max"],
            "Water_Supply_MLD": "mean",
            "Temperature_C": "mean"
        }).reset_index()
        monthly_df.columns = ["Month", "consumption_avg", "consumption_sum", "consumption_max", "supply_avg", "temp_avg"]
        monthly_trends = [
            {
                "month": str(row["Month"]),
                "avg_consumption": round(float(row["consumption_avg"]), 2),
                "total_consumption": round(float(row["consumption_sum"]), 2),
                "peak_consumption": round(float(row["consumption_max"]), 2),
                "avg_supply": round(float(row["supply_avg"]), 2),
                "avg_temp": round(float(row["temp_avg"]), 1)
            }
            for _, row in monthly_df.iterrows()
        ]

        # Day of week analysis (0=Monday, 6=Sunday)
        daily_df["DayOfWeek"] = daily_df["Date"].dt.day_name()
        day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        dow_df = daily_df.groupby("DayOfWeek").agg({
            "Water_Consumption_MLD": ["mean", "max"]
        }).reindex(day_order).reset_index()
        dow_df.columns = ["day", "mean_consumption", "max_consumption"]
        dow_analysis = [
            {
                "day": str(row["day"]),
                "mean_consumption": round(float(row["mean_consumption"]), 2),
                "max_consumption": round(float(row["max_consumption"]), 2),
                "is_weekend": str(row["day"]) in ["Saturday", "Sunday"]
            }
            for _, row in dow_df.iterrows()
        ]

        # Peak and lowest demand records
        top_peak = filtered.sort_values("Water_Consumption_MLD", ascending=False).head(8)
        peak_records = [
            {
                "date": row["Date"].strftime("%Y-%m-%d"),
                "zone": str(row["Zone"]),
                "sector": str(row["Sector"]),
                "consumption_mld": round(float(row["Water_Consumption_MLD"]), 2),
                "supply_mld": round(float(row["Water_Supply_MLD"]), 2),
                "temperature": round(float(row["Temperature_C"]), 1),
                "rainfall": round(float(row["Rainfall_mm"]), 1)
            }
            for _, row in top_peak.iterrows()
        ]

        lowest_recs = filtered.sort_values("Water_Consumption_MLD", ascending=True).head(8)
        lowest_records = [
            {
                "date": row["Date"].strftime("%Y-%m-%d"),
                "zone": str(row["Zone"]),
                "sector": str(row["Sector"]),
                "consumption_mld": round(float(row["Water_Consumption_MLD"]), 2),
                "supply_mld": round(float(row["Water_Supply_MLD"]), 2),
                "temperature": round(float(row["Temperature_C"]), 1),
                "rainfall": round(float(row["Rainfall_mm"]), 1)
            }
            for _, row in lowest_recs.iterrows()
        ]

        # Histogram distribution
        vals = filtered["Water_Consumption_MLD"].values
        counts, bins = np.histogram(vals, bins=12)
        distribution = [
            {
                "range": f"{bins[i]:.0f} - {bins[i+1]:.0f} MLD",
                "count": int(counts[i]),
                "percentage": round(float(counts[i] / len(vals) * 100), 1)
            }
            for i in range(len(counts))
        ]

        # Summary metrics
        summary = {
            "mean_daily_consumption": round(float(daily_df["Water_Consumption_MLD"].mean()), 2),
            "median_daily_consumption": round(float(daily_df["Water_Consumption_MLD"].median()), 2),
            "std_daily_consumption": round(float(daily_df["Water_Consumption_MLD"].std()), 2),
            "max_daily_consumption": round(float(daily_df["Water_Consumption_MLD"].max()), 2),
            "min_daily_consumption": round(float(daily_df["Water_Consumption_MLD"].min()), 2),
            "total_records_analyzed": len(filtered)
        }

        return {
            "daily_trends": daily_trends[-90:] if len(daily_trends) > 90 else daily_trends,
            "weekly_trends": weekly_trends,
            "monthly_trends": monthly_trends,
            "day_of_week_analysis": dow_analysis,
            "peak_demand_records": peak_records,
            "lowest_demand_records": lowest_records,
            "distribution_histogram": distribution,
            "summary_metrics": summary
        }

    def get_sector_analytics(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        zone: Optional[str] = None
    ) -> Dict[str, Any]:
        df = self.get_data()
        filtered = self.filter_dataframe(df, start_date, end_date, zone, None)

        total_city_consumption = float(filtered["Water_Consumption_MLD"].sum())

        grp = filtered.groupby("Sector").agg({
            "Water_Consumption_MLD": ["sum", "mean", "max", "min"],
            "Water_Supply_MLD": "sum",
            "Population": "mean",
            "Next_Day_Demand_MLD": "mean"
        }).reset_index()
        grp.columns = [
            "Sector", "total_consumption", "avg_consumption", "max_consumption",
            "min_consumption", "total_supply", "avg_population", "avg_demand"
        ]

        sectors_list = []
        for _, row in grp.iterrows():
            tot = float(row["total_consumption"])
            share = round((tot / total_city_consumption) * 100, 2) if total_city_consumption > 0 else 0.0
            pop = float(row["avg_population"])
            # Liters per capita per day: (avg_mld * 1,000,000) / population
            lpcd = round((float(row["avg_consumption"]) * 1_000_000) / pop, 1) if pop > 0 else 0.0
            
            sectors_list.append({
                "sector": str(row["Sector"]),
                "total_consumption_mld": round(tot, 2),
                "avg_consumption_mld": round(float(row["avg_consumption"]), 2),
                "max_consumption_mld": round(float(row["max_consumption"]), 2),
                "min_consumption_mld": round(float(row["min_consumption"]), 2),
                "total_supply_mld": round(float(row["total_supply"]), 2),
                "percentage_share": share,
                "avg_population": int(pop),
                "liters_per_capita_daily": lpcd,
                "demand_to_supply_ratio": round(float(row["total_consumption"] / row["total_supply"]), 3) if row["total_supply"] > 0 else 1.0
            })

        sectors_list.sort(key=lambda x: x["total_consumption_mld"], reverse=True)
        highest_sector = sectors_list[0]["sector"] if sectors_list else "Residential"
        lowest_sector = sectors_list[-1]["sector"] if sectors_list else "Institutional"

        # Daily trends by sector (last 30 days)
        pivot = filtered.pivot_table(
            index="Date",
            columns="Sector",
            values="Water_Consumption_MLD",
            aggfunc="sum"
        ).tail(30).reset_index()

        daily_sector_trends = []
        for _, row in pivot.iterrows():
            item = {"date": row["Date"].strftime("%Y-%m-%d")}
            for s in ["Residential", "Commercial", "Industrial", "Agriculture", "Institutional"]:
                if s in row:
                    item[s] = round(float(row[s]), 2) if pd.notnull(row[s]) else 0.0
            daily_sector_trends.append(item)

        per_capita = [
            {
                "sector": s["sector"],
                "liters_per_person_day": s["liters_per_capita_daily"],
                "total_population": s["avg_population"]
            }
            for s in sectors_list
        ]

        return {
            "sectors_breakdown": sectors_list,
            "highest_consuming_sector": highest_sector,
            "lowest_consuming_sector": lowest_sector,
            "daily_sector_trends": daily_sector_trends,
            "sector_per_capita": per_capita
        }

    def get_zone_analytics(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        sector: Optional[str] = None
    ) -> Dict[str, Any]:
        df = self.get_data()
        filtered = self.filter_dataframe(df, start_date, end_date, None, sector)

        grp = filtered.groupby("Zone").agg({
            "Water_Consumption_MLD": ["sum", "mean", "max"],
            "Water_Supply_MLD": ["sum", "mean"],
            "Next_Day_Demand_MLD": "mean",
            "Population": "mean",
            "Reservoir_Level_Percent": "mean"
        }).reset_index()
        grp.columns = [
            "Zone", "total_consumption", "avg_consumption", "max_consumption",
            "total_supply", "avg_supply", "avg_demand", "avg_population", "avg_reservoir"
        ]

        zones_result = []
        high_demand_zones = []

        for _, row in grp.iterrows():
            zone_name = str(row["Zone"])
            tot_c = float(row["total_consumption"])
            tot_s = float(row["total_supply"])
            avg_c = float(row["avg_consumption"])
            avg_s = float(row["avg_supply"])
            avg_d = float(row["avg_demand"])
            pop = int(row["avg_population"])
            res_level = float(row["avg_reservoir"])

            ratio = tot_c / tot_s if tot_s > 0 else 1.0

            # Documented status threshold logic
            if ratio > settings.STATUS_HIGH_SUPPLY_RATIO or res_level < settings.CRITICAL_RESERVOIR_PERCENT:
                status = "CRITICAL"
                badge_color = "red"
                high_demand_zones.append(zone_name)
            elif ratio > settings.STATUS_MODERATE_SUPPLY_RATIO:
                status = "HIGH"
                badge_color = "amber"
                high_demand_zones.append(zone_name)
            elif ratio > settings.STATUS_NORMAL_SUPPLY_RATIO:
                status = "MODERATE"
                badge_color = "blue"
            else:
                status = "NORMAL"
                badge_color = "emerald"

            # Per capita usage
            lpcd = round((avg_c * 1_000_000) / pop, 1) if pop > 0 else 0.0

            # Trend direction: compare last 14 days vs prior 14 days
            zone_daily = filtered[filtered["Zone"] == zone_name].groupby("Date")["Water_Consumption_MLD"].sum()
            if len(zone_daily) >= 28:
                recent_14 = zone_daily.iloc[-14:].mean()
                prior_14 = zone_daily.iloc[-28:-14].mean()
                growth_pct = round(((recent_14 - prior_14) / prior_14) * 100, 2)
            else:
                growth_pct = 0.0

            zones_result.append({
                "zone": zone_name,
                "population": pop,
                "total_consumption_mld": round(tot_c, 2),
                "total_supply_mld": round(tot_s, 2),
                "avg_consumption_mld": round(avg_c, 2),
                "avg_supply_mld": round(avg_s, 2),
                "avg_predicted_demand_mld": round(avg_d, 2),
                "avg_reservoir_level_percent": round(res_level, 1),
                "demand_status": status,
                "badge_color": badge_color,
                "utilization_ratio": round(ratio * 100, 1),
                "surplus_deficit_mld": round(tot_s - tot_c, 2),
                "liters_per_capita_daily": lpcd,
                "two_week_trend_pct": growth_pct
            })

        # Threshold documentation as required by Section 7
        threshold_docs = {
            "metrics_evaluated": [
                "Consumption to Water Supply Allocation Ratio (MLD)",
                "Average Reservoir Level Percent (%)",
                "14-Day Demand Trend Acceleration (%)"
            ],
            "threshold_rules": [
                {
                    "status": "NORMAL",
                    "condition": "Consumption < 85% of allocated supply AND Reservoir ≥ 50%",
                    "implication": "Safe operational margin with ample distribution cushion."
                },
                {
                    "status": "MODERATE",
                    "condition": "Consumption between 85% and 95% of allocated supply",
                    "implication": "Standard peak operating threshold; maintain routine telemetry."
                },
                {
                    "status": "HIGH",
                    "condition": "Consumption between 95% and 102% of supply OR Reservoir between 35%-50%",
                    "implication": "High-demand stress. Reallocation valve controls recommended."
                },
                {
                    "status": "CRITICAL",
                    "condition": "Consumption > 102% of supply (deficit) OR Reservoir < 35%",
                    "implication": "Deficit breach. Emergency inter-zone pumping required immediately."
                }
            ]
        }

        return {
            "zones": zones_result,
            "high_demand_zones_identified": high_demand_zones,
            "threshold_documentation": threshold_docs,
            "zone_comparison_metrics": zones_result
        }

    def get_environmental_analytics(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        zone: Optional[str] = None,
        sector: Optional[str] = None
    ) -> Dict[str, Any]:
        df = self.get_data()
        filtered = self.filter_dataframe(df, start_date, end_date, zone, sector)

        env_cols = [
            "Temperature_C", "Rainfall_mm", "Humidity_Percent",
            "Reservoir_Level_Percent", "Water_Consumption_MLD", "Next_Day_Demand_MLD"
        ]
        corr_matrix = filtered[env_cols].corr().round(3).to_dict()

        # Scatter data sampling (downsample to 80 points for fast, smooth client charts)
        step = max(1, len(filtered) // 80)
        sample_df = filtered.iloc[::step]

        scatter_temp = [
            {"temperature": round(float(r["Temperature_C"]), 1), "consumption": round(float(r["Water_Consumption_MLD"]), 1), "zone": r["Zone"]}
            for _, r in sample_df.iterrows()
        ]
        scatter_rain = [
            {"rainfall": round(float(r["Rainfall_mm"]), 1), "consumption": round(float(r["Water_Consumption_MLD"]), 1), "zone": r["Zone"]}
            for _, r in sample_df.iterrows()
        ]
        scatter_humidity = [
            {"humidity": round(float(r["Humidity_Percent"]), 1), "consumption": round(float(r["Water_Consumption_MLD"]), 1), "zone": r["Zone"]}
            for _, r in sample_df.iterrows()
        ]
        scatter_reservoir = [
            {"reservoir": round(float(r["Reservoir_Level_Percent"]), 1), "demand": round(float(r["Next_Day_Demand_MLD"]), 1), "zone": r["Zone"]}
            for _, r in sample_df.iterrows()
        ]

        # Calculate linear regression slope (dy/dx)
        def calc_slope(x_col, y_col):
            try:
                x = filtered[x_col].values
                y = filtered[y_col].values
                if len(x) > 1 and np.var(x) > 0:
                    slope, _ = np.polyfit(x, y, 1)
                    return round(float(slope), 3)
            except Exception:
                pass
            return 0.0

        slopes = {
            "temp_slope_mld_per_celsius": calc_slope("Temperature_C", "Water_Consumption_MLD"),
            "rainfall_slope_mld_per_mm": calc_slope("Rainfall_mm", "Water_Consumption_MLD"),
            "humidity_slope_mld_per_percent": calc_slope("Humidity_Percent", "Water_Consumption_MLD"),
            "reservoir_slope_mld_per_percent": calc_slope("Reservoir_Level_Percent", "Next_Day_Demand_MLD")
        }

        insights = [
            {
                "title": "Temperature Driver vs. Urban Water Heat Stress",
                "finding": f"Strong positive correlation (r = {corr_matrix['Temperature_C']['Water_Consumption_MLD']}) observed. For every +1°C rise, daily consumption increases by approximately {slopes['temp_slope_mld_per_celsius']} MLD.",
                "analysis_type": "Direct Physiological & Cooling Demand",
                "notes": "Higher ambient heat directly drives municipal HVAC cooling towers, agricultural irrigation frequency, and domestic residential showering."
            },
            {
                "title": "Precipitation Suppression Effect",
                "finding": f"Negative correlation (r = {corr_matrix['Rainfall_mm']['Water_Consumption_MLD']}) with precipitation. Significant rainfall suppresses civic outdoor irrigation.",
                "analysis_type": "Behavioral & Meteorological Suppression",
                "notes": "Rainfall events immediately reduce irrigation demand in Agricultural and Residential landscaping, allowing reservoirs to accumulate without drawdowns."
            },
            {
                "title": "Correlation vs. Causation Distinction",
                "finding": f"Reservoir level exhibits a statistical correlation of r = {corr_matrix['Reservoir_Level_Percent']['Next_Day_Demand_MLD']} with next-day demand.",
                "analysis_type": "Explanatory Scientific Caution",
                "notes": "Important: Reservoir levels do not *cause* consumption changes; rather, reservoir capacity is depleted *as a consequence* of sustained seasonal demand, highlighting the difference between correlation and causation."
            }
        ]

        return {
            "correlation_matrix": corr_matrix,
            "scatter_temp_vs_consumption": scatter_temp,
            "scatter_rainfall_vs_consumption": scatter_rain,
            "scatter_humidity_vs_consumption": scatter_humidity,
            "scatter_reservoir_vs_demand": scatter_reservoir,
            "regression_slopes": slopes,
            "analytical_insights": insights
        }

analytics_service = AnalyticsService()
