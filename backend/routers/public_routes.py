from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Optional
from models import ProductResponse, CategoryResponse, DeliveryZone, OrderResponse, OrderCreate

router = APIRouter()

# Public Menu endpoints
@router.get("/api/{slug}/menu", response_model=List[ProductResponse])
async def get_menu(request: Request, slug: str):
    """Get all available menu items for a restaurant"""
    products = await request.app.state.product_service.get_products_by_restaurant(slug)
    return products

@router.get("/api/{slug}/menu/category/{category_name}", response_model=List[ProductResponse])
async def get_menu_by_category(request: Request, slug: str, category_name: str):
    """Get menu items by category for a restaurant"""
    # First, find the category ID by name
    categories = await request.app.state.category_service.get_categories_by_restaurant(slug)
    category = next((cat for cat in categories if cat.name.lower() == category_name.lower()), None)
    
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    products = await request.app.state.product_service.get_products_by_restaurant(slug, category_id=category.id)
    return products

# Public Delivery Zones endpoints
@router.get("/api/{slug}/delivery-zones", response_model=List[DeliveryZone])
async def get_delivery_zones(request: Request, slug: str):
    """Get all active delivery zones for a restaurant"""
    restaurant = await request.app.state.restaurant_service.get_by_slug(slug)
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    
    return restaurant.settings.delivery_zones

# Public Order endpoints
@router.post("/api/{slug}/orders", response_model=OrderResponse)
async def create_order(request: Request, slug: str, order_data: OrderCreate):
    """Create a new order for a restaurant"""
    order = await request.app.state.order_service.create_order(slug, order_data)
    return order

@router.get("/api/{slug}/orders/{order_id}", response_model=OrderResponse)
async def get_order(request: Request, slug: str, order_id: str):
    """Get a specific order for a restaurant"""
    order = await request.app.state.order_service.get_order_by_id(order_id, slug)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order
