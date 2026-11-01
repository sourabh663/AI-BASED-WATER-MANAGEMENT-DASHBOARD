# AI Water Intelligence Dashboard

## Intelligent Water Resource Management

> **"Transforming Water Data into Smarter Decisions."**

Monitor water consumption, analyse distribution patterns, forecast future demand and generate actionable insights using artificial intelligence and machine learning.

A complete, production-grade, enterprise AI platform designed for municipal water authorities to monitor daily water consumption, analyze sectoral and regional demand trends, forecast next-day water demand using machine learning regression models, and receive actionable decision-support recommendations.

---

## 👥 Project Engineering Team

1. **SOURABH SINGH** — Roll No. `1240439446`
2. **ANSHUL UPADHYAY** — Roll No. `1240439109`
3. **KHUSHI WALIA** — Roll No. `1240439227`
4. **AMREEN SHAKEEL ALVI** — Roll No. `1240439082`
 

## 🚀 Quick Local Execution

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ and npm (tested on Node.js v26.13 / npm 11.20)

### 1. Start the Backend API (FastAPI)
```powershell
# From project root:
.\start_backend.ps1
# Or manually:
$env:PYTHONPATH = "backend"
python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```
- **Backend URL:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative ReDoc UI:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 2. Start the Frontend Application (React + Vite)
```powershell
# From project root (new terminal window):
.\start_frontend.ps1
# Or manually:
cd frontend
npm run dev
```
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)

---

>>>>>>> 107985d2ed736456f5bd7a3e0af7e9be27671ff5

## 📊 Dataset Specification

- **File:** `AI_Water_Resource_Dashboard_Dataset.csv`
- **Total Records:** 9,075 observations (363 consecutive days &times; 25 combinations/day)
- **Time Span:** `2026-01-02` to `2026-12-30`
- **Total Attributes:** 12 attributes:
  1. `Date` (YYYY-MM-DD datetime)
  2. `Zone` (Zone A, Zone B, Zone C, Zone D, Zone E)
  3. `Sector` (Agriculture, Commercial, Industrial, Institutional, Residential)
  4. `Population` (Demographic population)
  5. `Temperature_C` (Daily average ambient temperature in Celsius)
  6. `Rainfall_mm` (Precipitation in millimeters)
  7. `Humidity_Percent` (Atmospheric relative humidity percentage)
  8. `Reservoir_Level_Percent` (Central storage reservoir level %)
  9. `Water_Supply_MLD` (Allocated municipal water supply in Million Liters per Day)
  10. `Previous_Day_Consumption_MLD` (T-1 daily usage lag)
  11. `Water_Consumption_MLD` (T daily usage observation)
  12. `Next_Day_Demand_MLD` (**Prediction Target** for ML models)

---

## 🧠 Machine Learning Architecture

### Target Variable
`Next_Day_Demand_MLD`

### Input Features & Encoding
- **Lag Consumption:** `Water_Consumption_MLD`, `Previous_Day_Consumption_MLD`
- **Hydrological:** `Water_Supply_MLD`, `Reservoir_Level_Percent`
- **Meteorological:** `Temperature_C`, `Rainfall_mm`, `Humidity_Percent`
- **Demographic:** `Population`
- **Temporal Engineering:** `Month`, `DayOfWeek`, `DayOfYear`, `IsWeekend`
- **Spatial & Sectoral:** One-Hot Encoded dummies for 5 Zones and 5 Sectors

### Train/Test Split (Chronological Order)
Data is split chronologically into an **80% training partition (7,260 records)** and a **20% testing partition (1,815 records)** to guarantee **zero future-target leakage**.

### Model Benchmark & Independent Validation
| Model Architecture | MAE (MLD) | RMSE (MLD) | R² Score | Description |
| :--- | :---: | :---: | :---: | :--- |
| **Persistence Baseline** | 5.39 MLD | 7.68 MLD | 0.9833 | $y_{t+1} = y_t$ naïve forecast |
| **Random Forest Regressor** | 4.76 MLD | 6.81 MLD | 0.9869 | 100 estimators, max depth 14 |
| **XGBoost Regressor (Active)** | **4.56 MLD** | **6.67 MLD** | **0.9874** | 140 estimators, lr 0.08, max depth 6 |

*Academic Note:* The presentation slide 7 reported reference benchmark results (`MAE: 0.14 MLD`, `RMSE: 0.21 MLD`, `R²: 0.93`). The application presents these side-by-side with the dynamically calculated test evaluation.

---

## 🖥️ System Modules & Features

1. **Executive Dashboard (`/`):**
   - Dynamic KPI cards (Total Consumption, Total Supply, Predicted Demand, Avg Reservoir Level, Top Zone, Top Sector).
   - TimeSeries area charts, actual vs predicted demand curve, sector breakdown donut, zone comparison bar, and reservoir storage curve with critical lines.
   - Live high-demand zone alarms.

2. **Consumption Analytics (`/consumption`):**
   - Daily, weekly, and monthly trend aggregation.
   - Day-of-week seasonality (weekday load vs weekend drop).
   - Unimodal frequency distribution histogram.
   - Peak historical surges and minimum baseline records table.

3. **Zone Monitoring (`/zones`):**
   - 5 dedicated zone cards (Zone A, B, C, D, E) showing population, total consumption, allocated supply, reservoir level, and LPCD (liters per capita daily).
   - Dynamic classification: `NORMAL`, `MODERATE`, `HIGH`, `CRITICAL`.
   - Comprehensive documented thresholds table explaining exact operational conditions.

4. **Sector Analysis (`/sectors`):**
   - Deep-dive into Agriculture (38.0%), Industrial (25.1%), Residential (15.7%), Commercial (12.2%), Institutional (9.1%).
   - Comparative bar charts, 30-day multi-line trajectories, per-capita usage.

5. **AI Demand Prediction (`/prediction`):**
   - Single-zone inference form with realistic auto-fill.
   - Confidence interval generation ($\pm 1.96 \times \text{RMSE}$).
   - **City-Wide Batch Forecast Matrix:** Simulates all 25 divisions concurrently, providing total municipal demand, deficit/surplus, and CSV export.
   - SQLite persistent prediction audit history.

6. **Environmental Analytics (`/environment`):**
   - Pearson correlation heatmap (Temperature, Rainfall, Humidity, Reservoir Level).
   - 4 regression scatter plots with trendline slopes.
   - Explanatory scientific analysis distinguishing **correlation from causation**.

7. **AI Decision Support Recommendations (`/recommendations`):**
   - Prioritized operational directives (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
   - Categorized by Supply Allocation, Leakage Monitoring, Peak Management, and Reservoir Conservation.
   - Distinct classification between **Rule-Based Thresholds** and **ML-Generated Insights**.
   - Interactive acknowledge/review controls.

8. **Model Performance (`/model-performance`):**
   - Side-by-side comparison of active model vs persistence baseline and Random Forest.
   - Feature importance rankings horizontal bar chart.
   - Residual distribution histogram.
   - Live model retraining trigger.

9. **Data Management (`/data-management`):**
   - Drag-and-drop CSV upload with schema header and numeric validation.
   - Real-time row, column, missing values, and duplicate detectors.
   - Searchable, sortable paginated records browser.
   - One-click CSV export and instant reset to original 9,075 dataset.

10. **System Settings & Diagnostics (`/settings`):**
    - Municipal threshold tuning.
    - Diagnostics for FastAPI, SQLite, and ML models.
    - University & student project attribution.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React, Axios, React Router 6.
- **Backend:** Python 3.13, FastAPI, Pydantic v2, SQLAlchemy, Uvicorn.
- **Machine Learning & Data:** Scikit-learn, XGBoost, Pandas, NumPy, Joblib.
- **Database:** SQLite (`water_management.db`).
