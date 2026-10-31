import logging
from typing import List, Dict, Any
from datetime import datetime
import pandas as pd

from app.services.analytics_service import analytics_service
from app.ml.pipeline import ml_pipeline

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def generate_recommendations(self) -> Dict[str, Any]:
        """
        Dynamically generates real recommendations based on actual dataset metrics,
        thresholds, anomalies, and ML prediction insights.
        """
        recs: List[Dict[str, Any]] = []
        df = analytics_service.get_data()
        
        # 1. Zone Supply Deficit / Stress Check (Rule-Based Threshold)
        zone_summary = analytics_service.get_zone_analytics()
        for z in zone_summary.get("zones", []):
            zone_name = z["zone"]
            ratio = z["utilization_ratio"]
            deficit = z["surplus_deficit_mld"]
            
            if z["demand_status"] == "CRITICAL" or ratio > 102:
                recs.append({
                    "id": f"REC-ZONE-CRIT-{zone_name.replace(' ', '')}",
                    "title": f"Critical Supply Deficit in {zone_name}",
                    "priority": "CRITICAL",
                    "zone_or_sector": zone_name,
                    "category": "SUPPLY_ALLOCATION",
                    "type": "Rule-Based Threshold",
                    "reason": f"Consumption ({z['total_consumption_mld']:.1f} MLD) exceeds supply allocation ({z['total_supply_mld']:.1f} MLD) by {abs(deficit):.1f} MLD ({ratio}% utilization).",
                    "supporting_data": f"Net Deficit: {abs(deficit):.1f} MLD; Population affected: {z['population']:,}; LPCD: {z['liters_per_capita_daily']} L/day.",
                    "suggested_action": f"Immediately activate booster stations and reroute {abs(deficit) * 1.15:.1f} MLD from surplus feeder lines to {zone_name}.",
                    "estimated_impact": f"Eliminates water pressure shortfall for {z['population']:,} residents.",
                    "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
                })
            elif z["demand_status"] == "HIGH" or ratio > 95:
                recs.append({
                    "id": f"REC-ZONE-HIGH-{zone_name.replace(' ', '')}",
                    "title": f"High Peak Utilization Warning for {zone_name}",
                    "priority": "HIGH",
                    "zone_or_sector": zone_name,
                    "category": "SUPPLY_ALLOCATION",
                    "type": "Rule-Based Threshold",
                    "reason": f"{zone_name} is operating at {ratio}% capacity with minimal buffer against sudden temperature spikes.",
                    "supporting_data": f"Consumption: {z['total_consumption_mld']:.1f} MLD vs Supply: {z['total_supply_mld']:.1f} MLD (Margin: {deficit:.1f} MLD).",
                    "suggested_action": f"Schedule pre-filling of overhead storage reservoirs in {zone_name} during off-peak night hours (01:00 - 05:00).",
                    "estimated_impact": "Prevents midday supply throttling and pressure drops.",
                    "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
                })

        # 2. Reservoir Depletion Risk Check (Rule-Based Threshold)
        avg_res = float(df["Reservoir_Level_Percent"].mean())
        recent_res = float(df.tail(25)["Reservoir_Level_Percent"].mean())
        if recent_res < 45.0:
            recs.append({
                "id": "REC-RES-DEPLETION",
                "title": "Low Municipal Reservoir Storage Level",
                "priority": "CRITICAL" if recent_res < 35 else "HIGH",
                "zone_or_sector": "All Zones (Central Reservoir)",
                "category": "RESERVOIR_CONSERVATION",
                "type": "Rule-Based Threshold",
                "reason": f"City central reservoir average has fallen to {recent_res:.1f}%, approaching critical reserve margins.",
                "supporting_data": f"Current 25-record average: {recent_res:.1f}% (Baseline year average: {avg_res:.1f}%).",
                "suggested_action": "Enact Level-2 water conservation guidelines, reduce non-essential public park sprinkling, and check upstream intake flows.",
                "estimated_impact": "Preserves approximately 40-60 MLD across municipal distribution network.",
                "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            })

        # 3. Sector Surges and Growth (Rule-Based / Historical Trend)
        sector_summary = analytics_service.get_sector_analytics()
        for s in sector_summary.get("sectors_breakdown", []):
            if s["percentage_share"] > 30.0:
                recs.append({
                    "id": f"REC-SECTOR-MAJOR-{s['sector']}",
                    "title": f"High Sector Demand Concentration: {s['sector']}",
                    "priority": "MEDIUM",
                    "zone_or_sector": f"Sector: {s['sector']}",
                    "category": "EFFICIENCY",
                    "type": "Rule-Based Threshold",
                    "reason": f"{s['sector']} represents {s['percentage_share']}% of all municipal water consumption ({s['total_consumption_mld']:.1f} MLD).",
                    "supporting_data": f"Per-capita daily usage: {s['liters_per_capita_daily']} LPCD; Daily mean: {s['avg_consumption_mld']:.1f} MLD.",
                    "suggested_action": f"Deploy smart acoustic leak detectors and smart meters targeting the top commercial/industrial water meters in {s['sector']}.",
                    "estimated_impact": "Targeted 8-12% efficiency improvement yielding ~15 MLD conservation.",
                    "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
                })

        # 4. Machine Learning Predicted Peak Demand Surge (ML-Generated Insight)
        try:
            batch_pred = ml_pipeline.predict_batch_all({
                "date": "2026-12-31",
                "temperature_c": 31.0,
                "rainfall_mm": 0.0,
                "humidity_percent": 50.0,
                "reservoir_level_percent": 60.0
            })
            if batch_pred.get("critical_count", 0) > 0 or batch_pred.get("high_count", 0) > 0:
                hot_zones = ", ".join(batch_pred.get("high_demand_zones", ["Zone A"]))
                recs.append({
                    "id": "REC-ML-PEAK-FORECAST",
                    "title": "ML Model Forecasts Upcoming High Demand Surge",
                    "priority": "HIGH",
                    "zone_or_sector": hot_zones,
                    "category": "PEAK_MANAGEMENT",
                    "type": "ML-Generated Insight",
                    "reason": f"{ml_pipeline.active_model_name} predicts city demand reaching {batch_pred['total_city_predicted_demand_mld']:.1f} MLD under forecasted warm weather.",
                    "supporting_data": f"{batch_pred['critical_count']} sector-zone sectors flagged critical. High-stress zones identified: {hot_zones}.",
                    "suggested_action": f"Pre-allocate {batch_pred['total_city_predicted_demand_mld'] * 1.05:.1f} MLD total pumping capacity 24 hours in advance to cushion morning surges.",
                    "estimated_impact": "Avoids system-wide pressure collapses during forecast peak.",
                    "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
                })
        except Exception as e:
            logger.warning(f"Could not generate ML peak recommendation: {e}")

        # 5. Pipeline Anomaly / Potential Leakage Detection (ML-Generated Insight)
        # Identify historical dates where actual consumption was drastically higher than predicted
        if ml_pipeline.test_comparison_sample:
            high_error_samples = [
                s for s in ml_pipeline.test_comparison_sample
                if (s["actual"] - s["predicted"]) > 18.0
            ]
            if high_error_samples:
                sample = high_error_samples[0]
                recs.append({
                    "id": f"REC-ML-ANOMALY-{sample['zone'].replace(' ', '')}",
                    "title": f"Unusual Consumption Surge Detected in {sample['zone']}",
                    "priority": "HIGH",
                    "zone_or_sector": f"{sample['zone']} ({sample['sector']})",
                    "category": "LEAKAGE_MONITORING",
                    "type": "ML-Generated Insight",
                    "reason": f"Actual consumption ({sample['actual']} MLD) exceeded ML regression forecast ({sample['predicted']} MLD) by {sample['error']} MLD.",
                    "supporting_data": f"Observed on {sample['date']}; deviation represents a {round(sample['error']/sample['predicted']*100, 1)}% unexplained spike.",
                    "suggested_action": f"Dispatch field leak detection maintenance crews along primary trunk main conduits in {sample['zone']}.",
                    "estimated_impact": "Prevents subterranean main pipeline ruptures and unaccounted-for water loss.",
                    "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
                })

        # 6. Environmental Temperature Sensitivity Planning (ML-Generated Insight)
        env_analytics = analytics_service.get_environmental_analytics()
        temp_slope = env_analytics["regression_slopes"].get("temp_slope_mld_per_celsius", 2.5)
        recs.append({
            "id": "REC-ENV-HEATWAVE",
            "title": "Temperature Dynamic Dispatch Matrix",
            "priority": "MEDIUM",
            "zone_or_sector": "All Sectors (Metropolitan)",
            "category": "PEAK_MANAGEMENT",
            "type": "ML-Generated Insight",
            "reason": f"Analytical regression confirms that every +1°C above seasonal baseline increases demand by +{temp_slope:.2f} MLD.",
            "supporting_data": f"Environmental correlation r = {env_analytics['correlation_matrix']['Temperature_C']['Water_Consumption_MLD']:.2f}.",
            "suggested_action": "Integrate meteorological temperature alerts to automatically adjust treatment plant output pacing 12 hours ahead of forecasted heatwaves.",
            "estimated_impact": "Prevents treatment plant pump bottlenecks during peak midday temperatures.",
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        })

        # Prioritize list: CRITICAL -> HIGH -> MEDIUM -> LOW
        order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        recs.sort(key=lambda r: order.get(r["priority"], 99))

        crit = sum(1 for r in recs if r["priority"] == "CRITICAL")
        high = sum(1 for r in recs if r["priority"] == "HIGH")
        med = sum(1 for r in recs if r["priority"] == "MEDIUM")
        low = sum(1 for r in recs if r["priority"] == "LOW")

        return {
            "total_recommendations": len(recs),
            "critical_count": crit,
            "high_count": high,
            "medium_count": med,
            "low_count": low,
            "recommendations": recs
        }

recommendation_engine = RecommendationEngine()
