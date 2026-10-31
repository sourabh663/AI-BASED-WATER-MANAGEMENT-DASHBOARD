import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)

def test_health():
    with client:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "Water" in data["service"]

def test_dashboard_summary():
    with client:
        response = client.get("/api/dashboard/summary")
        assert response.status_code == 200
        data = response.json()
        assert "kpis" in data
        assert data["kpis"]["total_water_consumption_mld"] > 0
        assert len(data["zone_comparison"]) == 5
        assert len(data["sector_distribution"]) == 5

def test_zone_analytics():
    with client:
        response = client.get("/api/analytics/zones")
        assert response.status_code == 200
        data = response.json()
        assert len(data["zones"]) == 5
        assert "threshold_documentation" in data

def test_sector_analytics():
    with client:
        response = client.get("/api/analytics/sectors")
        assert response.status_code == 200
        data = response.json()
        assert len(data["sectors_breakdown"]) == 5

def test_environmental_analytics():
    with client:
        response = client.get("/api/analytics/environment")
        assert response.status_code == 200
        data = response.json()
        assert "correlation_matrix" in data
        assert "scatter_temp_vs_consumption" in data

def test_prediction_single():
    with client:
        payload = {
            "zone": "Zone A",
            "sector": "Residential",
            "date": "2026-12-31",
            "temperature_c": 26.5,
            "rainfall_mm": 0.0,
            "humidity_percent": 60.0,
            "reservoir_level_percent": 65.0,
            "water_supply_mld": 250.0,
            "previous_day_consumption_mld": 245.0,
            "water_consumption_mld": 248.0
        }
        response = client.post("/api/prediction/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "predicted_demand_mld" in data
        assert data["predicted_demand_mld"] > 0
        assert data["zone"] == "Zone A"

def test_batch_prediction():
    with client:
        payload = {
            "date": "2026-12-31",
            "temperature_c": 28.0,
            "rainfall_mm": 0.0,
            "humidity_percent": 55.0,
            "reservoir_level_percent": 60.0
        }
        response = client.post("/api/prediction/batch", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert len(data["predictions"]) == 25
        assert data["total_city_predicted_demand_mld"] > 0

def test_recommendations():
    with client:
        response = client.get("/api/recommendations")
        assert response.status_code == 200
        data = response.json()
        assert data["total_recommendations"] > 0
        assert len(data["recommendations"]) > 0

def test_data_overview():
    with client:
        response = client.get("/api/data/overview")
        assert response.status_code == 200
        data = response.json()
        assert data["row_count"] == 9075
        assert data["column_count"] == 12

if __name__ == "__main__":
    test_health()
    print("Health check PASSED")
    test_dashboard_summary()
    print("Dashboard summary PASSED")
    test_zone_analytics()
    print("Zone analytics PASSED")
    test_sector_analytics()
    print("Sector analytics PASSED")
    test_environmental_analytics()
    print("Environmental analytics PASSED")
    test_prediction_single()
    print("Single prediction PASSED")
    test_batch_prediction()
    print("Batch prediction PASSED")
    test_recommendations()
    print("Recommendations PASSED")
    test_data_overview()
    print("Data overview PASSED")
    print("\nALL 9 BACKEND TESTS PASSED SUCCESSFULLY!")
