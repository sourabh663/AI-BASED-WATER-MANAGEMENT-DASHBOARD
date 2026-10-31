from fastapi import APIRouter
from app.api.endpoints import (
    health,
    dashboard,
    analytics,
    prediction,
    recommendations,
    data,
    model,
    anomalies,
    water_balance,
    assistant,
    reports,
    notifications
)

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(dashboard.router, prefix="/dashboard")
api_router.include_router(analytics.router, prefix="/analytics")
api_router.include_router(anomalies.router, prefix="/analytics")
api_router.include_router(water_balance.router, prefix="/analytics")
api_router.include_router(prediction.router, prefix="/prediction")
api_router.include_router(recommendations.router, prefix="/recommendations")
api_router.include_router(data.router, prefix="/data")
api_router.include_router(model.router, prefix="/model")
api_router.include_router(assistant.router, prefix="/assistant")
api_router.include_router(reports.router, prefix="/reports")
api_router.include_router(notifications.router, prefix="/notifications")
