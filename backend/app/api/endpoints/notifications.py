from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.notification_service import notification_service
from app.schemas.schemas import NotificationResponse

router = APIRouter()

@router.get("", response_model=NotificationResponse, tags=["Notification Center"])
def get_notifications(db: Session = Depends(get_db)):
    """
    Fetches centralized operational alerts for high-demand zones,
    reservoir status, anomalous spikes, and forecast surges.
    """
    return notification_service.get_notifications(db)

@router.post("/{notification_id}/read", tags=["Notification Center"])
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    """
    Marks an individual alert as read.
    """
    success = notification_service.mark_as_read(notification_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return {"status": "success", "message": f"Notification {notification_id} marked as read."}

@router.post("/mark-all-read", tags=["Notification Center"])
def mark_all_notifications_read(db: Session = Depends(get_db)):
    """
    Marks all notifications as read.
    """
    count = notification_service.mark_all_as_read(db)
    return {"status": "success", "message": f"{count} notifications marked as read."}
