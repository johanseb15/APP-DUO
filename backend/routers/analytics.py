from fastapi import APIRouter, Depends, HTTPException, status, Request
from models import DashboardAnalytics
from dependencies import get_current_user

router = APIRouter()

@router.get("/api/{slug}/analytics/dashboard", response_model=DashboardAnalytics)
async def get_dashboard_analytics(
    request: Request,
    slug: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtener analíticas del dashboard"""
    if current_user["restaurant_slug"] != slug:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    analytics = await request.app.state.order_service.get_dashboard_analytics(slug)
    return analytics
