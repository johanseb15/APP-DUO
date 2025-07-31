from fastapi import APIRouter, Depends, HTTPException, status, Request
from models import OrderResponse, OrderCreate, OrderStatusUpdate
from typing import List, Optional
from dependencies import get_current_user

router = APIRouter()

@router.post("/api/{slug}/orders", response_model=OrderResponse)
async def create_order(request: Request, slug: str, order_data: OrderCreate):
    """Crear nuevo pedido"""
    order = await request.app.state.order_service.create_order(slug, order_data)
    return order

@router.get("/api/{slug}/orders", response_model=List[OrderResponse])
async def get_orders(
    request: Request,
    slug: str,
    status_filter: Optional[str] = None,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Obtener pedidos del restaurante"""
    if current_user["restaurant_slug"] != slug:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    orders = await request.app.state.order_service.get_orders_by_restaurant(slug, status_filter, limit)
    return orders

@router.get("/api/{slug}/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    request: Request,
    slug: str,
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtener pedido específico"""
    if current_user["restaurant_slug"] != slug:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    order = await request.app.state.order_service.get_order_by_id(order_id, slug)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return order

@router.put("/api/{slug}/orders/{order_id}/status")
async def update_order_status(
    request: Request,
    slug: str,
    order_id: str,
    status_data: OrderStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Actualizar estado del pedido"""
    if current_user["restaurant_slug"] != slug:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    updated = await request.app.state.order_service.update_order_status(order_id, status_data.status)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {"message": "Estado del pedido actualizado"}
