import logging
import shutil
from typing import Dict, Any, List, Optional
from pathlib import Path
import pandas as pd
import numpy as np

from app.core.config import settings
from app.services.analytics_service import analytics_service
from app.ml.pipeline import ml_pipeline

logger = logging.getLogger(__name__)

EXPECTED_COLUMNS = [
    "Date", "Zone", "Sector", "Population", "Temperature_C",
    "Rainfall_mm", "Humidity_Percent", "Reservoir_Level_Percent",
    "Water_Supply_MLD", "Previous_Day_Consumption_MLD",
    "Water_Consumption_MLD", "Next_Day_Demand_MLD"
]

class DataService:
    def get_overview(self) -> Dict[str, Any]:
        df = analytics_service.get_data()
        current_path = settings.get_dataset_path()
        is_original = (current_path == settings.DATASET_DEFAULT_PATH or current_path == settings.DATASET_BACKUP_PATH)

        cols_info = [
            {"name": col, "type": str(df[col].dtype), "sample": str(df[col].iloc[0]) if len(df) > 0 else ""}
            for col in df.columns
        ]

        missing_count = int(df.isnull().sum().sum())
        duplicate_count = int(df.duplicated().sum())

        return {
            "filename": current_path.name,
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": cols_info,
            "date_range_start": df["Date"].min().strftime("%Y-%m-%d"),
            "date_range_end": df["Date"].max().strftime("%Y-%m-%d"),
            "total_days": int(df["Date"].nunique()),
            "zones": sorted(df["Zone"].unique().tolist()),
            "sectors": sorted(df["Sector"].unique().tolist()),
            "missing_values_count": missing_count,
            "duplicate_rows_count": duplicate_count,
            "is_original": is_original
        }

    def get_records(
        self,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        zone: Optional[str] = None,
        sector: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        sort_by: Optional[str] = "Date",
        sort_asc: bool = False
    ) -> Dict[str, Any]:
        df = analytics_service.get_data()
        filtered = analytics_service.filter_dataframe(df, start_date, end_date, zone, sector)

        # Global search
        if search and search.strip():
            s = search.strip().lower()
            mask = (
                filtered["Zone"].astype(str).str.lower().str.contains(s) |
                filtered["Sector"].astype(str).str.lower().str.contains(s) |
                filtered["Date"].astype(str).str.contains(s)
            )
            filtered = filtered[mask]

        # Sorting
        if sort_by and sort_by in filtered.columns:
            filtered = filtered.sort_values(sort_by, ascending=sort_asc)

        total_records = len(filtered)
        total_pages = max(1, (total_records + page_size - 1) // page_size)
        page = max(1, min(page, total_pages))

        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        page_df = filtered.iloc[start_idx:end_idx]

        records = []
        for _, row in page_df.iterrows():
            record = {}
            for col in df.columns:
                val = row[col]
                if col == "Date":
                    record[col] = val.strftime("%Y-%m-%d")
                elif pd.isna(val):
                    record[col] = None
                elif isinstance(val, (int, float)):
                    record[col] = round(float(val), 2) if isinstance(val, float) else int(val)
                else:
                    record[col] = str(val)
            records.append(record)

        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "records": records
        }

    def validate_and_save_upload(self, temp_file_path: Path, filename: str) -> Dict[str, Any]:
        """
        Validates uploaded CSV file against expected municipal schema and replaces active dataset.
        Triggers ML pipeline retraining.
        """
        try:
            uploaded_df = pd.read_csv(temp_file_path)
        except Exception as e:
            raise ValueError(f"Uploaded file is not a valid CSV: {str(e)}")

        # Check required columns
        missing_cols = [c for c in EXPECTED_COLUMNS if c not in uploaded_df.columns]
        if missing_cols:
            raise ValueError(
                f"Validation failed: Uploaded CSV is missing required columns: {', '.join(missing_cols)}"
            )

        # Validate rows
        if len(uploaded_df) < 50:
            raise ValueError("Validation failed: Dataset must contain at least 50 records for ML processing.")

        # Save to backend data directory
        dest_path = settings.DATASET_DEFAULT_PATH
        shutil.copyfile(temp_file_path, dest_path)

        # Reload analytics cache
        analytics_service.reload()

        # Retrain ML model on newly uploaded dataset
        ml_pipeline.train_models(dest_path)

        return {
            "status": "success",
            "message": f"Dataset '{filename}' successfully validated, uploaded, and ML models retrained.",
            "row_count": len(uploaded_df),
            "column_count": len(uploaded_df.columns)
        }

    def reset_to_original(self) -> Dict[str, Any]:
        """
        Restores the original 9,075 records dataset.
        """
        backup = settings.DATASET_BACKUP_PATH
        dest = settings.DATASET_DEFAULT_PATH

        if backup.exists():
            shutil.copyfile(backup, dest)
            analytics_service.reload()
            ml_pipeline.train_models(dest)
            return {
                "status": "success",
                "message": "Dataset successfully reset to original 9,075 municipal records."
            }
        else:
            analytics_service.reload()
            return {
                "status": "warning",
                "message": "Original backup path not found; reloaded existing dataset."
            }

    def get_data_quality_report(self) -> Dict[str, Any]:
        """
        Calculates comprehensive municipal data quality metrics including completeness,
        uniqueness, schema validity, and outlier distribution.
        """
        df = analytics_service.get_data()
        total_cells = len(df) * len(df.columns)
        missing_cells = int(df.isnull().sum().sum())
        completeness = round(((total_cells - missing_cells) / total_cells) * 100, 2) if total_cells > 0 else 100.0

        dup_rows = int(df.duplicated().sum())
        uniqueness = round(((len(df) - dup_rows) / len(df)) * 100, 2) if len(df) > 0 else 100.0

        # Check numeric validity (no negative values for physical quantities)
        numeric_cols = [
            "Population", "Temperature_C", "Rainfall_mm", "Humidity_Percent",
            "Reservoir_Level_Percent", "Water_Supply_MLD",
            "Previous_Day_Consumption_MLD", "Water_Consumption_MLD", "Next_Day_Demand_MLD"
        ]
        negative_count = 0
        for col in numeric_cols:
            if col in df.columns:
                negative_count += int((df[col] < 0).sum())
        validity = round(max(0.0, 100.0 - (negative_count / max(1, len(df)) * 10)), 2)

        # Check date continuum
        df_dates = pd.to_datetime(df["Date"]).sort_values()
        expected_days = (df_dates.max() - df_dates.min()).days + 1
        actual_days = df_dates.nunique()
        timeliness = round(min(100.0, (actual_days / max(1, expected_days)) * 100), 2)

        # Statistical outliers (> 3.5 std deviations from mean)
        outlier_count = 0
        consumption_vals = df["Water_Consumption_MLD"].values
        mean_c = np.mean(consumption_vals)
        std_c = np.std(consumption_vals)
        if std_c > 0:
            outlier_count = int(np.sum(np.abs(consumption_vals - mean_c) > 3.5 * std_c))

        overall_score = round((completeness * 0.35 + uniqueness * 0.25 + validity * 0.25 + timeliness * 0.15), 1)
        grade = "A+" if overall_score >= 98 else "A" if overall_score >= 92 else "B" if overall_score >= 85 else "C"

        attr_breakdown = []
        for col in df.columns:
            null_count = int(df[col].isnull().sum())
            unique_vals = int(df[col].nunique())
            attr_breakdown.append({
                "column": col,
                "data_type": str(df[col].dtype),
                "completeness_pct": round(((len(df) - null_count) / len(df)) * 100, 1),
                "unique_values_count": unique_vals,
                "sample_value": str(df[col].iloc[0]) if len(df) > 0 else ""
            })

        return {
            "overall_quality_score": overall_score,
            "completeness_score": completeness,
            "uniqueness_score": uniqueness,
            "validity_score": validity,
            "timeliness_score": timeliness,
            "total_records": len(df),
            "valid_records": len(df) - dup_rows,
            "missing_cells": missing_cells,
            "duplicate_rows": dup_rows,
            "zero_or_negative_values": negative_count,
            "outlier_count": outlier_count,
            "quality_grade": grade,
            "attribute_breakdown": attr_breakdown
        }

    def preview_uploaded_csv(self, temp_file_path: Path, filename: str) -> Dict[str, Any]:
        """
        Inspects an uploaded CSV and returns preview metrics before committing changes.
        """
        try:
            preview_df = pd.read_csv(temp_file_path)
        except Exception as e:
            raise ValueError(f"File could not be parsed as CSV: {e}")

        missing_cols = [c for c in EXPECTED_COLUMNS if c not in preview_df.columns]
        if missing_cols:
            return {
                "valid": False,
                "error": f"Missing required columns: {', '.join(missing_cols)}",
                "filename": filename,
                "row_count": len(preview_df),
                "column_count": len(preview_df.columns)
            }

        sample_rows = preview_df.head(5).to_dict(orient="records")
        return {
            "valid": True,
            "filename": filename,
            "row_count": len(preview_df),
            "column_count": len(preview_df.columns),
            "columns": preview_df.columns.tolist(),
            "missing_cells": int(preview_df.isnull().sum().sum()),
            "sample_rows": sample_rows
        }

data_service = DataService()
