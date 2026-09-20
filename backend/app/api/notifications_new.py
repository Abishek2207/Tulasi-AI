from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, Notification

router = APIRouter()

class ReadNotificationRequest(BaseModel):
    notification_id: int

@router.get("/")
def get_notifications(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Fetch all notifications for the user."""
    notifications = db.exec(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    ).all()
    return notifications

@router.post("/read")
def mark_as_read(
    req: ReadNotificationRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Mark a specific notification as read."""
    notif = db.get(Notification, req.notification_id)
    if notif and notif.user_id == current_user.id:
        notif.is_read = True
        db.add(notif)
        db.commit()
        return {"status": "success"}
    return {"status": "error", "message": "Not found"}
