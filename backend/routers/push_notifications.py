from fastapi import APIRouter, Depends, HTTPException, status, Request
from models import PushSubscription, PushNotificationCreate, PushNotification
from typing import List
from dependencies import get_current_user

router = APIRouter()

@router.post("/push/subscribe")
async def subscribe_to_push(request: Request, subscription_data: PushSubscription):
    """Subscribe to push notifications"""
    success = await request.app.state.push_notification_service.subscribe(subscription_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subscription failed")
    return {"message": "Subscribed successfully"}

@router.post("/admin/push/send")
async def send_push_notification(
    request: Request,
    notification: PushNotificationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Send push notification to all subscribers (admin only)"""
    # In a multi-tenant app, you might want to filter subscribers by restaurant_slug
    # For simplicity, this example sends to all.
    success = await request.app.state.push_notification_service.send_notification(notification)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to send notification")
    return {"message": "Notification sent successfully"}

@router.get("/admin/push/notifications", response_model=List[PushNotification])
async def get_push_notifications_admin(request: Request, current_user: dict = Depends(get_current_user)):
    """Get sent push notifications (admin only)"""
    notifications = await request.app.state.push_notification_service.get_sent_notifications()
    return notifications
