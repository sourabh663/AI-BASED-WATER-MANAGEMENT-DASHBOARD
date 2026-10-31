import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.database.models import DatasetMeta, ModelRecord
from app.ml.pipeline import ml_pipeline
from app.services.analytics_service import analytics_service
from app.services.data_service import data_service
from app.api.api_router import api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("water_management_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    logger.info("Initializing SQLite database tables...")
    Base.metadata.create_all(bind=engine)

    # Validate dataset existence
    data_path = settings.get_dataset_path()
    logger.info(f"Using dataset at: {data_path}")

    # Load or train ML models
    logger.info("Initializing Machine Learning Pipeline...")
    loaded = ml_pipeline.load_artifacts()
    if not loaded:
        logger.info("No saved ML artifacts found. Initiating training pipeline on CSV...")
        try:
            ml_pipeline.train_models(data_path)
            logger.info("Initial ML model training successful.")
        except Exception as e:
            logger.error(f"Error training ML model on startup: {e}")
    else:
        logger.info(f"Loaded active model: {ml_pipeline.active_model_name}")

    # Pre-populate dataset metadata record in SQLite if empty
    db = SessionLocal()
    try:
        existing_meta = db.query(DatasetMeta).first()
        if not existing_meta and data_path.exists():
            overview = data_service.get_overview()
            meta = DatasetMeta(
                filename=overview["filename"],
                file_path=str(data_path),
                row_count=overview["row_count"],
                column_count=overview["column_count"],
                date_range_start=overview["date_range_start"],
                date_range_end=overview["date_range_end"],
                zones_list=", ".join(overview["zones"]),
                sectors_list=", ".join(overview["sectors"]),
                missing_values_count=overview["missing_values_count"],
                duplicate_rows_count=overview["duplicate_rows_count"],
                is_active=True
            )
            db.add(meta)
            db.commit()
    except Exception as e:
        logger.warning(f"Could not initialize dataset meta in DB: {e}")
    finally:
        db.close()

    yield
    # Shutdown tasks
    logger.info("Water Management API shutting down cleanly.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Water Resources Management API with ML Demand Forecasting and Actionable Municipal Decision Support.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/", include_in_schema=False)
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "tagline": settings.PROJECT_TAGLINE,
        "docs_url": "/docs",
        "api_v1": "/api"
    }
