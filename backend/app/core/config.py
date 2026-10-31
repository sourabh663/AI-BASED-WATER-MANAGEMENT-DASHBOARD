import os
from pathlib import Path
from typing import List

# Base directory is backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    PROJECT_NAME: str = "AI Water Intelligence Dashboard"
    PROJECT_TAGLINE: str = "Transforming Water Data into Smarter Decisions."
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    # Database
    DATABASE_PATH: Path = BASE_DIR / "water_management.db"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_PATH.as_posix()}")

    # Data & Models
    DATASET_DEFAULT_PATH: Path = BASE_DIR / "data" / "AI_Water_Resource_Dashboard_Dataset.csv"
    DATASET_BACKUP_PATH: Path = BASE_DIR.parent / "AI_Water_Resource_Dashboard_Dataset.csv"
    SAVED_MODELS_DIR: Path = BASE_DIR / "saved_models"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    # Municipal Analytics Thresholds (Documentation: Section 7 & 11)
    # Status rules:
    # - Normal: Consumption < 85% of supply
    # - Moderate: Consumption between 85% and 95% of supply
    # - High: Consumption between 95% and 102% of supply
    # - Critical: Consumption > 102% of supply (deficit) or Reservoir < 35%
    STATUS_NORMAL_SUPPLY_RATIO: float = 0.85
    STATUS_MODERATE_SUPPLY_RATIO: float = 0.95
    STATUS_HIGH_SUPPLY_RATIO: float = 1.02
    CRITICAL_RESERVOIR_PERCENT: float = 35.0

    @classmethod
    def get_dataset_path(cls) -> Path:
        if cls.DATASET_DEFAULT_PATH.exists():
            return cls.DATASET_DEFAULT_PATH
        if cls.DATASET_BACKUP_PATH.exists():
            return cls.DATASET_BACKUP_PATH
        return cls.DATASET_DEFAULT_PATH

settings = Settings()
settings.SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
(BASE_DIR / "data").mkdir(parents=True, exist_ok=True)
